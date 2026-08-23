// Solicitudes · Becas o descuentos — listShell + recordForm. Al aprobar,
// el registro queda disponible tal cual en Financiero › Becas (misma fuente
// de datos, UCLA.data.solicitudesBecas).
(function () {
    // Estados reales que puede tomar una solicitud de beca (creación +
    // resolución en "Resolver solicitud" más abajo); cada casilla filtra de
    // verdad (activos.includes(f.estado)), no una etiqueta decorativa.
    const ESTADOS_FILTRO = ['Recibida', 'En revisión', 'Aprobada', 'Rechazada'];
    const CAMPOS_MODULO = ESTADOS_FILTRO;
    let clickHandler = null;

    function filtrarPorCampos(f, activos) {
        return activos.includes(f.estado);
    }

    function columnas() {
        return [
            { clave: 'radicado', etiqueta: 'Radicado', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.radicado}</span>` },
            { clave: 'solicitante', etiqueta: 'Solicitante' },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'programa', etiqueta: 'Programa' },
            { clave: 'porcentajeSolicitado', etiqueta: '% Solicitado', render: (f) => `${f.porcentajeSolicitado}%` },
            { clave: 'porcentajeAprobado', etiqueta: '% Aprobado', render: (f) => f.porcentajeAprobado != null ? `${f.porcentajeAprobado}%` : '-' },
            { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
            { clave: 'fecha', etiqueta: 'Fecha', render: (f) => UCLA.utils.formatoFecha(f.fecha) },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `<button data-resolver-beca="${f.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Resolver</button>` },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Información de la solicitud',
            camposIzquierda: [
                { clave: 'solicitante', etiqueta: 'Solicitante', tipo: 'text', obligatorio: true },
                { clave: 'programa', etiqueta: 'Programa', tipo: 'text', obligatorio: true },
                { clave: 'tipo', etiqueta: 'Tipo', tipo: 'select', opciones: ['Beca', 'Descuento'] },
                { clave: 'modalidadBeca', etiqueta: 'Modalidad de beca', tipo: 'select', opciones: ['Excelencia académica', 'Socioeconómica', 'Convenio empresarial', 'Egresado', 'Grupo familiar'] },
                { clave: 'porcentajeSolicitado', etiqueta: 'Porcentaje solicitado', tipo: 'text', placeholder: '%' },
            ],
            camposDerecha: [
                { clave: 'justificacion', etiqueta: 'Justificación', tipo: 'textarea' },
                { clave: 'ingresos', etiqueta: 'Ingresos declarados', tipo: 'text' },
                { clave: 'estrato', etiqueta: 'Estrato', tipo: 'select', opciones: ['1', '2', '3', '4', '5', '6'] },
                { clave: 'documentosSoporte', etiqueta: 'Documentos de soporte adjuntos', tipo: 'checkbox' },
                { clave: 'revisor', etiqueta: 'Revisor', tipo: 'text', placeholder: 'Comité de Becas' },
            ],
        }];
    }

    function render(container) {
        let seleccionadaDividida = null;

        // --- Dinámica: agrupa la tabla por estado, tipo o modalidad de beca ---
        function vistaDinamica(cuerpo, filas) {
            const opciones = [
                { id: 'ninguno', etiqueta: 'Ninguno' },
                { id: 'estado', etiqueta: 'Estado' },
                { id: 'tipo', etiqueta: 'Tipo' },
                { id: 'modalidadBeca', etiqueta: 'Modalidad de beca' },
            ];
            let agruparPor = 'estado';
            function pintarDinamica() {
                cuerpo.innerHTML = `
                    <div class="flex items-center gap-2 mb-4">
                        <label class="text-sm font-medium" style="color: var(--color-text-muted);">Agrupar por</label>
                        <select id="becAgruparPor" class="input-brand px-3 py-1.5 text-sm">
                            ${opciones.map((o) => `<option value="${o.id}" ${agruparPor === o.id ? 'selected' : ''}>${o.etiqueta}</option>`).join('')}
                        </select>
                    </div>
                    <div id="becGruposDinamica" class="space-y-6"></div>`;
                cuerpo.querySelector('#becAgruparPor').addEventListener('change', (e) => { agruparPor = e.target.value; pintarDinamica(); });

                const contenedor = cuerpo.querySelector('#becGruposDinamica');
                if (agruparPor === 'ninguno') {
                    const div = document.createElement('div');
                    contenedor.appendChild(div);
                    UCLA.components.dataTable.render(div, { columnas: columnas(), filas, filaId: (f) => f.id });
                    return;
                }
                const grupos = {};
                filas.forEach((f) => { const clave = f[agruparPor] || 'Sin definir'; (grupos[clave] = grupos[clave] || []).push(f); });
                contenedor.innerHTML = '';
                Object.keys(grupos).forEach((clave) => {
                    const seccion = document.createElement('div');
                    seccion.innerHTML = `<h4 class="text-sm font-bold uppercase tracking-wide mb-2" style="color: var(--color-primary);">${clave} <span style="color: var(--color-text-muted); font-weight: 400;">(${grupos[clave].length})</span></h4><div class="becTablaGrupo mb-4"></div>`;
                    contenedor.appendChild(seccion);
                    UCLA.components.dataTable.render(seccion.querySelector('.becTablaGrupo'), { columnas: columnas(), filas: grupos[clave], filaId: (f) => f.id });
                });
            }
            pintarDinamica();
        }

        // --- Línea de tiempo: ordenada por fecha de solicitud ---
        function vistaLineaTiempo(cuerpo, filas) {
            const ordenadas = filas.slice().sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
            cuerpo.innerHTML = !ordenadas.length ? `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">No hay solicitudes para mostrar.</div>` : `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="space-y-5">
                        ${ordenadas.map((f) => `
                            <div class="flex gap-3">
                                <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--color-accent-50);">
                                    <i class="fas fa-award text-sm" style="color: var(--color-accent-dark);"></i>
                                </div>
                                <div class="flex-1 pb-4" style="border-bottom: 1px solid var(--color-border);">
                                    <div class="flex items-center justify-between flex-wrap gap-1">
                                        <p class="text-sm font-semibold" style="color: var(--color-text);">${f.solicitante} <span class="font-normal" style="color: var(--color-text-muted);">· ${f.radicado}</span></p>
                                        <span class="text-xs" style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(f.fecha)}</span>
                                    </div>
                                    <p class="text-sm mt-0.5" style="color: var(--color-text-muted);">${f.tipo} · ${f.modalidadBeca} · ${f.porcentajeSolicitado}% solicitado</p>
                                    <div class="mt-1">${UCLA.utils.badgeEstado(f.estado)}</div>
                                </div>
                            </div>`).join('')}
                    </div>
                </div>`;
        }

        // --- Vista dividida: lista + detalle sincronizados sin navegar ---
        function vistaDividida(cuerpo, filas) {
            if (!seleccionadaDividida || !filas.some((f) => f.id === seleccionadaDividida)) {
                seleccionadaDividida = filas[0]?.id || null;
            }
            cuerpo.innerHTML = `
                <div class="flex flex-col lg:flex-row gap-4 items-start">
                    <div class="w-full lg:w-80 lg:flex-shrink-0" id="becListaDividida"></div>
                    <div class="flex-1 min-w-0 w-full" id="becDetalleDividida"></div>
                </div>`;

            function pintarLista() {
                UCLA.components.dataTable.render(cuerpo.querySelector('#becListaDividida'), {
                    columnas: [
                        { clave: 'solicitante', etiqueta: 'Solicitante', render: (f) => `<span class="font-medium" style="color: ${f.id === seleccionadaDividida ? 'var(--color-primary)' : 'var(--color-text)'};">${f.solicitante}</span>` },
                        { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
                    ],
                    filas,
                    filaId: (f) => f.id,
                    onFilaClick: (f) => { seleccionadaDividida = f.id; pintarLista(); pintarDetalle(); },
                });
            }

            function pintarDetalle() {
                const detalle = cuerpo.querySelector('#becDetalleDividida');
                const f = filas.find((x) => x.id === seleccionadaDividida);
                if (!f) { detalle.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Seleccione una solicitud de la lista.</div>`; return; }
                detalle.innerHTML = `
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-start justify-between flex-wrap gap-2 mb-4">
                            <div>
                                <h3 class="text-xl font-bold" style="color: var(--color-primary-dark);">${f.solicitante}</h3>
                                <p class="text-sm" style="color: var(--color-text-muted);">${f.radicado}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                ${UCLA.utils.badgeEstado(f.estado)}
                                <button data-dividida-resolver="${f.id}" class="px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">Resolver</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Programa</p><p style="color: var(--color-text);">${f.programa}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Tipo</p><p style="color: var(--color-text);">${f.tipo}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Modalidad</p><p style="color: var(--color-text);">${f.modalidadBeca}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">% Solicitado / Aprobado</p><p style="color: var(--color-text);">${f.porcentajeSolicitado}% / ${f.porcentajeAprobado != null ? f.porcentajeAprobado + '%' : '-'}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Fecha</p><p style="color: var(--color-text);">${UCLA.utils.formatoFecha(f.fecha)}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Revisor</p><p style="color: var(--color-text);">${f.revisor || '-'}</p></div>
                        </div>
                        ${f.justificacion ? `<p class="text-sm mt-4" style="color: var(--color-text-muted);">${f.justificacion}</p>` : ''}
                    </div>`;
                detalle.querySelector('[data-dividida-resolver]')?.addEventListener('click', () => abrirResolver(f.id));
            }

            pintarLista();
            pintarDetalle();
        }

        function pintar(idEnfocar) {
            const filas = UCLA.data.solicitudesBecas;
            UCLA.components.listShell.render(container, {
                titulo: 'Solicitudes de Becas o Descuentos',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fecha',
                exportName: 'solicitudes-becas',
                enfocarId: idEnfocar,
                filtrarPorCampos,
                nombrePlural: 'solicitudes de becas',
                vistas: {
                    dinamica: vistaDinamica,
                    'linea-tiempo': vistaLineaTiempo,
                    dividida: vistaDividida,
                },
                botonPrincipal: {
                    etiqueta: 'Crear solicitud de beca',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva solicitud de beca',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            const nueva = UCLA.store.crear('solicitudesBecas', {
                                radicado: 'BEC-2026-' + Math.floor(1000 + Math.random() * 8999),
                                solicitante: datos.solicitante || 'Sin nombre', tipo: datos.tipo || 'Beca',
                                modalidadBeca: datos.modalidadBeca || '', programa: datos.programa || '',
                                porcentajeSolicitado: Number(datos.porcentajeSolicitado) || 0, porcentajeAprobado: null,
                                justificacion: datos.justificacion || '', ingresos: Number(datos.ingresos) || 0,
                                estrato: Number(datos.estrato) || 3, estado: 'Recibida',
                                revisor: datos.revisor || 'Comité de Becas', periodo: '2026-2',
                                fecha: new Date().toISOString().slice(0, 10), comentario: '',
                            });
                            pintar(nueva.id);
                        },
                    }),
                },
            });
        }

        function abrirResolver(id) {
            const beca = UCLA.store.obtener('solicitudesBecas', id);
            if (!beca) return;
            let modal = document.getElementById('modalResolverBeca');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modalResolverBeca';
                modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
                document.body.appendChild(modal);
            }
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-rb-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Resolver solicitud</h3>
                    <p class="text-sm mb-4" style="color: var(--color-text-muted);">${beca.radicado} · ${beca.solicitante}, ${beca.porcentajeSolicitado}% solicitado</p>
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Decisión</label>
                    <select id="rbEstado" class="input-brand w-full px-3 py-2 text-sm mb-3">
                        <option>Aprobada</option><option>Rechazada</option>
                    </select>
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Porcentaje aprobado</label>
                    <input id="rbPorcentaje" type="text" value="${beca.porcentajeSolicitado}" class="input-brand w-full px-3 py-2 text-sm mb-3">
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Comentario del comité</label>
                    <textarea id="rbComentario" rows="2" class="input-brand w-full px-3 py-2 text-sm"></textarea>
                    <div class="flex justify-end gap-2 pt-4">
                        <button data-rb-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="rbGuardar" class="btn-primary text-sm">Guardar</button>
                    </div>
                </div>`;
            modal.querySelectorAll('[data-rb-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
            modal.querySelector('#rbGuardar').addEventListener('click', () => {
                const estado = modal.querySelector('#rbEstado').value;
                UCLA.store.actualizar('solicitudesBecas', beca.id, {
                    estado,
                    porcentajeAprobado: estado === 'Aprobada' ? Number(modal.querySelector('#rbPorcentaje').value) || 0 : 0,
                    comentario: modal.querySelector('#rbComentario').value,
                });
                UCLA.utils.registrarAuditoria({
                    accion: estado === 'Aprobada' ? 'Aprobó solicitud de beca' : 'Rechazó solicitud de beca',
                    modulo: 'Solicitudes',
                    detalle: estado === 'Aprobada' ? `${beca.porcentajeAprobado}% (visible en Financiero › Becas)` : (beca.comentario || 'Sin comentario'),
                });
                UCLA.components.toast.show(
                    estado === 'Aprobada' ? 'Beca aprobada: ya está disponible en Financiero › Becas' : 'Solicitud rechazada',
                    estado === 'Aprobada' ? 'success' : 'info'
                );
                modal.classList.add('hidden');
                pintar();
            });
            modal.classList.remove('hidden');
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-resolver-beca]');
            if (btn) abrirResolver(btn.getAttribute('data-resolver-beca'));
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['solicitudes/becas'] = { render };
})();

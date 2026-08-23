// Solicitudes · Admisión — listShell + recordForm, con acción de fila
// "Cambiar estado" que dispara la automatización de aprobación.
(function () {
    // Los mismos 4 estados que ofrece el modal "Cambiar estado" de esta
    // sección: cada casilla filtra de verdad (activos.includes(f.estado)),
    // no una etiqueta decorativa de nombre de campo.
    const ESTADOS_FILTRO = ['Recibida', 'En revisión', 'Aprobada', 'Rechazada'];
    const CAMPOS_MODULO = ESTADOS_FILTRO;

    function filtrarPorCampos(f, activos) {
        return activos.includes(f.estado);
    }

    // render() se invoca de nuevo en cada navegación a esta ruta; se guarda el
    // handler de delegación para quitarlo antes de registrar uno nuevo y no
    // acumularlos sobre #contentArea (mismo nodo persistente entre rutas).
    let clickHandler = null;

    function columnas() {
        return [
            { clave: 'radicado', etiqueta: 'Radicado', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.radicado}</span>` },
            { clave: 'aspirante', etiqueta: 'Aspirante' },
            { clave: 'programa', etiqueta: 'Programa' },
            { clave: 'modalidad', etiqueta: 'Modalidad' },
            { clave: 'sedeId', etiqueta: 'Sede' },
            { clave: 'fechaRadicado', etiqueta: 'Fecha de radicado', render: (f) => UCLA.utils.formatoFecha(f.fechaRadicado) },
            { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
            { clave: 'revisor', etiqueta: 'Revisor' },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `<button data-cambiar-estado="${f.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Cambiar estado</button>` },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Información de la solicitud',
            camposIzquierda: [
                { clave: 'aspirante', etiqueta: 'Aspirante', tipo: 'text', obligatorio: true },
                { clave: 'documento', etiqueta: 'Documento de identidad', tipo: 'text' },
                { clave: 'correo', etiqueta: 'Correo', tipo: 'email' },
                { clave: 'telefono', etiqueta: 'Teléfono', tipo: 'tel' },
                { clave: 'programa', etiqueta: 'Programa al que aplica', tipo: 'text', obligatorio: true },
                { clave: 'modalidad', etiqueta: 'Modalidad', tipo: 'select', opciones: ['Presencial', 'Virtual', 'Híbrida'] },
                { clave: 'periodo', etiqueta: 'Periodo académico', tipo: 'text', placeholder: '2026-2' },
                { clave: 'sedeId', etiqueta: 'Sede', tipo: 'select', opciones: UCLA.state.SEDES.map((s) => s.codigo) },
            ],
            camposDerecha: [
                { clave: 'nivelPrevio', etiqueta: 'Nivel educativo previo', tipo: 'text' },
                { clave: 'institucionOrigen', etiqueta: 'Institución de procedencia', tipo: 'text' },
                { clave: 'anoGrado', etiqueta: 'Año de grado', tipo: 'text' },
                { clave: 'revisor', etiqueta: 'Revisor asignado', tipo: 'text' },
                { clave: 'fechaRadicado', etiqueta: 'Fecha de radicado', tipo: 'date' },
                { clave: 'canal', etiqueta: 'Canal de radicado', tipo: 'select', opciones: ['Presencial', 'Web', 'Convenio', 'Referido'] },
                { clave: 'observaciones', etiqueta: 'Observaciones', tipo: 'textarea' },
            ],
        }, {
            titulo: 'Documentos adjuntos',
            camposIzquierda: [
                { clave: 'docIdentidad', etiqueta: 'Documento de identidad recibido', tipo: 'checkbox' },
                { clave: 'docDiploma', etiqueta: 'Diploma o acta de grado recibido', tipo: 'checkbox' },
            ],
            camposDerecha: [
                { clave: 'docFoto', etiqueta: 'Foto recibida', tipo: 'checkbox' },
                { clave: 'docFormulario', etiqueta: 'Formulario firmado recibido', tipo: 'checkbox' },
            ],
        }];
    }

    function render(container) {
        let seleccionadaDividida = null;

        // --- Dinámica: agrupa la tabla por estado, sede o modalidad ---
        function vistaDinamica(cuerpo, filas) {
            const opciones = [
                { id: 'ninguno', etiqueta: 'Ninguno' },
                { id: 'estado', etiqueta: 'Estado' },
                { id: 'sedeId', etiqueta: 'Sede' },
                { id: 'modalidad', etiqueta: 'Modalidad' },
            ];
            let agruparPor = 'estado';
            function pintarDinamica() {
                cuerpo.innerHTML = `
                    <div class="flex items-center gap-2 mb-4">
                        <label class="text-sm font-medium" style="color: var(--color-text-muted);">Agrupar por</label>
                        <select id="admAgruparPor" class="input-brand px-3 py-1.5 text-sm">
                            ${opciones.map((o) => `<option value="${o.id}" ${agruparPor === o.id ? 'selected' : ''}>${o.etiqueta}</option>`).join('')}
                        </select>
                    </div>
                    <div id="admGruposDinamica" class="space-y-6"></div>`;
                cuerpo.querySelector('#admAgruparPor').addEventListener('change', (e) => { agruparPor = e.target.value; pintarDinamica(); });

                const contenedor = cuerpo.querySelector('#admGruposDinamica');
                if (agruparPor === 'ninguno') {
                    const div = document.createElement('div');
                    contenedor.appendChild(div);
                    UCLA.components.dataTable.render(div, { columnas: columnas(), filas, filaId: (f) => f.id });
                    return;
                }
                const etiquetaGrupo = (valor) => agruparPor === 'sedeId' ? (UCLA.state.SEDES.find((s) => s.codigo === valor)?.nombre || valor) : (valor || 'Sin definir');
                const grupos = {};
                filas.forEach((f) => { const clave = f[agruparPor] || 'sin-definir'; (grupos[clave] = grupos[clave] || []).push(f); });
                contenedor.innerHTML = '';
                Object.keys(grupos).forEach((clave) => {
                    const seccion = document.createElement('div');
                    seccion.innerHTML = `<h4 class="text-sm font-bold uppercase tracking-wide mb-2" style="color: var(--color-primary);">${etiquetaGrupo(clave)} <span style="color: var(--color-text-muted); font-weight: 400;">(${grupos[clave].length})</span></h4><div class="admTablaGrupo mb-4"></div>`;
                    contenedor.appendChild(seccion);
                    UCLA.components.dataTable.render(seccion.querySelector('.admTablaGrupo'), { columnas: columnas(), filas: grupos[clave], filaId: (f) => f.id });
                });
            }
            pintarDinamica();
        }

        // --- Línea de tiempo: ordenada por fecha de radicado ---
        function vistaLineaTiempo(cuerpo, filas) {
            const ordenadas = filas.slice().sort((a, b) => (b.fechaRadicado || '').localeCompare(a.fechaRadicado || ''));
            cuerpo.innerHTML = !ordenadas.length ? `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">No hay solicitudes para mostrar.</div>` : `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="space-y-5">
                        ${ordenadas.map((f) => `
                            <div class="flex gap-3">
                                <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--color-primary-50);">
                                    <i class="fas fa-user-graduate text-sm" style="color: var(--color-primary);"></i>
                                </div>
                                <div class="flex-1 pb-4" style="border-bottom: 1px solid var(--color-border);">
                                    <div class="flex items-center justify-between flex-wrap gap-1">
                                        <p class="text-sm font-semibold" style="color: var(--color-text);">${f.aspirante} <span class="font-normal" style="color: var(--color-text-muted);">· ${f.radicado}</span></p>
                                        <span class="text-xs" style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(f.fechaRadicado)}</span>
                                    </div>
                                    <p class="text-sm mt-0.5" style="color: var(--color-text-muted);">${f.programa} • ${f.modalidad}</p>
                                    <div class="mt-1">${UCLA.utils.badgeEstado(f.estado)}</div>
                                </div>
                            </div>`).join('')}
                    </div>
                </div>`;
        }

        // --- Mapa: agrupado por sede ---
        function vistaMapa(cuerpo, filas) {
            const grupos = {};
            filas.forEach((f) => { const clave = f.sedeId || 'sin-sede'; (grupos[clave] = grupos[clave] || []).push(f); });
            cuerpo.innerHTML = `
                <div class="mb-3 text-xs" style="color: var(--color-text-muted);">
                    <i class="fas fa-circle-info mr-1"></i> Mapa simplificado agrupado por sede (no hay coordenadas geográficas registradas para solicitudes de admisión).
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${UCLA.state.SEDES.map((sede) => {
                        const filasSede = grupos[sede.codigo] || [];
                        return `
                            <div class="bg-white rounded-xl shadow-lg p-5">
                                <div class="flex items-center gap-2 mb-1">
                                    <i class="fas fa-map-marker-alt" style="color: var(--color-accent-dark);"></i>
                                    <h4 class="font-bold" style="color: var(--color-primary-dark);">${sede.nombre}</h4>
                                </div>
                                <p class="text-2xl font-bold" style="color: var(--color-text);">${filasSede.length}</p>
                                <p class="text-xs mb-3" style="color: var(--color-text-muted);">solicitud${filasSede.length === 1 ? '' : 'es'} de admisión</p>
                                ${filasSede.length ? `<div class="space-y-1">${filasSede.slice(0, 4).map((f) => `<p class="text-xs truncate" style="color: var(--color-text);">${f.aspirante}</p>`).join('')}${filasSede.length > 4 ? `<p class="text-xs" style="color: var(--color-text-muted);">+${filasSede.length - 4} más</p>` : ''}</div>` : `<p class="text-xs" style="color: var(--color-text-muted);">Sin solicitudes</p>`}
                            </div>`;
                    }).join('')}
                </div>`;
        }

        // --- Vista dividida: lista + detalle sincronizados sin navegar ---
        function vistaDividida(cuerpo, filas) {
            if (!seleccionadaDividida || !filas.some((f) => f.id === seleccionadaDividida)) {
                seleccionadaDividida = filas[0]?.id || null;
            }
            cuerpo.innerHTML = `
                <div class="flex flex-col lg:flex-row gap-4 items-start">
                    <div class="w-full lg:w-80 lg:flex-shrink-0" id="admListaDividida"></div>
                    <div class="flex-1 min-w-0 w-full" id="admDetalleDividida"></div>
                </div>`;

            function pintarLista() {
                UCLA.components.dataTable.render(cuerpo.querySelector('#admListaDividida'), {
                    columnas: [
                        { clave: 'aspirante', etiqueta: 'Aspirante', render: (f) => `<span class="font-medium" style="color: ${f.id === seleccionadaDividida ? 'var(--color-primary)' : 'var(--color-text)'};">${f.aspirante}</span>` },
                        { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
                    ],
                    filas,
                    filaId: (f) => f.id,
                    onFilaClick: (f) => { seleccionadaDividida = f.id; pintarLista(); pintarDetalle(); },
                });
            }

            function pintarDetalle() {
                const detalle = cuerpo.querySelector('#admDetalleDividida');
                const f = filas.find((x) => x.id === seleccionadaDividida);
                if (!f) { detalle.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Seleccione una solicitud de la lista.</div>`; return; }
                detalle.innerHTML = `
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-start justify-between flex-wrap gap-2 mb-4">
                            <div>
                                <h3 class="text-xl font-bold" style="color: var(--color-primary-dark);">${f.aspirante}</h3>
                                <p class="text-sm" style="color: var(--color-text-muted);">${f.radicado}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                ${UCLA.utils.badgeEstado(f.estado)}
                                <button data-dividida-cambiar-estado="${f.id}" class="px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">Cambiar estado</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Programa</p><p style="color: var(--color-text);">${f.programa}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Modalidad</p><p style="color: var(--color-text);">${f.modalidad}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Sede</p><p style="color: var(--color-text);">${f.sedeId}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Fecha de radicado</p><p style="color: var(--color-text);">${UCLA.utils.formatoFecha(f.fechaRadicado)}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Revisor</p><p style="color: var(--color-text);">${f.revisor || '-'}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Correo</p><p style="color: var(--color-text);">${f.correo || '-'}</p></div>
                        </div>
                        ${f.observaciones ? `<p class="text-sm mt-4" style="color: var(--color-text-muted);">${f.observaciones}</p>` : ''}
                    </div>`;
                detalle.querySelector('[data-dividida-cambiar-estado]')?.addEventListener('click', () => abrirCambioEstado(f.id));
            }

            pintarLista();
            pintarDetalle();
        }

        function pintar(idEnfocar) {
            const filas = UCLA.data.solicitudesAdmision;
            UCLA.components.listShell.render(container, {
                titulo: 'Solicitudes de Admisión',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaRadicado',
                exportName: 'solicitudes-admision',
                enfocarId: idEnfocar,
                filtrarPorCampos,
                nombrePlural: 'solicitudes de admisión',
                vistas: {
                    dinamica: vistaDinamica,
                    'linea-tiempo': vistaLineaTiempo,
                    mapa: vistaMapa,
                    dividida: vistaDividida,
                },
                botonPrincipal: {
                    etiqueta: 'Crear solicitud de admisión',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva solicitud de admisión',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            const docEstado = (marcado) => marcado ? 'Recibido' : 'Pendiente';
                            const nueva = UCLA.store.crear('solicitudesAdmision', {
                                radicado: 'ADM-2026-' + Math.floor(1000 + Math.random() * 8999),
                                aspirante: datos.aspirante || 'Sin nombre',
                                documento: datos.documento || '', correo: datos.correo || '', telefono: datos.telefono || '',
                                programa: datos.programa || '', modalidad: datos.modalidad || 'Presencial',
                                periodo: datos.periodo || '2026-2', sedeId: datos.sedeId || 'MDE',
                                nivelPrevio: datos.nivelPrevio || '', institucionOrigen: datos.institucionOrigen || '',
                                anoGrado: datos.anoGrado || '', revisor: datos.revisor || '',
                                fechaRadicado: datos.fechaRadicado || new Date().toISOString().slice(0, 10),
                                canal: datos.canal || 'Web', estado: 'Recibida', observaciones: datos.observaciones || '',
                                documentos: [
                                    { nombre: 'Documento de identidad', estado: docEstado(datos.docIdentidad) },
                                    { nombre: 'Diploma o acta de grado', estado: docEstado(datos.docDiploma) },
                                    { nombre: 'Foto', estado: docEstado(datos.docFoto) },
                                    { nombre: 'Formulario firmado', estado: docEstado(datos.docFormulario) },
                                ],
                            });
                            pintar(nueva.id);
                        },
                    }),
                },
            });
        }

        // Delegación de eventos sobre `container` para la acción "Cambiar
        // estado" de cada fila (ver nota de `clickHandler` arriba).
        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-cambiar-estado]');
            if (btn) abrirCambioEstado(btn.getAttribute('data-cambiar-estado'));
        };
        container.addEventListener('click', clickHandler);

        function abrirCambioEstado(id) {
            const solicitud = UCLA.store.obtener('solicitudesAdmision', id);
            if (!solicitud) return;
            let modal = document.getElementById('modalCambiarEstadoAdmision');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modalCambiarEstadoAdmision';
                modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
                document.body.appendChild(modal);
            }
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-ce-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Cambiar estado</h3>
                    <p class="text-sm mb-4" style="color: var(--color-text-muted);">${solicitud.radicado} · ${solicitud.aspirante}</p>
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Nuevo estado</label>
                    <select id="ceEstado" class="input-brand w-full px-3 py-2 text-sm mb-3">
                        ${['Recibida', 'En revisión', 'Aprobada', 'Rechazada'].map((e) => `<option ${e === solicitud.estado ? 'selected' : ''}>${e}</option>`).join('')}
                    </select>
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Comentario</label>
                    <textarea id="ceComentario" rows="3" class="input-brand w-full px-3 py-2 text-sm" placeholder="Obligatorio al rechazar"></textarea>
                    <div class="flex justify-end gap-2 pt-4">
                        <button data-ce-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="ceGuardar" class="btn-primary text-sm">Guardar</button>
                    </div>
                </div>`;
            modal.querySelectorAll('[data-ce-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
            modal.querySelector('#ceGuardar').addEventListener('click', () => {
                const nuevoEstado = modal.querySelector('#ceEstado').value;
                const comentario = modal.querySelector('#ceComentario').value.trim();
                if (nuevoEstado === 'Rechazada' && !comentario) {
                    modal.querySelector('#ceComentario').style.borderColor = 'var(--color-danger)';
                    return;
                }
                UCLA.store.actualizar('solicitudesAdmision', solicitud.id, {
                    estado: nuevoEstado,
                    observaciones: comentario || solicitud.observaciones,
                });

                if (nuevoEstado === 'Aprobada') {
                    const yaExiste = UCLA.data.contactos.some((c) => `${c.nombre} ${c.apellidos}`.trim() === solicitud.aspirante);
                    if (!yaExiste) {
                        const [nombre, ...resto] = solicitud.aspirante.split(' ');
                        UCLA.store.crear('contactos', {
                            nombre, apellidos: resto.join(' '), programaAsociado: solicitud.programa,
                            correo: solicitud.correo, telefono: solicitud.telefono, movil: solicitud.telefono, acudiente: '',
                            institucionAliada: '', ocupacion: '', area: '', fechaNacimiento: '', reportaA: '',
                            propietario: solicitud.revisor || UCLA.state.usuarioActual.nombre, sedeId: solicitud.sedeId,
                            fuente: 'Solicitud de admisión', proximaActividad: null,
                        });
                    }
                    UCLA.utils.registrarAuditoria({ accion: 'Aprobó solicitud de admisión', modulo: 'Solicitudes', detalle: `${solicitud.radicado}, ${solicitud.aspirante} (contacto creado en CRM)` });
                    UCLA.components.toast.show('Contacto creado y correo de bienvenida enviado (simulado)', 'success');
                } else {
                    if (nuevoEstado === 'Rechazada') {
                        UCLA.utils.registrarAuditoria({ accion: 'Rechazó solicitud de admisión', modulo: 'Solicitudes', detalle: `${solicitud.radicado}, ${solicitud.aspirante}: ${comentario}` });
                    }
                    UCLA.components.toast.show(`Solicitud actualizada a "${nuevoEstado}"`, 'success');
                }
                modal.classList.add('hidden');
                pintar();
            });
            modal.classList.remove('hidden');
        }

        pintar();
    }

    UCLA.views['solicitudes/admision'] = { render };
})();

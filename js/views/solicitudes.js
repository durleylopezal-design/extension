// Solicitudes · Seguimiento y Estados — listShell real sobre
// UCLA.data.solicitudesFormacion (mismo dominio que radica el modal "Nueva
// Solicitud de Formación" de Informes, js/views/informes.js). Crear/editar
// reutiliza UCLA.views['informes'].abrirModalSolicitud para no duplicar la
// definición de campos ni la lógica de adjuntos reales (IndexedDB).
(function () {
    const ESTADOS = ['En revisión', 'Aprobada', 'Rechazada'];
    // Mismos 3 estados que ofrece el modal "Cambiar estado" de esta sección:
    // cada casilla filtra de verdad (activos.includes(f.estado)).
    const CAMPOS_MODULO = ESTADOS;

    function filtrarPorCampos(s, activos) {
        return activos.includes(s.estado);
    }

    // Delegación de eventos sobre `container` (ver nota igual en solAdmision.js
    // sobre por qué se guarda la referencia del handler).
    let clickHandler = null;

    function nombreSede(sedeId) {
        return UCLA.state.SEDES.find((s) => s.codigo === sedeId)?.nombre || sedeId || '-';
    }

    function nombreFacultad(facultadId) {
        return UCLA.data.facultades.find((f) => f.id === facultadId)?.nombre || '-';
    }

    function columnas() {
        return [
            { clave: 'radicado', etiqueta: 'Radicado', render: (s) => `<span class="font-medium" style="color: var(--color-primary);">${s.radicado}</span>` },
            { clave: 'entidad', etiqueta: 'Entidad/Empresa' },
            { clave: 'contacto', etiqueta: 'Contacto', render: (s) => `${s.contacto}${s.correo ? `<span class="block text-xs" style="color: var(--color-text-muted);">${s.correo}</span>` : ''}` },
            { clave: 'sedeId', etiqueta: 'Sede', render: (s) => nombreSede(s.sedeId) },
            { clave: 'facultadId', etiqueta: 'Facultad', render: (s) => nombreFacultad(s.facultadId) },
            { clave: 'estado', etiqueta: 'Estado', render: (s) => UCLA.utils.badgeEstado(s.estado) },
            { clave: 'fechaRadicado', etiqueta: 'Fecha de radicado', render: (s) => UCLA.utils.formatoFecha(s.fechaRadicado) },
            { clave: 'acciones', etiqueta: 'Acciones', render: (s) => `
                <button data-cambiar-estado-sf="${s.id}" class="mr-2 text-xs font-medium hover:underline" style="color: var(--color-primary);">Cambiar estado</button>
                <button data-editar-sf="${s.id}" class="mr-2" style="color: var(--color-primary);" title="Editar"><i class="fas fa-pen text-xs"></i></button>
                <button data-eliminar-sf="${s.id}" style="color: var(--color-danger);" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>` },
        ];
    }

    function render(container) {
        let seleccionadaDividida = null;

        // --- Dinámica: agrupa la tabla por estado, sede o facultad ---
        function vistaDinamica(cuerpo, filas) {
            const opciones = [
                { id: 'ninguno', etiqueta: 'Ninguno' },
                { id: 'estado', etiqueta: 'Estado' },
                { id: 'sedeId', etiqueta: 'Sede' },
                { id: 'facultadId', etiqueta: 'Facultad' },
            ];
            let agruparPor = 'estado';
            function pintarDinamica() {
                cuerpo.innerHTML = `
                    <div class="flex items-center gap-2 mb-4">
                        <label class="text-sm font-medium" style="color: var(--color-text-muted);">Agrupar por</label>
                        <select id="sfAgruparPor" class="input-brand px-3 py-1.5 text-sm">
                            ${opciones.map((o) => `<option value="${o.id}" ${agruparPor === o.id ? 'selected' : ''}>${o.etiqueta}</option>`).join('')}
                        </select>
                    </div>
                    <div id="sfGruposDinamica" class="space-y-6"></div>`;
                cuerpo.querySelector('#sfAgruparPor').addEventListener('change', (e) => { agruparPor = e.target.value; pintarDinamica(); });

                const contenedor = cuerpo.querySelector('#sfGruposDinamica');
                if (agruparPor === 'ninguno') {
                    const div = document.createElement('div');
                    contenedor.appendChild(div);
                    UCLA.components.dataTable.render(div, { columnas: columnas(), filas, filaId: (s) => s.id });
                    return;
                }
                const etiquetaGrupo = (valor) => {
                    if (agruparPor === 'sedeId') return nombreSede(valor);
                    if (agruparPor === 'facultadId') return nombreFacultad(valor);
                    return valor || 'Sin definir';
                };
                const grupos = {};
                filas.forEach((s) => { const clave = s[agruparPor] || 'sin-definir'; (grupos[clave] = grupos[clave] || []).push(s); });
                contenedor.innerHTML = '';
                Object.keys(grupos).forEach((clave) => {
                    const seccion = document.createElement('div');
                    seccion.innerHTML = `<h4 class="text-sm font-bold uppercase tracking-wide mb-2" style="color: var(--color-primary);">${etiquetaGrupo(clave)} <span style="color: var(--color-text-muted); font-weight: 400;">(${grupos[clave].length})</span></h4><div class="sfTablaGrupo mb-4"></div>`;
                    contenedor.appendChild(seccion);
                    UCLA.components.dataTable.render(seccion.querySelector('.sfTablaGrupo'), { columnas: columnas(), filas: grupos[clave], filaId: (s) => s.id });
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
                        ${ordenadas.map((s) => `
                            <div class="flex gap-3">
                                <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--color-primary-50);">
                                    <i class="fas fa-building text-sm" style="color: var(--color-primary);"></i>
                                </div>
                                <div class="flex-1 pb-4" style="border-bottom: 1px solid var(--color-border);">
                                    <div class="flex items-center justify-between flex-wrap gap-1">
                                        <p class="text-sm font-semibold" style="color: var(--color-text);">${s.entidad} <span class="font-normal" style="color: var(--color-text-muted);">· ${s.radicado}</span></p>
                                        <span class="text-xs" style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(s.fechaRadicado)}</span>
                                    </div>
                                    <p class="text-sm mt-0.5" style="color: var(--color-text-muted);">${nombreSede(s.sedeId)} · ${nombreFacultad(s.facultadId)}</p>
                                    <div class="mt-1">${UCLA.utils.badgeEstado(s.estado)}</div>
                                </div>
                            </div>`).join('')}
                    </div>
                </div>`;
        }

        // --- Mapa: agrupado por sede ---
        function vistaMapa(cuerpo, filas) {
            const grupos = {};
            filas.forEach((s) => { const clave = s.sedeId || 'sin-sede'; (grupos[clave] = grupos[clave] || []).push(s); });
            cuerpo.innerHTML = `
                <div class="mb-3 text-xs" style="color: var(--color-text-muted);">
                    <i class="fas fa-circle-info mr-1"></i> Mapa simplificado agrupado por sede (no hay coordenadas geográficas registradas para solicitudes de formación).
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
                                <p class="text-xs mb-3" style="color: var(--color-text-muted);">solicitud${filasSede.length === 1 ? '' : 'es'} de formación</p>
                                ${filasSede.length ? `<div class="space-y-1">${filasSede.slice(0, 4).map((s) => `<p class="text-xs truncate" style="color: var(--color-text);">${s.entidad}</p>`).join('')}${filasSede.length > 4 ? `<p class="text-xs" style="color: var(--color-text-muted);">+${filasSede.length - 4} más</p>` : ''}</div>` : `<p class="text-xs" style="color: var(--color-text-muted);">Sin solicitudes</p>`}
                            </div>`;
                    }).join('')}
                </div>`;
        }

        // --- Vista dividida: lista + detalle (con adjuntos reales) sincronizados sin navegar ---
        function vistaDividida(cuerpo, filas) {
            if (!seleccionadaDividida || !filas.some((s) => s.id === seleccionadaDividida)) {
                seleccionadaDividida = filas[0]?.id || null;
            }
            cuerpo.innerHTML = `
                <div class="flex flex-col lg:flex-row gap-4 items-start">
                    <div class="w-full lg:w-80 lg:flex-shrink-0" id="sfListaDividida"></div>
                    <div class="flex-1 min-w-0 w-full" id="sfDetalleDividida"></div>
                </div>`;

            function pintarLista() {
                UCLA.components.dataTable.render(cuerpo.querySelector('#sfListaDividida'), {
                    columnas: [
                        { clave: 'entidad', etiqueta: 'Entidad', render: (s) => `<span class="font-medium" style="color: ${s.id === seleccionadaDividida ? 'var(--color-primary)' : 'var(--color-text)'};">${s.entidad}</span>` },
                        { clave: 'estado', etiqueta: 'Estado', render: (s) => UCLA.utils.badgeEstado(s.estado) },
                    ],
                    filas,
                    filaId: (s) => s.id,
                    onFilaClick: (s) => { seleccionadaDividida = s.id; pintarLista(); pintarDetalle(); },
                });
            }

            function pintarDetalle() {
                const detalle = cuerpo.querySelector('#sfDetalleDividida');
                const s = filas.find((x) => x.id === seleccionadaDividida);
                if (!s) { detalle.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Seleccione una solicitud de la lista.</div>`; return; }
                detalle.innerHTML = `
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-start justify-between flex-wrap gap-2 mb-4">
                            <div>
                                <h3 class="text-xl font-bold" style="color: var(--color-primary-dark);">${s.entidad}</h3>
                                <p class="text-sm" style="color: var(--color-text-muted);">${s.radicado}</p>
                            </div>
                            <div class="flex items-center gap-2 flex-wrap">
                                ${UCLA.utils.badgeEstado(s.estado)}
                                <button data-dividida-estado="${s.id}" class="px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">Cambiar estado</button>
                                <button data-dividida-editar="${s.id}" class="px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">Editar</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Contacto</p><p style="color: var(--color-text);">${s.contacto}${s.correo ? ` · ${s.correo}` : ''}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Sede</p><p style="color: var(--color-text);">${nombreSede(s.sedeId)}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Facultad</p><p style="color: var(--color-text);">${nombreFacultad(s.facultadId)}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Fecha de radicado</p><p style="color: var(--color-text);">${UCLA.utils.formatoFecha(s.fechaRadicado)}</p></div>
                        </div>
                        ${s.objetivo ? `<p class="text-sm mb-4" style="color: var(--color-text-muted);">${s.objetivo}</p>` : ''}
                        <p class="text-xs font-semibold uppercase mb-2" style="color: var(--color-text-muted);">Documentos adjuntos</p>
                        <div id="sfDividedaAdjuntos" class="text-xs" style="color: var(--color-text-muted);">Cargando…</div>
                    </div>`;
                detalle.querySelector('[data-dividida-estado]')?.addEventListener('click', () => abrirCambioEstado(s.id));
                detalle.querySelector('[data-dividida-editar]')?.addEventListener('click', () => UCLA.views['informes'].abrirModalSolicitud(s, (actualizada) => pintar(actualizada.id)));
                UCLA.archivos.listar(s.id).then((archivos) => {
                    const cont = detalle.querySelector('#sfDividedaAdjuntos');
                    if (!cont) return; // el detalle cambió mientras cargaba
                    cont.innerHTML = archivos.length
                        ? archivos.map((a) => `<p><i class="fas fa-file-lines mr-1"></i>${a.nombre}</p>`).join('')
                        : 'Sin documentos adjuntos.';
                });
            }

            pintarLista();
            pintarDetalle();
        }

        function pintar(idEnfocar) {
            const filas = UCLA.data.solicitudesFormacion;
            UCLA.components.listShell.render(container, {
                titulo: 'Solicitudes de Formación',
                columnas: columnas(),
                filas,
                filaId: (s) => s.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaRadicado',
                exportName: 'solicitudes-formacion',
                enfocarId: idEnfocar,
                filtrarPorCampos,
                nombrePlural: 'solicitudes de formación',
                vistas: {
                    dinamica: vistaDinamica,
                    'linea-tiempo': vistaLineaTiempo,
                    mapa: vistaMapa,
                    dividida: vistaDividida,
                },
                botonPrincipal: {
                    etiqueta: 'Nueva Solicitud de Formación',
                    onClick: () => UCLA.views['informes'].abrirModalSolicitud(null, (solicitud) => pintar(solicitud.id)),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btnEditar = e.target.closest('[data-editar-sf]');
            if (btnEditar) {
                const solicitud = UCLA.store.obtener('solicitudesFormacion', btnEditar.getAttribute('data-editar-sf'));
                if (solicitud) UCLA.views['informes'].abrirModalSolicitud(solicitud, (actualizada) => pintar(actualizada.id));
                return;
            }
            const btnCambiarEstado = e.target.closest('[data-cambiar-estado-sf]');
            if (btnCambiarEstado) { abrirCambioEstado(btnCambiarEstado.getAttribute('data-cambiar-estado-sf')); return; }
            const btnEliminar = e.target.closest('[data-eliminar-sf]');
            if (btnEliminar) { confirmarEliminar(btnEliminar.getAttribute('data-eliminar-sf')); return; }
        };
        container.addEventListener('click', clickHandler);

        function abrirCambioEstado(id) {
            const solicitud = UCLA.store.obtener('solicitudesFormacion', id);
            if (!solicitud) return;
            let modal = document.getElementById('modalCambiarEstadoFormacion');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modalCambiarEstadoFormacion';
                modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
                document.body.appendChild(modal);
            }
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-cesf-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Cambiar estado</h3>
                    <p class="text-sm mb-4" style="color: var(--color-text-muted);">${solicitud.radicado} · ${solicitud.entidad}</p>
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Nuevo estado</label>
                    <select id="cesfEstado" class="input-brand w-full px-3 py-2 text-sm mb-3">
                        ${ESTADOS.map((e) => `<option ${e === solicitud.estado ? 'selected' : ''}>${e}</option>`).join('')}
                    </select>
                    <div class="flex justify-end gap-2 pt-2">
                        <button data-cesf-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="cesfGuardar" class="btn-primary text-sm">Guardar</button>
                    </div>
                </div>`;
            modal.querySelectorAll('[data-cesf-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
            modal.querySelector('#cesfGuardar').addEventListener('click', () => {
                const nuevoEstado = modal.querySelector('#cesfEstado').value;
                UCLA.store.actualizar('solicitudesFormacion', solicitud.id, { estado: nuevoEstado });
                UCLA.utils.registrarAuditoria({ accion: 'Cambió estado de solicitud de formación', modulo: 'Solicitudes', detalle: `${solicitud.radicado}, ${solicitud.entidad}: ${nuevoEstado}` });
                UCLA.components.toast.show(`Solicitud actualizada a "${nuevoEstado}"`, 'success');
                modal.classList.add('hidden');
                pintar();
            });
            modal.classList.remove('hidden');
        }

        function confirmarEliminar(id) {
            const solicitud = UCLA.store.obtener('solicitudesFormacion', id);
            if (!solicitud) return;
            UCLA.components.confirmModal.abrir({
                titulo: 'Eliminar solicitud de formación',
                mensaje: `¿Eliminar "${solicitud.radicado}, ${solicitud.entidad}"? También se eliminarán sus documentos adjuntos. Esta acción no se puede deshacer.`,
                onConfirmar: () => {
                    UCLA.store.eliminar('solicitudesFormacion', id);
                    UCLA.archivos.eliminarDeSolicitud(id).then(() => {
                        UCLA.utils.registrarAuditoria({ accion: 'Eliminó solicitud de formación', modulo: 'Solicitudes', detalle: `${solicitud.radicado}, ${solicitud.entidad}` });
                        UCLA.components.toast.show('Solicitud eliminada', 'success');
                        pintar();
                    });
                },
            });
        }

        pintar();
    }

    UCLA.views['solicitudes/seguimiento'] = { render };
})();

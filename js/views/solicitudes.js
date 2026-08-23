// Solicitudes · Seguimiento y Estados — listShell real sobre
// UCLA.data.solicitudesFormacion (mismo dominio que radica el modal "Nueva
// Solicitud de Formación" de Informes, js/views/informes.js). Crear/editar
// reutiliza UCLA.views['informes'].abrirModalSolicitud para no duplicar la
// definición de campos ni la lógica de adjuntos reales (IndexedDB).
(function () {
    const CAMPOS_MODULO = ['Estado', 'Sede', 'Facultad', 'Fecha de radicado'];
    const ESTADOS = ['En revisión', 'Aprobada', 'Rechazada'];

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
        function pintar() {
            const filas = UCLA.data.solicitudesFormacion;
            UCLA.components.listShell.render(container, {
                titulo: 'Solicitudes de Formación',
                columnas: columnas(),
                filas,
                filaId: (s) => s.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaRadicado',
                exportName: 'solicitudes-formacion',
                botonPrincipal: {
                    etiqueta: 'Nueva Solicitud de Formación',
                    onClick: () => UCLA.views['informes'].abrirModalSolicitud(null, () => pintar()),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btnEditar = e.target.closest('[data-editar-sf]');
            if (btnEditar) {
                const solicitud = UCLA.store.obtener('solicitudesFormacion', btnEditar.getAttribute('data-editar-sf'));
                if (solicitud) UCLA.views['informes'].abrirModalSolicitud(solicitud, () => pintar());
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

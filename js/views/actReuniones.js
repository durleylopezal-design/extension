// Actividades · Reuniones — listado sobre listShell/dataTable + modal
// "Información de Reunión" a medida (no usa recordForm por sus campos con
// comportamiento propio: todo el día, participantes, repetir).
(function () {
    const CAMPOS_MODULO = ['A', 'Ciudad de registro', 'Creado por', 'Dirección de registro', 'Estado de registro', 'Etiqueta', 'Hora de creación', 'Hora de la última actividad'];
    const ASESORES = ['Ana García', 'Carlos Pérez', 'María López', 'Juan Martínez', UCLA.state.usuarioActual.nombre];

    let clickHandler = null;

    function fmtFechaHora(iso) {
        if (!iso) return '';
        const [fecha, hora] = iso.split('T');
        return `${UCLA.utils.formatoFecha(fecha)} ${hora || ''}`.trim();
    }

    function columnas() {
        return [
            { clave: 'titulo', etiqueta: 'Título', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.titulo}</span>${f.todoElDia ? ` <span class="text-xs" style="color: var(--color-text-muted);">(todo el día)</span>` : ''}` },
            { clave: 'inicio', etiqueta: 'Fecha y hora de inicio', render: (f) => fmtFechaHora(f.inicio) },
            { clave: 'fin', etiqueta: 'Fecha y hora de fin', render: (f) => fmtFechaHora(f.fin) },
            { clave: 'relacionadoCon', etiqueta: 'Relacionado con', render: (f) => f.relacionadoCon || '-' },
            { clave: 'contactoNombre', etiqueta: 'Nombre de contacto', render: (f) => f.contactoNombre || '-' },
            { clave: 'anfitrion', etiqueta: 'Anfitrión (host)' },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `
                <button data-editar-reunion="${f.id}" class="mr-2" style="color: var(--color-primary);" title="Editar"><i class="fas fa-pen text-xs"></i></button>
                <button data-eliminar-reunion="${f.id}" style="color: var(--color-danger);" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>` },
        ];
    }

    function render(container) {
        function pintar() {
            const filas = UCLA.data.reuniones;
            UCLA.components.listShell.render(container, {
                titulo: 'Reuniones',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'inicio',
                exportName: 'reuniones',
                botonPrincipal: { etiqueta: 'Crear reunión', onClick: () => abrirModal(pintar) },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btnEditar = e.target.closest('[data-editar-reunion]');
            if (btnEditar) {
                const reunion = UCLA.store.obtener('reuniones', btnEditar.getAttribute('data-editar-reunion'));
                if (reunion) abrirModal(pintar, reunion);
                return;
            }
            const btnEliminar = e.target.closest('[data-eliminar-reunion]');
            if (btnEliminar) {
                const id = btnEliminar.getAttribute('data-eliminar-reunion');
                const reunion = UCLA.store.obtener('reuniones', id);
                if (!reunion) return;
                UCLA.components.confirmModal.abrir({
                    titulo: 'Eliminar reunión',
                    mensaje: `¿Eliminar "${reunion.titulo}"? Esta acción no se puede deshacer.`,
                    onConfirmar: () => {
                        UCLA.store.eliminar('reuniones', id);
                        UCLA.components.toast.show('Reunión eliminada', 'success');
                        pintar();
                    },
                });
            }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirModal(alGuardar, registroExistente) {
        let modal = document.getElementById('modalInfoReunion');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalInfoReunion';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        let masDetalles = false;
        let participantes = [];

        function pintarModal() {
            const r = registroExistente;
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-mr-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">${r ? 'Editar Reunión' : 'Información de Reunión'}</h3>
                        <button data-mr-cerrar class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Título *</label>
                            <input id="mrTitulo" type="text" value="${r ? r.titulo : ''}" class="input-brand w-full px-3 py-2 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Ubicación</label>
                            <input id="mrUbicacion" type="text" value="${r ? r.ubicacion || '' : ''}" placeholder="Sala, sede o enlace virtual" class="input-brand w-full px-3 py-2 text-sm">
                        </div>
                        <label class="flex items-center gap-2 text-sm cursor-pointer" style="color: var(--color-text);">
                            <input type="checkbox" id="mrTodoElDia" ${r?.todoElDia ? 'checked' : ''}> Todo el día
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">De *</label>
                                <input id="mrDe" type="datetime-local" value="${r ? r.inicio || '' : ''}" class="input-brand w-full px-3 py-2 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">A *</label>
                                <input id="mrA" type="datetime-local" value="${r ? r.fin || '' : ''}" class="input-brand w-full px-3 py-2 text-sm">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Anfitrión (host)</label>
                            <select id="mrAnfitrion" class="input-brand w-full px-3 py-2 text-sm">
                                ${ASESORES.map((a) => `<option ${r && r.anfitrion === a ? 'selected' : ''}>${a}</option>`).join('')}
                            </select>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs font-medium" style="color: var(--color-text-muted);">Participantes</p>
                                <p id="mrParticipantesTexto" class="text-sm" style="color: var(--color-text);">Ninguno</p>
                            </div>
                            <button type="button" id="mrAgregarParticipante" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">+ Agregar</button>
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Relacionado con</label>
                            <input id="mrRelacionado" type="text" value="${r ? r.relacionadoCon || '' : ''}" placeholder="Ej: Cuenta · TECNOVA S.A.S." class="input-brand w-full px-3 py-2 text-sm">
                        </div>
                        <div class="flex items-end gap-2">
                            <div class="flex-1">
                                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Repetir</label>
                                <select id="mrRepetir" class="input-brand w-full px-3 py-2 text-sm">
                                    <option>Ninguno</option><option>Diariamente</option><option>Semanalmente</option><option>Mensualmente</option>
                                </select>
                            </div>
                            <button type="button" id="mrEditarRecurrencia" title="Configurar recurrencia" class="p-2" style="color: var(--color-primary);"><i class="fas fa-pen"></i></button>
                        </div>

                        <a href="#" id="mrMasDetalles" class="text-xs font-medium hover:underline inline-block" style="color: var(--color-primary);">
                            ${masDetalles ? 'Ocultar detalles adicionales' : 'Agregar más detalles'}
                        </a>
                        <div id="mrDetallesExtra" class="${masDetalles ? '' : 'hidden'} space-y-4">
                            <div>
                                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Descripción</label>
                                <textarea id="mrDescripcion" rows="3" class="input-brand w-full px-3 py-2 text-sm"></textarea>
                            </div>
                            <div>
                                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Recordatorio</label>
                                <select id="mrRecordatorio" class="input-brand w-full px-3 py-2 text-sm">
                                    <option>Ninguno</option><option>15 minutos antes</option><option>1 hora antes</option><option>1 día antes</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Participantes externos</label>
                                <input id="mrParticipantesExternos" type="text" placeholder="Correos separados por coma" class="input-brand w-full px-3 py-2 text-sm">
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 pt-5">
                        <button data-mr-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="mrGuardar" class="btn-primary text-sm">${r ? 'Guardar cambios' : 'Guardar'}</button>
                    </div>
                </div>`;

            modal.querySelectorAll('[data-mr-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
            modal.querySelector('#mrMasDetalles').addEventListener('click', (e) => {
                e.preventDefault();
                masDetalles = !masDetalles;
                // Solo alterna la sección extra sin reconstruir el resto del
                // formulario, para no perder lo que el usuario ya escribió.
                modal.querySelector('#mrDetallesExtra').classList.toggle('hidden', !masDetalles);
                e.target.textContent = masDetalles ? 'Ocultar detalles adicionales' : 'Agregar más detalles';
            });
            modal.querySelector('#mrAgregarParticipante').addEventListener('click', () => {
                participantes.push(`Participante ${participantes.length + 1}`);
                modal.querySelector('#mrParticipantesTexto').textContent = participantes.join(', ');
                UCLA.components.toast.show('Participante agregado (simulado)', 'info');
            });
            modal.querySelector('#mrEditarRecurrencia').addEventListener('click', () => {
                UCLA.components.toast.show('Configuración de recurrencia - función simulada', 'info');
            });
            modal.querySelector('#mrGuardar').addEventListener('click', () => {
                const de = modal.querySelector('#mrDe');
                const a = modal.querySelector('#mrA');
                const titulo = modal.querySelector('#mrTitulo');
                let valido = true;
                [de, a].forEach((el) => {
                    if (!el.value) { el.style.borderColor = 'var(--color-danger)'; valido = false; }
                });
                if (!titulo.value.trim()) { titulo.style.borderColor = 'var(--color-danger)'; valido = false; }
                if (!valido) return;

                const recordatorio = masDetalles ? modal.querySelector('#mrRecordatorio').value : 'Ninguno';
                const datosReunion = {
                    titulo: titulo.value.trim(),
                    ubicacion: modal.querySelector('#mrUbicacion').value,
                    todoElDia: modal.querySelector('#mrTodoElDia').checked,
                    inicio: de.value,
                    fin: a.value,
                    anfitrion: modal.querySelector('#mrAnfitrion').value,
                    relacionadoCon: modal.querySelector('#mrRelacionado').value,
                };
                if (registroExistente) {
                    UCLA.store.actualizar('reuniones', registroExistente.id, datosReunion);
                    UCLA.components.toast.show('Reunión actualizada exitosamente', 'success');
                } else {
                    UCLA.store.crear('reuniones', Object.assign({ contactoNombre: '' }, datosReunion));
                    UCLA.components.toast.show('Reunión guardada exitosamente', 'success');
                }
                if (recordatorio !== 'Ninguno') {
                    UCLA.components.topbar.agregarNotificacion({ titulo: `Recordatorio: ${titulo.value.trim()}`, detalle: `${recordatorio} · ${fmtFechaHora(de.value)}` });
                }
                modal.classList.add('hidden');
                alGuardar();
            });
        }

        pintarModal();
        modal.classList.remove('hidden');
    }

    UCLA.views['actividades/reuniones'] = { render };
})();

// Solicitudes · Admisión — listShell + recordForm, con acción de fila
// "Cambiar estado" que dispara la automatización de aprobación.
(function () {
    const CAMPOS_MODULO = ['Estado', 'Programa', 'Sede', 'Revisor', 'Fecha de radicado', 'Periodo académico', 'Modalidad'];

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
        const filas = UCLA.data.solicitudesAdmision.slice();

        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Solicitudes de Admisión',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaRadicado',
                exportName: 'solicitudes-admision',
                botonPrincipal: {
                    etiqueta: 'Crear solicitud de admisión',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva solicitud de admisión',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            const docEstado = (marcado) => marcado ? 'Recibido' : 'Pendiente';
                            filas.unshift({
                                id: 'sa-' + Date.now(),
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
                            pintar();
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
            const solicitud = filas.find((f) => f.id === id);
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
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
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
                solicitud.estado = nuevoEstado;
                solicitud.observaciones = comentario || solicitud.observaciones;

                if (nuevoEstado === 'Aprobada') {
                    const yaExiste = UCLA.data.contactos.some((c) => `${c.nombre} ${c.apellidos}`.trim() === solicitud.aspirante);
                    if (!yaExiste) {
                        const [nombre, ...resto] = solicitud.aspirante.split(' ');
                        UCLA.data.contactos.unshift({
                            id: 'con-' + Date.now(), nombre, apellidos: resto.join(' '), programaAsociado: solicitud.programa,
                            correo: solicitud.correo, telefono: solicitud.telefono, movil: solicitud.telefono, acudiente: '',
                            institucionAliada: '', ocupacion: '', area: '', fechaNacimiento: '', reportaA: '',
                            propietario: solicitud.revisor || UCLA.state.usuarioActual.nombre, sedeId: solicitud.sedeId,
                            fuente: 'Solicitud de admisión', proximaActividad: null,
                        });
                    }
                    UCLA.components.toast.show('Contacto creado y correo de bienvenida enviado (simulado — quedaría registrado en Auditoría)', 'success');
                } else {
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

// Actividades · Llamadas — listado sobre listShell/dataTable + modales
// "Programar una llamada" / "Registrar una llamada", con detección de cruce
// de horario contra reuniones de todo el día.
(function () {
    const CAMPOS_MODULO = ['Agenda de llamadas', 'Asunto', 'Creado por', 'Duración de la llamada', 'Duración en segundos', 'Estado de llamada saliente', 'Etiqueta', 'Hora de creación', 'Hora de inicio de la llamada'];
    const ASESORES = ['Ana García', 'Carlos Pérez', 'María López', 'Juan Martínez', UCLA.state.usuarioActual.nombre];
    const PROPOSITOS = ['Información de programa', 'Seguimiento de matrícula', 'Confirmación de documentos', 'Otro'];
    const TIPOS_REGISTRO = { Contacto: 'contactos', Cuenta: 'cuentas', 'Posible estudiante': 'leads', Oportunidad: 'oportunidades' };

    function nombreRegistro(tipo, obj) {
        if (tipo === 'Contacto') return `${obj.nombre} ${obj.apellidos}`;
        if (tipo === 'Posible estudiante') return `${obj.nombre} ${obj.apellidos}`;
        if (tipo === 'Cuenta') return obj.razonSocial;
        return obj.nombre;
    }

    function columnas() {
        return [
            { clave: 'direccion', etiqueta: 'Dirección', render: (f) => `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: ${f.direccion === 'Saliente' ? 'var(--color-primary-50)' : 'var(--color-accent-100)'}; color: ${f.direccion === 'Saliente' ? 'var(--color-primary)' : 'var(--color-accent-dark)'};"><i class="fas fa-phone-${f.direccion === 'Saliente' ? 'arrow-up-right' : 'arrow-down-left'} mr-1"></i>${f.direccion}</span>` },
            { clave: 'relacionadoCon', etiqueta: 'Relacionado con', render: (f) => f.relacionadoCon || '—' },
            { clave: 'contactoNombre', etiqueta: 'Nombre de contacto', render: (f) => f.contactoNombre || '—' },
        ];
    }

    function render(container) {
        const filas = UCLA.data.llamadas.slice();

        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Llamadas',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'inicio',
                exportName: 'llamadas',
                extraToolbarHtml: `
                    <button id="llBtnRegistrar" class="px-3 py-1.5 text-sm rounded-lg border flex items-center gap-2" style="border-color: var(--color-primary); color: var(--color-primary);">
                        <i class="fas fa-phone"></i> Registrar una llamada
                    </button>`,
                onExtraToolbarBind: (root) => {
                    root.querySelector('#llBtnRegistrar')?.addEventListener('click', () => abrirModal('registrar', filas, pintar));
                },
                botonPrincipal: { etiqueta: 'Programar una llamada', onClick: () => abrirModal('programar', filas, pintar) },
            });
        }

        pintar();
    }

    function datalistHtml(id, tipo) {
        const datos = UCLA.data[TIPOS_REGISTRO[tipo]] || [];
        return `<datalist id="${id}">${datos.map((d) => `<option value="${nombreRegistro(tipo, d)}">`).join('')}</datalist>`;
    }

    function abrirModal(modo, filas, alGuardar) {
        let modal = document.getElementById('modalLlamada');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalLlamada';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        const esProgramar = modo === 'programar';

        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-ll-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">${esProgramar ? 'Programar una llamada' : 'Registrar una llamada'}</h3>
                    <button data-ll-cerrar class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                </div>

                <p class="text-xs font-bold uppercase mb-3" style="color: var(--color-primary);">Información de Llamada</p>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Llamada</label>
                        <div class="flex gap-2">
                            <select id="llTipoLlamada" class="input-brand px-2 py-2 text-sm" style="width: 40%;">
                                ${Object.keys(TIPOS_REGISTRO).map((t) => `<option ${t === 'Contacto' ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                            <input id="llContacto" list="dlContacto" type="text" placeholder="Buscar..." class="input-brand flex-1 px-3 py-2 text-sm">
                        </div>
                        <div id="llDatalistContacto">${datalistHtml('dlContacto', 'Contacto')}</div>
                    </div>
                    <div>
                        <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Relacionado con</label>
                        <div class="flex gap-2">
                            <select id="llTipoRelacionado" class="input-brand px-2 py-2 text-sm" style="width: 40%;">
                                ${Object.keys(TIPOS_REGISTRO).map((t) => `<option ${t === 'Cuenta' ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                            <input id="llRelacionado" list="dlRelacionado" type="text" placeholder="Buscar..." class="input-brand flex-1 px-3 py-2 text-sm">
                        </div>
                        <div id="llDatalistRelacionado">${datalistHtml('dlRelacionado', 'Cuenta')}</div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Tipo de llamada</label>
                            <input type="text" value="Saliente" disabled class="w-full px-3 py-2 text-sm rounded-lg" style="background: var(--color-neutral-100, #F0F2F3); color: var(--color-text-muted); border: 1.5px solid var(--color-border);">
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Estado de llamada saliente</label>
                            <input type="text" value="${esProgramar ? 'Programado' : 'Completado'}" disabled class="w-full px-3 py-2 text-sm rounded-lg" style="background: var(--color-neutral-100, #F0F2F3); color: var(--color-text-muted); border: 1.5px solid var(--color-border);">
                        </div>
                    </div>

                    ${esProgramar ? `
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Fecha y hora de inicio *</label>
                            <input id="llInicio" type="datetime-local" class="input-brand w-full px-3 py-2 text-sm">
                        </div>
                        <div id="llAvisoSolape" class="hidden p-3 rounded-lg text-xs" style="background: var(--color-primary-50); color: var(--color-text);"></div>
                    ` : `
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Duración de la llamada</label>
                            <div class="flex items-center gap-2">
                                <input id="llMin" type="number" min="0" placeholder="min" class="input-brand w-20 px-3 py-2 text-sm">
                                <span style="color: var(--color-text-muted);">:</span>
                                <input id="llSeg" type="number" min="0" max="59" placeholder="seg" class="input-brand w-20 px-3 py-2 text-sm">
                            </div>
                        </div>
                    `}

                    <div class="flex items-end gap-2">
                        <div class="flex-1">
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Propietario de la llamada</label>
                            <select id="llPropietario" class="input-brand w-full px-3 py-2 text-sm">
                                ${ASESORES.map((a) => `<option ${a === UCLA.state.usuarioActual.nombre ? 'selected' : ''}>${a}</option>`).join('')}
                            </select>
                        </div>
                        <button type="button" id="llReasignar" title="Reasignar" class="p-2" style="color: var(--color-primary);"><i class="fas fa-user-pen"></i></button>
                    </div>

                    <div>
                        <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Asunto</label>
                        <input id="llAsunto" type="text" class="input-brand w-full px-3 py-2 text-sm">
                    </div>

                    <div>
                        <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Recordatorio</label>
                        <select id="llRecordatorio" class="input-brand w-full px-3 py-2 text-sm">
                            <option>Ninguno</option><option>15 minutos antes</option><option>1 hora antes</option><option>1 día antes</option>
                        </select>
                    </div>

                    <p class="text-xs font-bold uppercase pt-2" style="color: var(--color-primary);">Finalidad de la llamada saliente</p>
                    <div>
                        <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Propósito de la llamada</label>
                        <select id="llProposito" class="input-brand w-full px-3 py-2 text-sm">
                            ${PROPOSITOS.map((p) => `<option>${p}</option>`).join('')}
                        </select>
                    </div>
                    ${!esProgramar ? `
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Grabación de voz</label>
                            <input id="llGrabacion" type="file" accept="audio/*" class="text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Agenda de llamadas</label>
                            <input id="llAgenda" type="text" placeholder="Notas de la llamada" class="input-brand w-full px-3 py-2 text-sm">
                        </div>
                    ` : ''}
                </div>

                <div class="flex justify-end gap-2 pt-5">
                    <button data-ll-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="llGuardar" class="btn-primary text-sm">${esProgramar ? 'Programación' : 'Guardar'}</button>
                </div>
            </div>`;

        modal.querySelectorAll('[data-ll-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));

        function actualizarAsunto() {
            const contacto = modal.querySelector('#llContacto').value.trim();
            const prefijo = esProgramar ? 'Llamada programada con' : 'Llamada saliente a';
            modal.querySelector('#llAsunto').value = `${prefijo} ${contacto || 'Desconocido'}`;
        }
        modal.querySelector('#llTipoLlamada').addEventListener('change', (e) => {
            modal.querySelector('#llDatalistContacto').innerHTML = datalistHtml('dlContacto', e.target.value);
        });
        modal.querySelector('#llTipoRelacionado').addEventListener('change', (e) => {
            modal.querySelector('#llDatalistRelacionado').innerHTML = datalistHtml('dlRelacionado', e.target.value);
        });
        modal.querySelector('#llContacto').addEventListener('input', actualizarAsunto);
        modal.querySelector('#llReasignar').addEventListener('click', () => UCLA.components.toast.show('Reasignación de propietario — función simulada', 'info'));
        actualizarAsunto();

        if (esProgramar) {
            modal.querySelector('#llInicio').addEventListener('change', (e) => {
                const aviso = modal.querySelector('#llAvisoSolape');
                const fecha = e.target.value.split('T')[0];
                const reunion = (UCLA.data.reuniones || []).find((r) => r.todoElDia && r.inicio.split('T')[0] === fecha);
                if (reunion) {
                    aviso.classList.remove('hidden');
                    aviso.innerHTML = `<i class="fas fa-circle-info mr-1" style="color: var(--color-primary);"></i>Tiene una reunión de todo el día que se solapa con esta llamada programada: <a href="#" id="llVerReunion" class="font-medium hover:underline" style="color: var(--color-primary);">${reunion.titulo}</a>`;
                    modal.querySelector('#llVerReunion').addEventListener('click', (ev) => {
                        ev.preventDefault();
                        modal.classList.add('hidden');
                        UCLA.router.navigate('actividades/reuniones');
                    });
                } else {
                    aviso.classList.add('hidden');
                }
            });
        }

        modal.querySelector('#llGuardar').addEventListener('click', () => {
            let valido = true;
            if (esProgramar) {
                const inicio = modal.querySelector('#llInicio');
                if (!inicio.value) { inicio.style.borderColor = 'var(--color-danger)'; valido = false; }
            }
            if (!valido) return;

            const contactoNombre = modal.querySelector('#llContacto').value.trim();
            const nuevaLlamada = {
                id: 'lla-' + Date.now(),
                direccion: 'Saliente',
                estadoSaliente: esProgramar ? 'Programado' : 'Completado',
                inicio: esProgramar ? modal.querySelector('#llInicio').value : new Date().toISOString().slice(0, 16),
                duracionMin: esProgramar ? 0 : Number(modal.querySelector('#llMin').value || 0),
                duracionSeg: esProgramar ? 0 : Number(modal.querySelector('#llSeg').value || 0),
                propietario: modal.querySelector('#llPropietario').value,
                asunto: modal.querySelector('#llAsunto').value,
                relacionadoCon: `${modal.querySelector('#llTipoRelacionado').value} · ${modal.querySelector('#llRelacionado').value || 'Sin definir'}`,
                contactoNombre,
                proposito: modal.querySelector('#llProposito').value,
            };
            filas.unshift(nuevaLlamada);
            UCLA.components.toast.show(esProgramar ? 'Llamada programada exitosamente' : 'Llamada registrada exitosamente', 'success');

            const recordatorio = modal.querySelector('#llRecordatorio').value;
            if (recordatorio !== 'Ninguno') {
                UCLA.components.topbar.agregarNotificacion({ titulo: `Recordatorio: ${nuevaLlamada.asunto}`, detalle: recordatorio });
            }
            modal.classList.add('hidden');
            alGuardar();
        });

        modal.classList.remove('hidden');
    }

    UCLA.views['actividades/llamadas'] = { render };
})();

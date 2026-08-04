// Actividades · Tareas — listado sobre listShell/dataTable, con vista Kanban
// configurable (modal "Vista Kanban, Configuración").
(function () {
    const CAMPOS_MODULO = ['Asunto', 'Creado por', 'Estado', 'Etiqueta', 'Fecha de vencimiento', 'Hora de cierre', 'Hora de creación', 'Hora de la última actividad', 'Hora de modificación', 'Modificado por', 'Nombre de contacto', 'Prioridad', 'Relacionado con'];
    const CAMPOS_DISPONIBLES = ['Creado por', 'Descripción', 'Estado', 'Etiqueta', 'Fecha de vencimiento', 'Hora de cierre', 'Hora de creación', 'Hora de la última actividad', 'Hora de modificación', 'Modificado por', 'Nombre de contacto', 'Prioridad', 'Relacionado con'];
    const COLORES_MULTICOLOR = ['#1C7FA8', '#F5821F', '#2ECC71', '#E96B5A', '#1B3A4A'];

    let configKanban = null;
    let vistaActual = 'lista';
    let seleccionEnProgreso = [];

    function columnas() {
        return [
            { clave: 'asunto', etiqueta: 'Asunto', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.asunto}</span>` },
            { clave: 'prioridad', etiqueta: 'Prioridad', render: (f) => badgePrioridad(f.prioridad) },
            { clave: 'relacionadoCon', etiqueta: 'Relacionado con', render: (f) => f.relacionadoCon || '—' },
            { clave: 'contactoNombre', etiqueta: 'Nombre de contacto', render: (f) => f.contactoNombre || '—' },
        ];
    }

    function badgePrioridad(p) {
        const color = p === 'Alta' ? 'var(--color-danger)' : p === 'Media' ? 'var(--color-accent)' : 'var(--color-neutral-dark, #6B6F72)';
        return `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: ${color}22; color: ${color};">${p}</span>`;
    }

    function seccionesFormulario() {
        return [{
            titulo: 'Información de la tarea',
            camposIzquierda: [
                { clave: 'asunto', etiqueta: 'Asunto', tipo: 'text', obligatorio: true },
                { clave: 'prioridad', etiqueta: 'Prioridad', tipo: 'select', opciones: ['Alta', 'Media', 'Baja'] },
                { clave: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['No iniciada', 'En curso', 'Completada'] },
                { clave: 'fechaVencimiento', etiqueta: 'Fecha de vencimiento', tipo: 'date' },
            ],
            camposDerecha: [
                { clave: 'relacionadoCon', etiqueta: 'Relacionado con', tipo: 'text' },
                { clave: 'contactoNombre', etiqueta: 'Nombre de contacto', tipo: 'text' },
                { clave: 'propietario', etiqueta: 'Propietario', tipo: 'text' },
                { clave: 'etiqueta', etiqueta: 'Etiqueta', tipo: 'text' },
            ],
        }];
    }

    function render(container) {
        const filas = UCLA.data.tareas.slice();

        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Tareas',
                // listShell.render() reconstruye su estado (tipo de vista, filtros,
                // orden) desde cero en cada llamada; pintar() se vuelve a invocar al
                // crear una tarea o al guardar la configuración del Kanban, así que
                // hay que decirle explícitamente en qué vista quedarse — si no, cada
                // repintado regresaría siempre a la vista de lista.
                vistaInicial: vistaActual,
                onVistaCambiada: (tipo) => { vistaActual = tipo; },
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaVencimiento',
                exportName: 'tareas',
                botonPrincipal: {
                    etiqueta: 'Crear tarea',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva tarea',
                        secciones: seccionesFormulario(),
                        onGuardar: (datos) => {
                            filas.unshift({
                                id: 'tar-' + Date.now(),
                                asunto: datos.asunto || 'Sin asunto',
                                prioridad: datos.prioridad || 'Media',
                                estado: datos.estado || 'No iniciada',
                                fechaVencimiento: datos.fechaVencimiento || '',
                                relacionadoCon: datos.relacionadoCon || '',
                                contactoNombre: datos.contactoNombre || '',
                                propietario: datos.propietario || UCLA.state.usuarioActual.nombre,
                                etiqueta: datos.etiqueta || '',
                            });
                            pintar();
                        },
                    }),
                },
                renderKanban: (cuerpo) => {
                    if (!configKanban) {
                        UCLA.components.emptyState.bienvenida(cuerpo, {
                            titulo: 'Configure la vista Kanban',
                            botones: [{ id: 'config', etiqueta: 'Configurar vista Kanban', principal: true, onClick: () => abrirModalConfig(() => pintar()) }],
                        });
                        return;
                    }
                    cuerpo.innerHTML = '';
                    const cabecera = document.createElement('div');
                    cabecera.className = 'flex justify-end mb-3';
                    cabecera.innerHTML = `<button id="tarReconfigurar" class="text-xs font-medium hover:underline" style="color: var(--color-primary);"><i class="fas fa-gear mr-1"></i>Configurar vista Kanban</button>`;
                    cuerpo.appendChild(cabecera);
                    cabecera.querySelector('#tarReconfigurar').addEventListener('click', () => abrirModalConfig(() => pintar()));

                    const tablero = document.createElement('div');
                    cuerpo.appendChild(tablero);
                    const valores = [...new Set(filas.map((f) => f[configKanban.categorizarPor]))];
                    UCLA.components.kanbanBoard.render(tablero, {
                        campoEtapa: configKanban.categorizarPor,
                        columnas: valores.map((v, i) => ({ id: v, etiqueta: v, colorHeader: configKanban.estiloCabecera === 'Multicolor' ? COLORES_MULTICOLOR[i % COLORES_MULTICOLOR.length] : undefined })),
                        filas,
                        filaId: (f) => f.id,
                        renderTarjeta: (f) => `
                            <h5 class="font-bold text-gray-800 mb-1">${f.asunto}</h5>
                            ${configKanban.camposSeleccionados.filter((c) => c !== 'Asunto').map((c) => `<p class="text-xs text-gray-500">${c}: ${valorCampo(f, c)}</p>`).join('')}`,
                        onMover: (id, nuevoValor) => {
                            const tarea = filas.find((f) => f.id === id);
                            if (tarea) tarea[configKanban.categorizarPor] = nuevoValor;
                            UCLA.components.toast.show('Tarea actualizada', 'success');
                        },
                    });
                },
            });
        }

        pintar();
    }

    function valorCampo(f, etiquetaCampo) {
        const mapa = {
            'Prioridad': f.prioridad, 'Estado': f.estado, 'Etiqueta': f.etiqueta,
            'Fecha de vencimiento': UCLA.utils.formatoFecha(f.fechaVencimiento), 'Nombre de contacto': f.contactoNombre,
            'Relacionado con': f.relacionadoCon, 'Creado por': f.propietario, 'Modificado por': f.propietario,
        };
        return mapa[etiquetaCampo] || '—';
    }

    function abrirModalConfig(alGuardar) {
        let modal = document.getElementById('modalKanbanConfig');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalKanbanConfig';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        seleccionEnProgreso = configKanban ? configKanban.camposSeleccionados.filter((c) => c !== 'Asunto') : [];

        function pintarModal() {
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-kc-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold flex items-center gap-2" style="color: var(--color-primary-dark);">
                            Vista Kanban, Configuración <i class="fas fa-circle-question text-sm" style="color: var(--color-text-muted);"></i>
                        </h3>
                        <button data-kc-cerrar class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>

                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Nombre de la vista Kanban *</label>
                    <input id="kcNombre" type="text" value="${configKanban ? configKanban.nombre : ''}" class="input-brand w-full px-3 py-2 text-sm mb-4" style="border-color: var(--color-border);">

                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Categorizar por</label>
                            <select id="kcCategorizarPor" class="input-brand w-full px-3 py-2 text-sm">
                                <option value="estado" ${configKanban?.categorizarPor === 'estado' ? 'selected' : ''}>Estado</option>
                                <option value="prioridad" ${configKanban?.categorizarPor === 'prioridad' ? 'selected' : ''}>Prioridad</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Estilo de cabecera</label>
                            <select id="kcEstilo" class="input-brand w-full px-3 py-2 text-sm">
                                <option ${configKanban?.estiloCabecera === 'Monocolor' ? 'selected' : ''}>Monocolor</option>
                                <option ${configKanban?.estiloCabecera === 'Multicolor' ? 'selected' : ''}>Multicolor</option>
                            </select>
                        </div>
                    </div>

                    <p class="text-xs font-semibold uppercase mb-2" style="color: var(--color-text-muted);">Seleccionar campos</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="border rounded-lg p-3" style="border-color: var(--color-border);">
                            <p class="text-xs font-semibold mb-2" style="color: var(--color-text);">Disponible</p>
                            <input id="kcBuscarCampo" type="text" placeholder="Buscar campo..." class="input-brand w-full px-2 py-1 text-xs mb-2">
                            <div id="kcListaDisponible" class="space-y-1 max-h-48 overflow-y-auto"></div>
                        </div>
                        <div class="border rounded-lg p-3" style="border-color: var(--color-border);">
                            <p class="text-xs font-semibold mb-2" style="color: var(--color-text);">Seleccionado</p>
                            <div class="space-y-1">
                                <div class="flex items-center justify-between text-xs px-2 py-1 rounded" style="background: var(--color-primary-50);">
                                    <span style="color: var(--color-text);">Asunto *</span>
                                </div>
                                <div id="kcListaSeleccionado" class="space-y-1"></div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 pt-5">
                        <button data-kc-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="kcGuardar" class="btn-primary text-sm">Guardar</button>
                    </div>
                </div>`;

            pintarListas('');
            modal.querySelectorAll('[data-kc-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
            modal.querySelector('#kcBuscarCampo').addEventListener('input', (e) => pintarListas(e.target.value));
            modal.querySelector('#kcGuardar').addEventListener('click', () => {
                const nombreInput = modal.querySelector('#kcNombre');
                if (!nombreInput.value.trim()) {
                    nombreInput.style.borderColor = 'var(--color-danger)';
                    nombreInput.focus();
                    return;
                }
                configKanban = {
                    nombre: nombreInput.value.trim(),
                    categorizarPor: modal.querySelector('#kcCategorizarPor').value,
                    estiloCabecera: modal.querySelector('#kcEstilo').value,
                    camposSeleccionados: ['Asunto', ...seleccionEnProgreso],
                };
                modal.classList.add('hidden');
                alGuardar();
            });
            modal.querySelector('#kcNombre').addEventListener('focus', (e) => { e.target.style.borderColor = ''; });
        }

        function pintarListas(filtro) {
            const disponibles = CAMPOS_DISPONIBLES.filter((c) => !seleccionEnProgreso.includes(c) && c.toLowerCase().includes(filtro.toLowerCase()));
            modal.querySelector('#kcListaDisponible').innerHTML = disponibles.map((c) => `
                <button type="button" data-add-campo="${c}" class="w-full flex items-center justify-between text-xs px-2 py-1 rounded hover:bg-gray-50 text-left">
                    <span style="color: var(--color-text);">${c}</span>
                    <i class="fas fa-plus" style="color: var(--color-primary);"></i>
                </button>`).join('') || `<p class="text-xs" style="color: var(--color-text-muted);">Sin resultados.</p>`;

            modal.querySelector('#kcListaSeleccionado').innerHTML = seleccionEnProgreso.map((c) => `
                <div class="flex items-center justify-between text-xs px-2 py-1 rounded" style="background: var(--color-primary-50);">
                    <span style="color: var(--color-text);">${c}</span>
                    <button type="button" data-quitar-campo="${c}" style="color: var(--color-text-muted);"><i class="fas fa-times"></i></button>
                </div>`).join('');

            modal.querySelectorAll('[data-add-campo]').forEach((btn) => {
                btn.addEventListener('click', () => { seleccionEnProgreso.push(btn.getAttribute('data-add-campo')); pintarListas(modal.querySelector('#kcBuscarCampo').value); });
            });
            modal.querySelectorAll('[data-quitar-campo]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    seleccionEnProgreso = seleccionEnProgreso.filter((c) => c !== btn.getAttribute('data-quitar-campo'));
                    pintarListas(modal.querySelector('#kcBuscarCampo').value);
                });
            });
        }

        pintarModal();
        modal.classList.remove('hidden');
    }

    UCLA.views['actividades/tareas'] = { render };
})();

// Análisis — asistente de bienvenida de 2 pasos (primera visita), panel de
// control con componentes por defecto, modal "Agregar componente" y
// reordenar por drag & drop nativo entre celdas del grid.
(function () {
    const TIPOS_COMPONENTE = [
        { tipo: 'grafico', etiqueta: 'Gráfico', icono: 'fa-chart-column' },
        { tipo: 'kpi', etiqueta: 'KPI', icono: 'fa-arrow-trend-up' },
        { tipo: 'comparador', etiqueta: 'Comparador', icono: 'fa-scale-balanced' },
        { tipo: 'anomalias', etiqueta: 'Detector de anomalías', icono: 'fa-circle-nodes' },
        { tipo: 'medidor', etiqueta: 'Medidor de objetivos', icono: 'fa-bullseye' },
        { tipo: 'embudo', etiqueta: 'Embudo', icono: 'fa-filter' },
        { tipo: 'cohorte', etiqueta: 'Cohorte', icono: 'fa-table-cells' },
        { tipo: 'cuadrante', etiqueta: 'Cuadrante', icono: 'fa-border-all' },
        { tipo: 'zona', etiqueta: 'Zona', icono: 'fa-water' },
        { tipo: 'fase', etiqueta: 'Fase', icono: 'fa-layer-group' },
        { tipo: 'cascada', etiqueta: 'Cascada', icono: 'fa-stairs', insignia: true },
    ];

    const PASO2_ICONOS = ['KPI', 'Gráfico', 'Comparador', 'Cohorte', 'Zona', 'Embudo', 'Medidor de objetivos', 'Detector de anomalías', 'Cuadrante', 'Fase'];

    const ANCHO_POR_TIPO = {
        kpi: 'col-span-12 sm:col-span-6 lg:col-span-3',
        medidor: 'col-span-12 lg:col-span-6',
        embudo: 'col-span-12 lg:col-span-6',
        tablaRendimiento: 'col-span-12 lg:col-span-4',
        dona: 'col-span-12 lg:col-span-4',
        tablaAsesores: 'col-span-12 lg:col-span-4',
    };
    const ANCHO_DEFECTO = 'col-span-12 lg:col-span-4';

    let panelActivoId = 'panel-general';
    let pasoAsistente = 1;
    let arrastrandoId = null;

    function panelActivo() {
        const paneles = UCLA.state.getPaneles();
        return paneles.find((p) => p.id === panelActivoId) || paneles[0];
    }

    function render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 class="text-2xl font-bold" style="color: var(--color-primary-dark);">Análisis</h2>
                        <div class="flex items-center gap-2 mt-2">
                            <select id="filtroTodos" class="input-brand px-3 py-1.5 text-sm bg-white">
                                <option>Todos</option>
                            </select>
                            <select id="selectorPanel" class="input-brand px-3 py-1.5 text-sm bg-white"></select>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="btnRefrescar" title="Actualizar" class="p-2 rounded-lg hover:bg-gray-100" style="color: var(--color-text-muted);"><i class="fas fa-rotate"></i></button>
                        <button id="btnAgregarComponente" class="px-4 py-2 text-sm font-medium rounded-lg border" style="border-color: var(--color-primary); color: var(--color-primary);">
                            <i class="fas fa-plus mr-1"></i> Agregar componente
                        </button>
                        <button id="btnCrearPanel" class="btn-accent text-sm">Crear panel de información</button>
                        <button title="Más opciones" class="p-2 rounded-lg hover:bg-gray-100" style="color: var(--color-text-muted);"><i class="fas fa-ellipsis-vertical"></i></button>
                        <button title="Pantalla completa" class="p-2 rounded-lg hover:bg-gray-100" style="color: var(--color-text-muted);"><i class="fas fa-expand"></i></button>
                    </div>
                </div>

                <div id="gridPanel" class="grid grid-cols-12 gap-6"></div>
            </div>

            <!-- Modal: Agregar componente -->
            <div id="modalAgregarComponente" class="hidden fixed inset-0 z-50 modal">
                <div class="fixed inset-0 bg-black opacity-40" data-cerrar="modalAgregarComponente"></div>
                <div class="absolute left-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl p-6 overflow-y-auto">
                    <div class="flex justify-between items-center mb-5">
                        <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">Agregar componente</h3>
                        <button data-cerrar="modalAgregarComponente" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <div class="grid grid-cols-2 gap-3" id="gridTiposComponente">
                        ${TIPOS_COMPONENTE.map((t) => `
                            <button type="button" data-tipo-nuevo="${t.tipo}" class="flex items-center gap-2 p-3 rounded-lg border text-left hover:border-brand-500 transition-colors" style="border-color: var(--color-border);">
                                <i class="fas ${t.icono}" style="color: var(--color-primary);"></i>
                                <span class="text-sm flex-1" style="color: var(--color-text);">${t.etiqueta}</span>
                                ${t.insignia ? `<i class="fas fa-sparkles text-xs" style="color: var(--color-accent);"></i>` : ''}
                            </button>`).join('')}
                    </div>
                    <button type="button" id="btnGaleria" class="w-full mt-3 flex items-center gap-3 p-4 rounded-lg border" style="border-color: var(--color-border);">
                        <i class="fas fa-folder-open" style="color: var(--color-accent);"></i>
                        <span class="text-sm font-medium" style="color: var(--color-text);">Seleccionar de la galería</span>
                    </button>
                </div>
            </div>

            <!-- Modal: configurar componente nuevo -->
            <div id="modalConfigurarComponente" class="hidden fixed inset-0 z-50 flex items-center justify-center modal p-4">
                <div class="fixed inset-0 bg-black opacity-40" data-cerrar="modalConfigurarComponente"></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <h3 class="text-lg font-bold mb-4" style="color: var(--color-primary-dark);">Configurar componente</h3>
                    <form id="formConfigurarComponente" class="space-y-3">
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Módulo de datos</label>
                            <select id="cfgModulo" class="input-brand w-full px-3 py-2 text-sm">
                                <option>Solicitudes</option><option>Eventos</option><option>Seguimiento a egresados</option>
                                <option>Financiero</option><option>Alianzas</option><option>CRM</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Campo a medir</label>
                            <input id="cfgCampo" type="text" placeholder="Ej: Matrículas confirmadas" class="input-brand w-full px-3 py-2 text-sm">
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Periodo</label>
                                <select id="cfgPeriodo" class="input-brand w-full px-3 py-2 text-sm">
                                    <option>Este mes</option><option>Este trimestre</option><option>Este año</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Estilo visual</label>
                                <select id="cfgEstilo" class="input-brand w-full px-3 py-2 text-sm">
                                    <option>Turquesa</option><option>Naranja</option><option>Neutro</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 pt-3">
                            <button type="button" data-cerrar="modalConfigurarComponente" class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                            <button type="submit" class="btn-primary text-sm">Agregar al panel</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal: crear panel -->
            <div id="modalCrearPanel" class="hidden fixed inset-0 z-50 flex items-center justify-center modal p-4">
                <div class="fixed inset-0 bg-black opacity-40" data-cerrar="modalCrearPanel"></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <h3 class="text-lg font-bold mb-4" style="color: var(--color-primary-dark);">Crear panel de información</h3>
                    <form id="formCrearPanel" class="space-y-3">
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Nombre</label>
                            <input id="panelNombre" required type="text" class="input-brand w-full px-3 py-2 text-sm" placeholder="Ej: Panel Financiero Sede Bogotá">
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Categoría</label>
                            <input id="panelCategoria" type="text" class="input-brand w-full px-3 py-2 text-sm" placeholder="Ej: Coordinación académica">
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Visibilidad</label>
                            <select id="panelVisibilidad" class="input-brand w-full px-3 py-2 text-sm">
                                <option value="privado">Privado</option><option value="equipo">Equipo</option><option value="institucion">Institución</option>
                            </select>
                        </div>
                        <div class="flex justify-end gap-2 pt-3">
                            <button type="button" data-cerrar="modalCrearPanel" class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                            <button type="submit" class="btn-primary text-sm">Crear panel</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Asistente de bienvenida (solo primera visita) -->
            <div id="asistenteAnalisis" class="hidden fixed inset-0 z-50 flex items-center justify-center modal p-4"></div>
        `;

        pintarSelectorPaneles(container);
        pintarGrid(container);
        bind(container);

        if (!UCLA.state.analisisAsistenteVisto()) {
            pasoAsistente = 1;
            container.querySelector('#asistenteAnalisis').classList.remove('hidden');
            pintarAsistente(container);
        }
    }

    // ---------- Selector de panel ----------
    function pintarSelectorPaneles(container) {
        const select = container.querySelector('#selectorPanel');
        const paneles = UCLA.state.getPaneles();
        select.innerHTML = paneles.map((p) => `<option value="${p.id}" ${p.id === panelActivoId ? 'selected' : ''}>★ ${p.nombre}</option>`).join('');
    }

    // ---------- Grid principal ----------
    function pintarGrid(container) {
        const panel = panelActivo();
        const grid = container.querySelector('#gridPanel');

        if (!panel.componentes.length) {
            grid.innerHTML = `
                <div class="col-span-12 bg-white rounded-xl shadow-lg p-12 text-center" style="color: var(--color-text-muted);">
                    Este panel todavía no tiene componentes. Usa "Agregar componente" para empezar.
                </div>`;
            return;
        }

        grid.innerHTML = panel.componentes.map((c) => `
            <div class="${ANCHO_POR_TIPO[c.tipo] || ANCHO_DEFECTO}" data-comp-id="${c.id}" draggable="true">
                <div class="bg-white rounded-xl shadow-lg p-5 h-full relative group card-hover">
                    <div class="absolute top-3 right-3 hidden group-hover:flex items-center gap-1">
                        <button title="Mover" class="p-1 text-xs" style="color: var(--color-text-muted); cursor: grab;"><i class="fas fa-arrows-up-down-left-right"></i></button>
                        <button data-eliminar-comp="${c.id}" title="Eliminar" class="p-1 text-xs" style="color: var(--color-danger);"><i class="fas fa-trash"></i></button>
                    </div>
                    ${renderComponente(c)}
                </div>
            </div>
        `).join('');

        // Charts que necesitan canvas ya insertado en el DOM
        panel.componentes.forEach((c) => {
            if (c.tipo === 'dona') {
                UCLA.components.charts.initDoughnut(`dona-${c.id}`, { labels: c.etiquetas, data: c.valores });
            }
        });

        bindDragReorder(grid);
    }

    function renderComponente(c) {
        switch (c.tipo) {
            case 'kpi': return renderKpi(c);
            case 'medidor': return renderMedidor(c);
            case 'embudo': return renderEmbudo(c);
            case 'tablaRendimiento': return renderTablaRendimiento(c);
            case 'dona': return renderDona(c);
            case 'tablaAsesores': return renderTablaAsesores(c);
            default: return renderGenerico(c);
        }
    }

    function renderKpi(c) {
        return `
            <h4 class="text-sm font-medium" style="color: var(--color-text-muted);">${c.titulo}</h4>
            <p class="text-3xl font-bold mt-2" style="color: var(--color-primary);">${c.valor}</p>
            <p class="text-xs mt-2 font-semibold" style="color: ${c.positivo ? 'var(--color-success)' : 'var(--color-danger)'};">
                <i class="fas fa-arrow-${c.positivo ? 'up' : 'down'}"></i> ${c.variacion}
            </p>`;
    }

    function renderMedidor(c) {
        const pct = Math.min(1, c.valorActual / c.meta);
        const anguloAguja = -90 + pct * 180;
        return `
            <h4 class="text-sm font-medium mb-4" style="color: var(--color-text-muted);">${c.titulo}</h4>
            <div class="flex flex-col items-center">
                <div style="width:180px; height:90px; position:relative; overflow:hidden;">
                    <div style="width:180px; height:180px; border-radius:50%;
                        background: conic-gradient(from 270deg, var(--color-primary) 0deg, var(--color-primary) ${pct * 180}deg, var(--color-neutral-200, #E1E4E5) ${pct * 180}deg, var(--color-neutral-200, #E1E4E5) 180deg, transparent 180deg 360deg);">
                    </div>
                    <div style="position:absolute; left:50%; bottom:0; width:3px; height:74px; background: var(--color-accent-dark); transform-origin: bottom center; transform: translateX(-50%) rotate(${anguloAguja}deg); border-radius: 2px;"></div>
                    <div style="position:absolute; left:50%; bottom:-6px; width:14px; height:14px; margin-left:-7px; border-radius:50%; background: var(--color-primary-dark);"></div>
                </div>
                <p class="text-xl font-bold mt-2" style="color: var(--color-primary);">${c.valorActual.toLocaleString('es-CO')} <span class="text-sm font-normal" style="color: var(--color-text-muted);">/ ${c.meta.toLocaleString('es-CO')} ${c.unidad}</span></p>
                <p class="text-xs font-semibold" style="color: var(--color-text-muted);">${Math.round(pct * 100)}% de la meta anual</p>
            </div>`;
    }

    function renderEmbudo(c) {
        const pct = Math.min(1, c.valorActual / c.meta);
        const fmt = c.unidad === 'COP' ? UCLA.utils.formatoCOP : (v) => v.toLocaleString('es-CO');
        return `
            <h4 class="text-sm font-medium mb-4" style="color: var(--color-text-muted);">${c.titulo}</h4>
            <div class="flex justify-between text-sm font-semibold mb-1">
                <span style="color: var(--color-primary);">${fmt(c.valorActual)}</span>
                <span style="color: var(--color-text-muted);">Meta: ${fmt(c.meta)}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-4">
                <div class="h-4 rounded-full" style="width:${pct * 100}%; background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));"></div>
            </div>
            <p class="text-xs mt-2 font-semibold" style="color: var(--color-text-muted);">${Math.round(pct * 100)}% alcanzado</p>`;
    }

    function renderTablaRendimiento(c) {
        return `
            <h4 class="text-sm font-medium mb-3" style="color: var(--color-text-muted);">${c.titulo}</h4>
            <div class="overflow-x-auto">
                <table class="w-full text-xs">
                    <thead><tr style="color: var(--color-text-muted);">
                        <th class="text-left pb-2">Mes</th><th class="text-right pb-2">Leads</th><th class="text-right pb-2">Solic.</th>
                        <th class="text-right pb-2">Matríc.</th><th class="text-right pb-2">Ingresos</th><th class="text-right pb-2">Pendiente</th>
                    </tr></thead>
                    <tbody>
                        ${c.filas.map((f) => `
                            <tr style="border-top: 1px solid var(--color-border);">
                                <td class="py-1.5 font-medium" style="color: var(--color-text);">${f.mes}</td>
                                <td class="py-1.5 text-right">${f.leads}</td>
                                <td class="py-1.5 text-right">${f.solicitudes}</td>
                                <td class="py-1.5 text-right">${f.matriculas}</td>
                                <td class="py-1.5 text-right">${f.ingresos}</td>
                                <td class="py-1.5 text-right" style="color: var(--color-danger);">${f.pendiente}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    function renderDona(c) {
        return `
            <h4 class="text-sm font-medium mb-2" style="color: var(--color-text-muted);">${c.titulo}</h4>
            <div style="height:180px;"><canvas id="dona-${c.id}"></canvas></div>`;
    }

    function renderTablaAsesores(c) {
        return `
            <h4 class="text-sm font-medium mb-3" style="color: var(--color-text-muted);">${c.titulo}</h4>
            <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <tbody>
                    ${c.filas.map((f) => `
                        <tr style="border-top: 1px solid var(--color-border);">
                            <td class="py-2" style="color: var(--color-text);">${f.asesor}</td>
                            <td class="py-2 text-right font-bold" style="color: var(--color-primary);">${f.matriculas}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
            </div>`;
    }

    function renderGenerico(c) {
        return `
            <div class="flex items-center gap-2 mb-2">
                <i class="fas fa-chart-simple" style="color: var(--color-primary);"></i>
                <h4 class="text-sm font-medium" style="color: var(--color-text-muted);">${c.titulo}</h4>
            </div>
            <p class="text-xs" style="color: var(--color-text-muted);">${c.modulo} · ${c.campo} · ${c.periodo}</p>
            <p class="text-xs mt-2 italic" style="color: var(--color-neutral);">Componente simulado: sin datos reales conectados.</p>`;
    }

    // ---------- Drag & drop para reordenar ----------
    function bindDragReorder(grid) {
        grid.querySelectorAll('[data-comp-id]').forEach((card) => {
            card.addEventListener('dragstart', () => { arrastrandoId = card.getAttribute('data-comp-id'); card.style.opacity = '0.4'; });
            card.addEventListener('dragend', () => { card.style.opacity = '1'; arrastrandoId = null; });
            card.addEventListener('dragover', (e) => e.preventDefault());
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                const destinoId = card.getAttribute('data-comp-id');
                if (!arrastrandoId || arrastrandoId === destinoId) return;
                const panel = panelActivo();
                const origenIdx = panel.componentes.findIndex((c) => c.id === arrastrandoId);
                const destinoIdx = panel.componentes.findIndex((c) => c.id === destinoId);
                const [movido] = panel.componentes.splice(origenIdx, 1);
                panel.componentes.splice(destinoIdx, 0, movido);
                UCLA.state.actualizarPanel(panel.id, { componentes: panel.componentes });
                pintarGrid(grid.closest('#contentArea') || document);
            });
        });
    }

    // ---------- Asistente de bienvenida ----------
    function pintarAsistente(container) {
        const modal = container.querySelector('#asistenteAnalisis');
        if (pasoAsistente === 1) {
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 text-center">
                    <h3 class="text-xl font-bold" style="color: var(--color-primary-dark);">Estas son las funciones que le ofrece el panel de control de Análisis</h3>
                    <p class="text-sm mt-2" style="color: var(--color-text-muted);">Diez componentes analíticos con una interfaz basada en acciones de arrastrar y soltar</p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
                        ${['fa-filter', 'fa-chart-pie', 'fa-bullseye', 'fa-dollar-sign', 'fa-scale-balanced', 'fa-star'].map((ic) => `
                            <div class="aspect-video rounded-lg flex items-center justify-center" style="background: var(--color-primary-100);">
                                <i class="fas ${ic} text-2xl" style="color: var(--color-primary);"></i>
                            </div>`).join('')}
                    </div>
                    <button id="asistenteSiguiente" class="btn-primary px-8">Siguiente</button>
                </div>`;
            container.querySelector('#asistenteSiguiente').addEventListener('click', () => {
                pasoAsistente = 2;
                pintarAsistente(container);
            });
        } else {
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40"></div>
                <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8">
                    <div class="flex items-start justify-between flex-wrap gap-2 mb-1">
                        <h3 class="text-xl font-bold flex items-center gap-2" style="color: var(--color-primary-dark);">
                            Estas son las funciones que le ofrece el panel de control de Análisis
                            <i class="fas fa-circle-question text-sm" style="color: var(--color-text-muted);"></i>
                        </h3>
                        <a href="#" id="verificarEdiciones" class="text-xs font-medium hover:underline flex-shrink-0 ml-4" style="color: var(--color-primary);">Comprobar ediciones compatibles</a>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 my-6">
                        ${PASO2_ICONOS.map((nombre, i) => `
                            <div class="text-center">
                                <div class="w-14 h-14 mx-auto rounded-full flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);">
                                    <i class="fas ${TIPOS_COMPONENTE[i] ? TIPOS_COMPONENTE[i].icono : 'fa-star'} text-white"></i>
                                </div>
                                <p class="text-xs mt-2" style="color: var(--color-text-muted);">${nombre}</p>
                            </div>`).join('')}
                    </div>
                    <div class="flex justify-between">
                        <button id="asistenteAtras" style="color: var(--color-text-muted);">Atrás</button>
                        <button id="asistenteFin" class="btn-primary px-8">Fin</button>
                    </div>
                </div>`;
            container.querySelector('#asistenteAtras').addEventListener('click', () => { pasoAsistente = 1; pintarAsistente(container); });
            container.querySelector('#asistenteFin').addEventListener('click', () => {
                UCLA.state.marcarAnalisisAsistenteVisto();
                modal.classList.add('hidden');
            });
            container.querySelector('#verificarEdiciones').addEventListener('click', (e) => {
                e.preventDefault();
                UCLA.components.toast.show('Todas sus ediciones son compatibles', 'success');
            });
        }
    }

    // ---------- Interacciones generales ----------
    function bind(container) {
        container.querySelector('#selectorPanel').addEventListener('change', (e) => {
            panelActivoId = e.target.value;
            pintarGrid(container);
        });
        container.querySelector('#btnRefrescar').addEventListener('click', () => {
            pintarGrid(container);
            UCLA.components.toast.show('Panel actualizado', 'info');
        });

        const modalAgregar = container.querySelector('#modalAgregarComponente');
        container.querySelector('#btnAgregarComponente').addEventListener('click', () => modalAgregar.classList.remove('hidden'));

        let tipoPendiente = null;
        modalAgregar.querySelectorAll('[data-tipo-nuevo]').forEach((btn) => {
            btn.addEventListener('click', () => {
                tipoPendiente = btn.getAttribute('data-tipo-nuevo');
                modalAgregar.classList.add('hidden');
                container.querySelector('#modalConfigurarComponente').classList.remove('hidden');
            });
        });
        container.querySelector('#btnGaleria').addEventListener('click', () => {
            modalAgregar.classList.add('hidden');
            UCLA.components.toast.show('Galería de componentes prediseñados: función simulada', 'info');
        });

        container.querySelector('#formConfigurarComponente').addEventListener('submit', (e) => {
            e.preventDefault();
            const modulo = container.querySelector('#cfgModulo').value;
            const campo = container.querySelector('#cfgCampo').value || 'Sin definir';
            const periodo = container.querySelector('#cfgPeriodo').value;
            const tipoInfo = TIPOS_COMPONENTE.find((t) => t.tipo === tipoPendiente);
            const panel = panelActivo();
            panel.componentes.push({ id: 'c-' + Date.now(), tipo: tipoPendiente, titulo: tipoInfo.etiqueta, modulo, campo, periodo });
            UCLA.state.actualizarPanel(panel.id, { componentes: panel.componentes });
            container.querySelector('#modalConfigurarComponente').classList.add('hidden');
            e.target.reset();
            pintarGrid(container);
            UCLA.components.toast.show('Componente agregado al panel', 'success');
        });

        const modalCrearPanel = container.querySelector('#modalCrearPanel');
        container.querySelector('#btnCrearPanel').addEventListener('click', () => modalCrearPanel.classList.remove('hidden'));
        container.querySelector('#formCrearPanel').addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevo = {
                id: 'panel-' + Date.now(),
                nombre: container.querySelector('#panelNombre').value,
                categoria: container.querySelector('#panelCategoria').value,
                visibilidad: container.querySelector('#panelVisibilidad').value,
                componentes: [],
            };
            UCLA.state.guardarPanel(nuevo);
            panelActivoId = nuevo.id;
            modalCrearPanel.classList.add('hidden');
            e.target.reset();
            pintarSelectorPaneles(container);
            pintarGrid(container);
            UCLA.components.toast.show('Panel creado', 'success');
        });

        container.querySelectorAll('[data-cerrar]').forEach((el) => {
            el.addEventListener('click', () => document.getElementById(el.getAttribute('data-cerrar')).classList.add('hidden'));
        });

        container.querySelector('#gridPanel').addEventListener('click', (e) => {
            const btnEliminar = e.target.closest('[data-eliminar-comp]');
            if (!btnEliminar) return;
            const panel = panelActivo();
            panel.componentes = panel.componentes.filter((c) => c.id !== btnEliminar.getAttribute('data-eliminar-comp'));
            UCLA.state.actualizarPanel(panel.id, { componentes: panel.componentes });
            pintarGrid(container);
        });
    }

    UCLA.views['analisis'] = { render };
})();

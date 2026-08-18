// Orquesta el patrón de listado compartido por las 7 secciones de CRM:
// encabezado + toolbar (filtrar/ordenar/tipos de vista) + panel de filtros +
// dataTable + botón principal con acciones secundarias.
(function () {
    const TIPOS_VISTA = [
        { id: 'lista', icono: 'fa-list' },
        { id: 'kanban', icono: 'fa-table-columns' },
        { id: 'dinamica', icono: 'fa-table-cells-large' },
        { id: 'linea-tiempo', icono: 'fa-timeline' },
        { id: 'mapa', icono: 'fa-map-location-dot' },
        { id: 'dividida', icono: 'fa-table-columns' },
    ];

    // render() se llama una vez por navegación a una sección de CRM; se guarda
    // la referencia al listener de "cerrar menús al hacer clic afuera" para
    // quitarlo antes de registrar uno nuevo y no acumularlos en document.
    let cerrarMenusHandler = null;

    function render(container, config) {
        const estado = { filtroTexto: '', panelAbierto: false, ordenAsc: true, vista: config.vistaInicial || 'lista', camposActivos: [] };

        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 class="text-2xl font-bold" style="color: var(--color-primary-dark);">${config.titulo}</h2>
                        <div class="flex items-center gap-1 mt-1">
                            <span class="text-sm font-medium px-3 py-1 rounded-full" style="background: var(--color-primary-50); color: var(--color-primary);">Todas las ${config.titulo}</span>
                            <button title="Más opciones de vista" class="p-1.5 text-xs rounded hover:bg-gray-100" style="color: var(--color-text-muted);"><i class="fas fa-ellipsis-vertical"></i></button>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <div class="relative">
                            <button id="lsBtnPrincipal" class="btn-accent flex items-center gap-2">
                                <i class="fas fa-plus"></i> ${config.botonPrincipal.etiqueta}
                                <span data-caret class="border-l border-white border-opacity-30 pl-2 ml-1"><i class="fas fa-chevron-down text-xs"></i></span>
                            </button>
                            <div id="lsMenuCaret" class="hidden absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border py-1 z-20" style="border-color: var(--color-border);">
                                <button data-accion="importar" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Importar</button>
                                <button data-accion="combinar" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Combinar</button>
                            </div>
                        </div>
                        <div class="relative">
                            <button id="lsBtnMenu" class="p-2 rounded-lg border hover:bg-gray-50" style="border-color: var(--color-border); color: var(--color-text-muted);"><i class="fas fa-ellipsis-vertical"></i></button>
                            <div id="lsMenuOpciones" class="hidden absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border py-1 z-20" style="border-color: var(--color-border);">
                                <button data-accion="exportar" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Exportar</button>
                                <button data-accion="imprimir" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Imprimir</button>
                                <button data-accion="correo" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Enviar correo masivo</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        ${config.extraToolbarHtml || ''}
                        <button id="lsBtnFiltrar" class="px-3 py-1.5 text-sm rounded-lg border flex items-center gap-2" style="border-color: var(--color-border); color: var(--color-text);">
                            <i class="fas fa-filter"></i> Filtrar
                        </button>
                        <button id="lsBtnOrdenar" class="px-3 py-1.5 text-sm rounded-lg border flex items-center gap-2" style="border-color: var(--color-border); color: var(--color-text);">
                            <i class="fas fa-arrow-down-a-z"></i> Ordenar
                        </button>
                    </div>
                    <div class="flex items-center gap-1 bg-white rounded-lg border p-1" style="border-color: var(--color-border);">
                        ${TIPOS_VISTA.map((t) => `
                            <button data-vista="${t.id}" title="${t.id}" class="w-8 h-8 rounded flex items-center justify-center text-sm" style="color: ${estado.vista === t.id ? '#fff' : 'var(--color-text-muted)'}; background: ${estado.vista === t.id ? 'var(--color-primary)' : 'transparent'};">
                                <i class="fas ${t.icono}"></i>
                            </button>`).join('')}
                    </div>
                </div>

                <div class="flex items-start gap-4">
                    <div id="lsFiltro" class="hidden"></div>
                    <div id="lsCuerpo" class="flex-1 min-w-0"></div>
                </div>
            </div>`;

        function filasVisibles() {
            let filas = config.filas;
            if (estado.filtroTexto.trim()) {
                const t = estado.filtroTexto.trim().toLowerCase();
                filas = filas.filter((f) => JSON.stringify(f).toLowerCase().includes(t));
            }
            if (config.filtrarPorCampos && estado.camposActivos && estado.camposActivos.length) {
                filas = filas.filter((f) => config.filtrarPorCampos(f, estado.camposActivos));
            }
            const campoOrden = config.campoOrden || config.columnas[0].clave;
            filas = filas.slice().sort((a, b) => {
                const va = a[campoOrden];
                const vb = b[campoOrden];
                // Compara numéricamente cuando ambos valores lo son (p. ej. días de
                // mora, porcentajes) — comparar como texto ordenaría "155" antes
                // que "19" y rompería columnas numéricas.
                const cmp = (typeof va === 'number' && typeof vb === 'number')
                    ? va - vb
                    : String(va ?? '').localeCompare(String(vb ?? ''), 'es');
                return estado.ordenAsc ? cmp : -cmp;
            });
            return filas;
        }

        function pintarCuerpo() {
            const cuerpo = container.querySelector('#lsCuerpo');
            if (estado.vista === 'kanban' && config.renderKanban) {
                config.renderKanban(cuerpo);
                return;
            }
            if (config.vistas && config.vistas[estado.vista]) {
                config.vistas[estado.vista](cuerpo, filasVisibles());
                return;
            }
            UCLA.components.dataTable.render(cuerpo, {
                columnas: config.columnas,
                filas: filasVisibles(),
                filaId: config.filaId,
                onFilaClick: config.onFilaClick,
            });
        }

        function cerrarMenus() {
            container.querySelector('#lsMenuCaret')?.classList.add('hidden');
            container.querySelector('#lsMenuOpciones')?.classList.add('hidden');
        }

        // Filtro lateral
        container.querySelector('#lsBtnFiltrar').addEventListener('click', () => {
            estado.panelAbierto = !estado.panelAbierto;
            const panel = container.querySelector('#lsFiltro');
            panel.classList.toggle('hidden', !estado.panelAbierto);
            if (estado.panelAbierto) {
                UCLA.components.filterPanel.render(panel, {
                    camposModulo: config.camposModulo || [],
                    onBuscar: (texto) => { estado.filtroTexto = texto; UCLA.components.dataTable.resetPagina(container.querySelector('#lsCuerpo')); pintarCuerpo(); },
                    camposActivos: estado.camposActivos,
                    onCambioCampos: config.filtrarPorCampos ? (activos) => { estado.camposActivos = activos; pintarCuerpo(); } : undefined,
                });
            }
        });

        // Orden
        container.querySelector('#lsBtnOrdenar').addEventListener('click', () => {
            estado.ordenAsc = !estado.ordenAsc;
            pintarCuerpo();
            UCLA.components.toast.show(`Orden ${estado.ordenAsc ? 'ascendente' : 'descendente'}`, 'info');
        });

        // Tipos de vista
        container.querySelectorAll('[data-vista]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const tipo = btn.getAttribute('data-vista');
                const disponible = tipo === 'lista' || (tipo === 'kanban' && config.renderKanban) || (config.vistas && config.vistas[tipo]);
                if (!disponible) {
                    UCLA.components.toast.show('Esta sección no tiene esta vista disponible', 'info');
                    return;
                }
                estado.vista = tipo;
                container.querySelectorAll('[data-vista]').forEach((b) => {
                    const activo = b === btn;
                    b.style.color = activo ? '#fff' : 'var(--color-text-muted)';
                    b.style.background = activo ? 'var(--color-primary)' : 'transparent';
                });
                pintarCuerpo();
                if (config.onVistaCambiada) config.onVistaCambiada(tipo);
            });
        });

        // Botón principal + caret
        container.querySelector('#lsBtnPrincipal').addEventListener('click', (e) => {
            if (e.target.closest('[data-caret]')) {
                e.stopPropagation();
                cerrarMenus();
                container.querySelector('#lsMenuCaret').classList.toggle('hidden');
                return;
            }
            config.botonPrincipal.onClick();
        });
        container.querySelector('#lsMenuCaret').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-accion]');
            if (!btn) return;
            if (btn.getAttribute('data-accion') === 'importar') {
                UCLA.components.importWizard.abrir({ modulo: config.titulo });
            } else {
                UCLA.components.toast.show('Combinar registros: función simulada', 'info');
            }
            cerrarMenus();
        });

        // Menú de 3 puntos (exportar/imprimir/correo)
        container.querySelector('#lsBtnMenu').addEventListener('click', (e) => {
            e.stopPropagation();
            const abrir = container.querySelector('#lsMenuOpciones').classList.contains('hidden');
            cerrarMenus();
            container.querySelector('#lsMenuOpciones').classList.toggle('hidden', !abrir);
        });
        container.querySelector('#lsMenuOpciones').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-accion]');
            if (!btn) return;
            const accion = btn.getAttribute('data-accion');
            if (accion === 'exportar') UCLA.utils.exportCSV(config.exportName || 'export', filasVisibles());
            else if (accion === 'imprimir') UCLA.utils.exportPDF();
            else UCLA.components.toast.show('Correo masivo: función simulada', 'info');
            cerrarMenus();
        });

        if (cerrarMenusHandler) document.removeEventListener('click', cerrarMenusHandler);
        cerrarMenusHandler = cerrarMenus;
        document.addEventListener('click', cerrarMenusHandler);

        pintarCuerpo();
        if (config.onExtraToolbarBind) config.onExtraToolbarBind(container);
    }

    UCLA.components.listShell = { render };
})();

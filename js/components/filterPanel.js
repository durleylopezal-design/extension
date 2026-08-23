// Panel lateral izquierdo de filtros, usado por listShell.js en los módulos
// de listado. El buscador filtra de verdad (vía callback); "Filtrar por
// campos" también es real cuando la vista pasa filtrarPorCampos a listShell
// (p. ej. Solicitudes, Oportunidades) — si no, listShell simula el toast.
(function () {
    function render(container, { camposModulo, onBuscar, onCambioCampos, camposActivos, textoActual }) {
        const activos = camposActivos || [];
        const hayAlgoQueLimpiar = !!(textoActual || '').trim() || activos.length > 0;
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-4 w-full lg:w-64 lg:flex-shrink-0">
                <div class="flex items-center justify-between mb-4">
                    <div class="relative flex-1">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style="color: var(--color-text-muted);"></i>
                        <input id="filtroBuscador" type="text" placeholder="Buscar en esta vista" value="${(textoActual || '').replace(/"/g, '&quot;')}" class="input-brand w-full pl-8 pr-3 py-2 text-sm">
                    </div>
                    ${hayAlgoQueLimpiar ? `<button type="button" id="filtroLimpiar" class="ml-2 text-xs font-medium hover:underline flex-shrink-0" style="color: var(--color-primary);">Limpiar</button>` : ''}
                </div>

                <div>
                    <p class="text-xs font-semibold uppercase mb-2" style="color: var(--color-text-muted);">Filtrar por campos</p>
                    <div class="space-y-1.5">
                        ${camposModulo.map((f) => `
                            <label class="flex items-center gap-2 text-sm cursor-pointer" style="color: var(--color-text);">
                                <input type="checkbox" data-filtro-campo value="${f}" ${activos.includes(f) ? 'checked' : ''}>${f}
                            </label>`).join('')}
                    </div>
                </div>
            </div>`;

        container.querySelector('#filtroBuscador').addEventListener('input', UCLA.utils.debounce((e) => onBuscar(e.target.value), 200));
        container.querySelector('#filtroLimpiar')?.addEventListener('click', () => {
            onBuscar('');
            if (onCambioCampos) onCambioCampos([]);
            render(container, { camposModulo, onBuscar, onCambioCampos, camposActivos: [], textoActual: '' });
        });
        container.querySelectorAll('[data-filtro-campo]').forEach((chk) => {
            chk.addEventListener('change', () => {
                if (onCambioCampos) {
                    const marcados = Array.from(container.querySelectorAll('[data-filtro-campo]:checked')).map((el) => el.value);
                    onCambioCampos(marcados);
                } else if (chk.checked) {
                    UCLA.components.toast.show('Filtro aplicado (simulado)', 'info');
                }
            });
        });
    }

    UCLA.components.filterPanel = { render };
})();

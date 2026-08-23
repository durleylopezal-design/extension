// Panel lateral izquierdo de filtros, usado por listShell.js en las 7
// secciones de CRM. El buscador filtra de verdad (vía callback); las
// secciones "Filtros definidos por el sistema" y "Filtrar por campos" son
// fieles visualmente pero presentacionales (coherente con el resto del
// prototipo — no hay backend que resuelva combinaciones de filtros reales).
(function () {
    const FILTROS_SISTEMA = [
        'Acción en registro', 'Acción en registros relacionados', 'Actividades', 'Bloqueado',
        'Campañas', 'Registros modificados', 'Registros no modificados',
        'Último estado de correo electrónico', 'Cadencias',
    ];

    function render(container, { camposModulo, onBuscar, onCambioCampos, camposActivos, textoActual }) {
        const activos = camposActivos || [];
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-4 w-full lg:w-64 lg:flex-shrink-0">
                <div class="relative mb-4">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style="color: var(--color-text-muted);"></i>
                    <input id="filtroBuscador" type="text" placeholder="Buscar en esta vista" value="${(textoActual || '').replace(/"/g, '&quot;')}" class="input-brand w-full pl-8 pr-3 py-2 text-sm">
                </div>

                <div class="mb-4">
                    <p class="text-xs font-semibold uppercase mb-2" style="color: var(--color-text-muted);">Filtros definidos por el sistema</p>
                    <div class="space-y-1.5">
                        ${FILTROS_SISTEMA.map((f) => `
                            <label class="flex items-center gap-2 text-sm cursor-pointer" style="color: var(--color-text);">
                                <input type="checkbox" data-filtro-sistema>${f}
                            </label>`).join('')}
                    </div>
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
        container.querySelectorAll('[data-filtro-sistema]').forEach((chk) => {
            chk.addEventListener('change', () => {
                if (chk.checked) UCLA.components.toast.show('Filtro aplicado (simulado)', 'info');
            });
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

    UCLA.components.filterPanel = { render, FILTROS_SISTEMA };
})();

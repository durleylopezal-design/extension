// Estado "Módulo en construcción" para cualquier ruta de la especificación que
// todavía no tiene una vista real implementada (fases 2-4).
(function () {
    function render(container, { titulo, ruta }) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-24 bg-white rounded-xl shadow-lg">
                <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4" style="background: var(--color-primary-50);">
                    <i class="fas fa-tools text-2xl" style="color: var(--color-primary);"></i>
                </div>
                <h3 class="text-lg font-bold" style="color: var(--color-primary);">${titulo}</h3>
                <p class="text-sm mt-2 max-w-md" style="color: var(--color-text-muted);">
                    Este módulo está en construcción. Se implementará en una próxima iteración del CRM.
                </p>
                <p class="text-xs mt-4 font-mono" style="color: var(--color-neutral);">#/${ruta}</p>
            </div>
        `;
    }

    UCLA.components.placeholder = { render };
})();

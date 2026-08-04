// Estados vacíos reutilizables: pantalla de bienvenida (Previsiones, Campañas)
// y mensaje corto para tablas/columnas Kanban sin registros.
(function () {
    // Pantalla de bienvenida grande: título + subtítulo + bloques ilustrados + botón(es).
    function bienvenida(container, { titulo, bloques, botones, alineacion = 'center' }) {
        const alinear = alineacion === 'left' ? 'text-left items-start' : 'text-center items-center';
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-12">
                <div class="flex flex-col ${alinear} max-w-3xl ${alineacion === 'left' ? '' : 'mx-auto'}">
                    <h3 class="text-2xl font-bold mb-8" style="color: var(--color-primary-dark);">${titulo}</h3>
                    ${bloques ? `
                        <div class="grid grid-cols-1 md:grid-cols-${bloques.length} gap-8 mb-8 w-full">
                            ${bloques.map((b) => `
                                <div class="flex flex-col ${alinear}">
                                    <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4" style="background: var(--color-neutral-50, #F9F9F9); border: 2px solid var(--color-accent);">
                                        <i class="fas ${b.icono} text-xl" style="color: var(--color-accent);"></i>
                                    </div>
                                    <h4 class="font-bold text-sm mb-1" style="color: var(--color-text);">${b.titulo}</h4>
                                    <p class="text-sm" style="color: var(--color-text-muted);">${b.descripcion}</p>
                                </div>
                            `).join('')}
                        </div>` : ''}
                    ${botones ? `<div class="flex gap-3">${botones.map((b) => `
                        <button type="button" data-empty-accion="${b.id}" class="${b.principal ? 'btn-accent' : 'btn-primary'}">${b.etiqueta}</button>
                    `).join('')}</div>` : ''}
                </div>
            </div>`;

        if (botones) {
            botones.forEach((b) => {
                container.querySelector(`[data-empty-accion="${b.id}"]`)?.addEventListener('click', () => b.onClick && b.onClick());
            });
        }
    }

    // Mensaje corto centrado (columna Kanban vacía, tabla sin resultados).
    function mensajeCorto(container, texto) {
        container.innerHTML = `<p class="text-sm text-center py-8" style="color: var(--color-text-muted);">${texto}</p>`;
    }

    UCLA.components.emptyState = { bienvenida, mensajeCorto };
})();

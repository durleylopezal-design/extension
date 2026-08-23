// Control de paginación reutilizable: Anterior/Siguiente + números de página
// con elipsis compacta cuando hay muchas páginas. Usado por dataTable.js y por
// cualquier otra lista/galería que necesite paginar (ver UCLA.components.pagination).
// No lleva estado propio: quien lo usa pasa la página actual y un callback
// onCambiar(pagina) que decide qué hacer (volver a pintar, hacer scroll, etc.).
(function () {
    // Genera la secuencia de botones a mostrar: siempre primera y última
    // página, la página actual con un vecino a cada lado, y "…" donde se
    // salte un tramo. Con pocas páginas (<=7) simplemente las muestra todas.
    function rangoPaginas(actual, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const paginas = new Set([1, total, actual, actual - 1, actual + 1]);
        const ordenadas = Array.from(paginas).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
        const resultado = [];
        ordenadas.forEach((p, i) => {
            if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push('…');
            resultado.push(p);
        });
        return resultado;
    }

    // `etiquetaRegistro` es la forma singular ("registro", "plantilla"); si el
    // plural no es solo "+s" (p. ej. "publicación" → "publicaciones"), quien
    // llama puede pasar `etiquetaRegistroPlural` explícito.
    function render(container, { paginaActual, totalPaginas, totalRegistros, onCambiar, etiquetaRegistro = 'registro', etiquetaRegistroPlural }) {
        if (!container) return;
        const plural = etiquetaRegistroPlural || `${etiquetaRegistro}s`;
        const etiqueta = (n) => (n === 1 ? etiquetaRegistro : plural);
        if (totalPaginas <= 1) {
            container.innerHTML = typeof totalRegistros === 'number'
                ? `<span class="text-xs" style="color: var(--color-text-muted);">${totalRegistros} ${etiqueta(totalRegistros)}</span>`
                : '';
            return;
        }

        const botonesPagina = rangoPaginas(paginaActual, totalPaginas).map((p) => {
            if (p === '…') return `<span class="px-2 text-xs select-none" style="color: var(--color-text-muted);" aria-hidden="true">…</span>`;
            const activo = p === paginaActual;
            return `
                <button type="button" data-pag-ir="${p}"
                    class="min-w-[28px] h-7 px-1.5 text-xs font-medium rounded transition-colors ${activo ? '' : 'hover:bg-gray-100'}"
                    style="${activo ? 'background: var(--color-primary); color: #fff;' : 'color: var(--color-text);'}"
                    aria-label="Ir a la página ${p}" ${activo ? 'aria-current="page"' : ''}>${p}</button>`;
        }).join('');

        container.innerHTML = `
            <nav class="flex items-center justify-between flex-wrap gap-3" role="navigation" aria-label="Paginación">
                <span class="text-xs order-2 sm:order-1" style="color: var(--color-text-muted);">
                    ${typeof totalRegistros === 'number' ? `${totalRegistros} ${etiqueta(totalRegistros)} · ` : ''}Página ${paginaActual} de ${totalPaginas}
                </span>
                <div class="flex items-center gap-1 order-1 sm:order-2 flex-wrap">
                    <button type="button" data-pag-prev
                        class="h-7 px-2 text-xs font-medium rounded border flex items-center gap-1"
                        style="border-color: var(--color-border); color: ${paginaActual === 1 ? 'var(--color-neutral)' : 'var(--color-primary)'}; ${paginaActual === 1 ? 'cursor: not-allowed;' : ''}"
                        ${paginaActual === 1 ? 'disabled aria-disabled="true"' : ''} aria-label="Página anterior">
                        <i class="fas fa-chevron-left text-[10px]"></i><span class="hidden sm:inline">Anterior</span>
                    </button>
                    <div class="flex items-center gap-0.5">${botonesPagina}</div>
                    <button type="button" data-pag-next
                        class="h-7 px-2 text-xs font-medium rounded border flex items-center gap-1"
                        style="border-color: var(--color-border); color: ${paginaActual === totalPaginas ? 'var(--color-neutral)' : 'var(--color-primary)'}; ${paginaActual === totalPaginas ? 'cursor: not-allowed;' : ''}"
                        ${paginaActual === totalPaginas ? 'disabled aria-disabled="true"' : ''} aria-label="Página siguiente">
                        <span class="hidden sm:inline">Siguiente</span><i class="fas fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            </nav>`;

        container.querySelector('[data-pag-prev]')?.addEventListener('click', () => { if (paginaActual > 1) onCambiar(paginaActual - 1); });
        container.querySelector('[data-pag-next]')?.addEventListener('click', () => { if (paginaActual < totalPaginas) onCambiar(paginaActual + 1); });
        container.querySelectorAll('[data-pag-ir]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const p = Number(btn.getAttribute('data-pag-ir'));
                if (p !== paginaActual) onCambiar(p);
            });
        });
    }

    UCLA.components.pagination = { render };
})();

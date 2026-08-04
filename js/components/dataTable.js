// Tabla genérica reutilizable por los listados de CRM: checkbox de selección,
// columnas configurables, filas alternas, hover turquesa, paginación en
// cliente (10 filas/página) y estado vacío.
(function () {
    const PAGINA_SIZE = 10;
    const paginaPorContenedor = new WeakMap();

    function render(container, { columnas, filas, filaId, onFilaClick }) {
        if (!paginaPorContenedor.has(container)) paginaPorContenedor.set(container, 1);
        let pagina = paginaPorContenedor.get(container);
        const totalPaginas = Math.max(1, Math.ceil(filas.length / PAGINA_SIZE));
        if (pagina > totalPaginas) pagina = totalPaginas;

        if (!filas.length) {
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="p-12 text-center text-sm" style="color: var(--color-text-muted);">No se encontraron registros.</div>
                </div>`;
            return;
        }

        const inicio = (pagina - 1) * PAGINA_SIZE;
        const filasPagina = filas.slice(inicio, inicio + PAGINA_SIZE);

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--color-primary-100);">
                                <th class="w-10 px-4 py-3"><input type="checkbox" data-check-todos></th>
                                ${columnas.map((c) => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">${c.etiqueta}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${filasPagina.map((fila, i) => `
                                <tr data-fila-id="${filaId(fila)}" class="hover:bg-brand-50 transition-colors cursor-pointer" style="${i % 2 === 1 ? 'background: var(--color-primary-50);' : ''} border-bottom: 1px solid var(--color-border);">
                                    <td class="px-4 py-3" onclick="event.stopPropagation()"><input type="checkbox" data-check-fila></td>
                                    ${columnas.map((c) => `<td class="px-4 py-3 text-sm" style="color: var(--color-text);">${c.render ? c.render(fila) : (fila[c.clave] ?? '')}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="flex items-center justify-between px-4 py-3" style="border-top: 1px solid var(--color-border);">
                    <span class="text-xs" style="color: var(--color-text-muted);">${filas.length} registro${filas.length === 1 ? '' : 's'}</span>
                    ${totalPaginas > 1 ? `
                        <div class="flex items-center gap-2">
                            <button data-pag-prev class="px-2 py-1 text-xs rounded border" style="border-color: var(--color-border); color: ${pagina === 1 ? 'var(--color-neutral)' : 'var(--color-primary)'};" ${pagina === 1 ? 'disabled' : ''}>‹ Anterior</button>
                            <span class="text-xs" style="color: var(--color-text-muted);">Página ${pagina} de ${totalPaginas}</span>
                            <button data-pag-next class="px-2 py-1 text-xs rounded border" style="border-color: var(--color-border); color: ${pagina === totalPaginas ? 'var(--color-neutral)' : 'var(--color-primary)'};" ${pagina === totalPaginas ? 'disabled' : ''}>Siguiente ›</button>
                        </div>` : '<span></span>'}
                </div>
            </div>`;

        container.querySelector('[data-pag-prev]')?.addEventListener('click', () => {
            paginaPorContenedor.set(container, Math.max(1, pagina - 1));
            render(container, { columnas, filas, filaId, onFilaClick });
        });
        container.querySelector('[data-pag-next]')?.addEventListener('click', () => {
            paginaPorContenedor.set(container, Math.min(totalPaginas, pagina + 1));
            render(container, { columnas, filas, filaId, onFilaClick });
        });

        if (onFilaClick) {
            container.querySelectorAll('[data-fila-id]').forEach((tr) => {
                tr.addEventListener('click', () => {
                    const fila = filas.find((f) => String(filaId(f)) === tr.getAttribute('data-fila-id'));
                    if (fila) onFilaClick(fila);
                });
            });
        }

        container.querySelector('[data-check-todos]')?.addEventListener('click', (e) => {
            container.querySelectorAll('[data-check-fila]').forEach((chk) => { chk.checked = e.target.checked; });
        });
    }

    function resetPagina(container) {
        paginaPorContenedor.set(container, 1);
    }

    UCLA.components.dataTable = { render, resetPagina };
})();

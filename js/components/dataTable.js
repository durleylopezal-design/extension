// Tabla genérica reutilizable por los listados de CRM: checkbox de selección,
// columnas configurables, filas alternas, hover turquesa, paginación en
// cliente (5 filas/página, vía UCLA.components.pagination) y estado vacío.
(function () {
    const PAGINA_SIZE = 5;
    const paginaPorContenedor = new WeakMap();

    // `paginaControlada`/`onPaginaCambiada` son opcionales: quien ya lleva su
    // propia página (listShell.js, para sobrevivir al remount completo que
    // hace cada módulo tras crear/editar/eliminar un registro) los pasa para
    // que dataTable no vuelva a página 1 en cada repintado. Sin ellos, la
    // tabla se autogestiona con su propio WeakMap (comportamiento anterior),
    // útil para los llamados directos que no envuelven un `container` estable
    // entre repintados (p. ej. la vista dividida de Oportunidades).
    function render(container, { columnas, filas, filaId, onFilaClick, paginaControlada, onPaginaCambiada }) {
        const controlada = typeof paginaControlada === 'number';
        if (!controlada) {
            if (!paginaPorContenedor.has(container)) paginaPorContenedor.set(container, 1);
        }
        let pagina = controlada ? paginaControlada : paginaPorContenedor.get(container);
        const totalPaginas = Math.max(1, Math.ceil(filas.length / PAGINA_SIZE));
        // Si la página guardada quedó fuera de rango (p. ej. se eliminó el
        // último registro de la última página, o un filtro nuevo devuelve
        // menos resultados), se recorta a la última página válida y se
        // persiste — así el próximo render (incluida la propia paginación)
        // parte del valor correcto en vez de recalcularlo cada vez.
        if (pagina > totalPaginas) {
            pagina = totalPaginas;
            if (controlada) onPaginaCambiada(pagina); else paginaPorContenedor.set(container, pagina);
        }

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
                                <th class="w-10 px-4 py-3"><input type="checkbox" data-check-todos aria-label="Seleccionar todas las filas de esta página"></th>
                                ${columnas.map((c) => `<th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">${c.etiqueta}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${filasPagina.map((fila, i) => `
                                <tr data-fila-id="${filaId(fila)}" class="hover:bg-brand-50 transition-colors cursor-pointer" style="${i % 2 === 1 ? 'background: var(--color-primary-50);' : ''} border-bottom: 1px solid var(--color-border);">
                                    <td class="px-4 py-3" onclick="event.stopPropagation()"><input type="checkbox" data-check-fila aria-label="Seleccionar fila"></td>
                                    ${columnas.map((c) => `<td class="px-4 py-3 text-sm" style="color: var(--color-text);">${c.render ? c.render(fila) : (fila[c.clave] ?? '')}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="px-4 py-3" style="border-top: 1px solid var(--color-border);" data-paginacion></div>
            </div>`;

        UCLA.components.pagination.render(container.querySelector('[data-paginacion]'), {
            paginaActual: pagina,
            totalPaginas,
            totalRegistros: filas.length,
            etiquetaRegistro: 'registro',
            onCambiar: (nuevaPagina) => {
                if (controlada) { onPaginaCambiada(nuevaPagina); return; }
                paginaPorContenedor.set(container, nuevaPagina);
                render(container, { columnas, filas, filaId, onFilaClick });
            },
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

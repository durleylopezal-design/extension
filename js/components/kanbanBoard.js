// Tablero Kanban genérico con drag & drop nativo entre columnas (mismo
// mecanismo dragstart/dragover/drop que ya se usaba en el pipeline de
// Oportunidades). Parametrizado por columnas/etapas y una función de
// renderizado de tarjeta.
(function () {
    function render(container, { columnas, filas, filaId, renderTarjeta, onMover, campoEtapa = 'etapa', sumarPor }) {
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                ${columnas.map((col) => {
                    const filasCol = filas.filter((f) => f[campoEtapa] === col.id);
                    const subtotal = sumarPor ? filasCol.reduce((s, f) => s + (Number(f[sumarPor]) || 0), 0) : null;
                    return `
                        <div class="kanban-column p-4" data-etapa="${col.id}">
                            <div class="flex items-center justify-between mb-1">
                                <h4 class="font-bold text-sm" style="color: var(--color-primary-dark);">${col.etiqueta}</h4>
                                <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">${filasCol.length}</span>
                            </div>
                            ${subtotal !== null ? `<p class="text-xs mb-1" style="color: var(--color-text-muted);">${UCLA.utils.formatoCOP(subtotal)}</p>` : ''}
                            ${col.pct !== undefined ? `<p class="text-xs font-semibold mb-4" style="color: var(--color-accent-dark);">${col.pct}%</p>` : '<div class="mb-3"></div>'}
                            <div class="space-y-3 kanban-drop-target" data-col-id="${col.id}">
                                ${filasCol.length ? filasCol.map((f) => `
                                    <div draggable="true" data-tarjeta-id="${filaId(f)}" class="kanban-card bg-white p-4 rounded-lg shadow border-l-4 border-brand-500">
                                        ${renderTarjeta(f)}
                                    </div>`).join('') : `<p class="text-xs text-center py-6" style="color: var(--color-text-muted);">No se encontraron oportunidades</p>`}
                            </div>
                        </div>`;
                }).join('')}
            </div>`;

        let arrastrandoId = null;

        container.querySelectorAll('[data-tarjeta-id]').forEach((card) => {
            card.addEventListener('dragstart', () => { arrastrandoId = card.getAttribute('data-tarjeta-id'); card.classList.add('drag-ghost'); });
            card.addEventListener('dragend', () => card.classList.remove('drag-ghost'));
        });

        container.querySelectorAll('.kanban-drop-target').forEach((target) => {
            target.addEventListener('dragover', (e) => { e.preventDefault(); target.closest('.kanban-column').classList.add('drag-over'); });
            target.addEventListener('dragleave', () => target.closest('.kanban-column').classList.remove('drag-over'));
            target.addEventListener('drop', (e) => {
                e.preventDefault();
                target.closest('.kanban-column').classList.remove('drag-over');
                if (!arrastrandoId) return;
                const tarjeta = container.querySelector(`[data-tarjeta-id="${arrastrandoId}"]`);
                if (!tarjeta) return;
                const vacio = target.querySelector('p');
                if (vacio) vacio.remove();
                target.appendChild(tarjeta);
                const nuevaEtapa = target.getAttribute('data-col-id');
                if (onMover) onMover(arrastrandoId, nuevaEtapa);
            });
        });
    }

    UCLA.components.kanbanBoard = { render };
})();

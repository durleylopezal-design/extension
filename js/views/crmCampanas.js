// CRM · Campañas — pantalla de bienvenida alineada a la izquierda.
(function () {
    function render(container) {
        container.innerHTML = `
            <div class="space-y-4">
                <h2 class="text-2xl font-bold" style="color: var(--color-primary-dark);">Campañas</h2>
                <div id="campanasCuerpo"></div>
            </div>`;

        UCLA.components.emptyState.bienvenida(container.querySelector('#campanasCuerpo'), {
            titulo: 'Planificar campañas de captación',
            alineacion: 'left',
            botones: [
                { id: 'crear', etiqueta: 'Crear', principal: true, onClick: () => UCLA.components.toast.show('Nueva campaña — función simulada', 'info') },
                { id: 'importar', etiqueta: 'Importar', principal: false, onClick: () => UCLA.components.toast.show('Importar campañas — función simulada', 'info') },
            ],
        });

        const titulo = container.querySelector('#campanasCuerpo h3');
        titulo.insertAdjacentHTML('afterend', `<p class="text-sm mb-8 max-w-xl" style="color: var(--color-text-muted);">Las campañas son iniciativas de mercadeo educativo planificadas, ejecutadas y monitoreadas desde su CRM.</p>`);
    }

    UCLA.views['crm/campanas'] = { render };
})();

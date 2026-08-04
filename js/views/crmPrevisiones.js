// CRM · Previsiones de Matrícula — pantalla de bienvenida.
(function () {
    function render(container) {
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold" style="color: var(--color-primary-dark);">Previsiones de Matrícula</h2>
                    <a href="#" id="previsionesAyuda" class="text-sm font-medium hover:underline" style="color: var(--color-primary);"><i class="fas fa-circle-question mr-1"></i>Ayuda</a>
                </div>
                <div id="previsionesCuerpo"></div>
            </div>`;

        UCLA.components.emptyState.bienvenida(container.querySelector('#previsionesCuerpo'), {
            titulo: 'Pronostique sus matrículas',
            bloques: [
                { icono: 'fa-bullseye', titulo: 'Establecer objetivo de matrícula', descripcion: 'Establezca una meta a los asesores de su institución para motivar la captación de nuevos estudiantes.' },
                { icono: 'fa-chart-line', titulo: 'Seguimiento de logros', descripcion: 'Vea el avance de cada asesor en cualquier momento frente a la meta asignada para el periodo de la previsión.' },
                { icono: 'fa-magnifying-glass-chart', titulo: 'Predecir y analizar', descripcion: 'Analice los resultados y establezca una meta ideal para los próximos periodos académicos.' },
            ],
            botones: [
                { id: 'configurar', etiqueta: 'Configurar ahora', principal: true, onClick: () => UCLA.components.toast.show('Configuración de previsiones — función simulada', 'info') },
            ],
        });

        container.querySelector('#previsionesAyuda').addEventListener('click', (e) => {
            e.preventDefault();
            UCLA.components.toast.show('Centro de ayuda — función simulada', 'info');
        });
    }

    UCLA.views['crm/previsiones'] = { render };
})();

// Detalle de un informe — dos gráficos genéricos (tendencia + distribución)
// construidos con datos de ejemplo coherentes con el módulo del informe.
(function () {
    const MESES = ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'];

    function hashSemilla(texto) {
        let h = 0;
        for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) % 1000;
        return h;
    }

    function serieTendencia(semilla) {
        return MESES.map((_, i) => 20 + ((semilla + i * 37) % 60));
    }

    function render(container, params) {
        const informe = UCLA.data.informes.find((i) => i.id === params.id);

        if (!informe) {
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p style="color: var(--color-text-muted);">No se encontró el informe solicitado.</p>
                    <button id="volverInformes" class="btn-primary mt-4">Volver a Informes</button>
                </div>`;
            container.querySelector('#volverInformes').addEventListener('click', () => UCLA.router.navigate('informes'));
            return;
        }

        const semilla = hashSemilla(informe.id);
        const esLinea = informe.tipoGrafico === 'linea';

        container.innerHTML = `
            <div class="space-y-6">
                <div>
                    <button id="volverInformes" class="text-sm font-medium hover:underline flex items-center gap-1 mb-3" style="color: var(--color-primary);">
                        <i class="fas fa-arrow-left text-xs"></i> Volver a Informes
                    </button>
                    <h2 class="text-2xl font-bold" style="color: var(--color-primary);">${informe.nombre}</h2>
                    <p class="text-sm mt-1" style="color: var(--color-text-muted);">${informe.descripcion}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs" style="color: var(--color-text-muted);">
                        <span><i class="fas fa-folder"></i> ${informe.carpeta}</span>
                        <span><i class="fas fa-calendar"></i> Actualizado ${UCLA.utils.formatoFecha(informe.ultimaModificacion)}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden" style="border-top: 4px solid var(--color-primary);">
                        <div class="p-6 pb-2">
                            <h3 class="section-title text-base">Tendencia últimos 6 meses</h3>
                        </div>
                        <div class="chart-container px-6 pb-6">
                            <canvas id="chartTendencia"></canvas>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden" style="border-top: 4px solid var(--color-accent);">
                        <div class="p-6 pb-2">
                            <h3 class="section-title text-base">Distribución por sede</h3>
                        </div>
                        <div class="chart-container px-6 pb-6">
                            <canvas id="chartDistribucion"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.querySelector('#volverInformes').addEventListener('click', () => UCLA.router.navigate('informes'));

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = informe.nombre;
        document.title = informe.nombre + ' · UCLA Extensión CRM';

        UCLA.components.charts.initBar('chartTendencia', {
            tipo: esLinea ? 'line' : 'bar',
            labels: MESES,
            datasets: [{
                label: informe.nombre,
                data: serieTendencia(semilla),
                backgroundColor: 'rgba(28, 127, 168, 0.75)',
                borderColor: 'rgba(28, 127, 168, 1)',
                borderWidth: 2,
                borderRadius: esLinea ? 0 : 6,
                tension: 0.35,
                fill: esLinea,
            }],
        });

        UCLA.components.charts.initDoughnut('chartDistribucion', {
            labels: UCLA.state.SEDES.map((s) => s.nombre),
            data: UCLA.state.SEDES.map((_, i) => 10 + ((semilla + i * 53) % 40)),
        });
    }

    UCLA.views['informes/:id'] = { render };
})();

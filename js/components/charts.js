// Wrappers de Chart.js usados por el Dashboard Gerencial. Cada init* destruye
// la instancia anterior si existe, para evitar fugas de memoria y canvases
// duplicados al re-entrar a la vista por el router.
(function () {
    const instancias = {};

    function destruirSiExiste(id) {
        if (instancias[id]) {
            instancias[id].destroy();
            delete instancias[id];
        }
    }

    function initIngresos(canvasId) {
        destruirSiExiste(canvasId);
        const el = document.getElementById(canvasId);
        if (!el) return;
        instancias[canvasId] = new Chart(el.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
                datasets: [{
                    label: 'Ingresos 2026 (M COP)',
                    data: [81.4, 15.6, 90.3, 378.4, 156.3, 263.9, 165.0, 185.2, 240.2],
                    backgroundColor: 'rgba(28, 127, 168, 0.82)',
                    borderColor: 'rgba(28, 127, 168, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                }, {
                    label: 'Ingresos 2025 (M COP)',
                    data: [65.2, 12.1, 75.4, 298.3, 128.5, 198.2, 134.6, 156.8, 198.4],
                    backgroundColor: 'rgba(245, 130, 31, 0.40)',
                    borderColor: 'rgba(245, 130, 31, 0.90)',
                    borderWidth: 2,
                    borderRadius: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: { grid: { display: false } },
                },
            },
        });
    }

    function initSegmentos(canvasId) {
        destruirSiExiste(canvasId);
        const el = document.getElementById(canvasId);
        if (!el) return;
        instancias[canvasId] = new Chart(el.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Estudiantes', 'Público Ext.', 'Graduados', 'Docentes'],
                datasets: [{
                    data: [47, 28, 15, 10],
                    backgroundColor: [
                        'rgba(28, 127, 168, 0.90)',
                        'rgba(44, 147, 190, 0.70)',
                        'rgba(245, 130, 31, 0.90)',
                        'rgba(201, 205, 207, 0.85)',
                    ],
                    borderWidth: 0,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { display: false } },
            },
        });
    }

    const PALETA_DEFECTO = [
        'rgba(28, 127, 168, 0.90)',
        'rgba(44, 147, 190, 0.70)',
        'rgba(245, 130, 31, 0.90)',
        'rgba(201, 205, 207, 0.85)',
        'rgba(27, 58, 74, 0.85)',
        'rgba(250, 193, 143, 0.90)',
    ];

    // Wrapper genérico de barras/líneas, reutilizable por Informes y Análisis.
    function initBar(canvasId, { labels, datasets, tipo = 'bar' }) {
        destruirSiExiste(canvasId);
        const el = document.getElementById(canvasId);
        if (!el) return;
        instancias[canvasId] = new Chart(el.getContext('2d'), {
            type: tipo,
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', display: datasets.length > 1 } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: { grid: { display: false } },
                },
            },
        });
    }

    function initLine(canvasId, { labels, datasets }) {
        initBar(canvasId, { labels, datasets, tipo: 'line' });
    }

    function initDoughnut(canvasId, { labels, data, colors }) {
        destruirSiExiste(canvasId);
        const el = document.getElementById(canvasId);
        if (!el) return;
        instancias[canvasId] = new Chart(el.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors || PALETA_DEFECTO,
                    borderWidth: 0,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
            },
        });
    }

    UCLA.components.charts = { initIngresos, initSegmentos, initBar, initLine, initDoughnut };
})();

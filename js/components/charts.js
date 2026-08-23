// Wrappers de Chart.js usados por Dashboard, Reportes BI, Financiero, Eventos
// y Egresados. Cada init* destruye la instancia anterior si existe, para
// evitar fugas de memoria y canvases duplicados al re-entrar a la vista por
// el router. Los defaults globales de Chart.js se configuran una sola vez
// aquí para que toda gráfica de la app comparta tipografía, colores y estilo
// de tooltip/leyenda — así ninguna gráfica "se ve" de un sistema de diseño
// distinto al resto del CRM.
(function () {
    const instancias = {};

    // Mismos tokens de color que index.html (var(--color-text-muted) = #6B6F72,
    // var(--color-border) = #E1E4E5, var(--color-primary-dark) = #1B3A4A).
    if (window.Chart) {
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#6B6F72';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.boxWidth = 8;
        Chart.defaults.plugins.legend.labels.padding = 16;
        Chart.defaults.plugins.tooltip.backgroundColor = '#1B3A4A';
        Chart.defaults.plugins.tooltip.titleFont = { family: "'Inter', sans-serif", weight: '600' };
        Chart.defaults.plugins.tooltip.bodyFont = { family: "'Inter', sans-serif" };
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.displayColors = true;
        Chart.defaults.plugins.tooltip.boxPadding = 4;
        Chart.defaults.elements.bar.borderRadius = 6;
        Chart.defaults.elements.bar.borderSkipped = false;
        Chart.defaults.elements.line.tension = 0.3;
        Chart.defaults.elements.point.radius = 3;
        Chart.defaults.elements.point.hoverRadius = 5;
    }

    const PALETA_DEFECTO = [
        'rgba(28, 127, 168, 0.90)',
        'rgba(245, 130, 31, 0.90)',
        'rgba(46, 204, 113, 0.85)',
        'rgba(201, 205, 207, 0.85)',
        'rgba(27, 58, 74, 0.85)',
        'rgba(233, 107, 90, 0.80)',
    ];

    function destruirSiExiste(id) {
        if (instancias[id]) {
            instancias[id].destroy();
            delete instancias[id];
        }
    }

    // Un dataset "tiene datos" si al menos un valor numérico es distinto de
    // cero/NaN. Evita renderizar un canvas de ejes vacíos sin ninguna barra o
    // un doughnut en blanco cuando el cálculo (filtros, sedes sin eventos,
    // encuestas sin respuestas) da un arreglo vacío o todo en cero.
    function tieneDatos(datasets) {
        if (!Array.isArray(datasets) || !datasets.length) return false;
        return datasets.some((ds) => Array.isArray(ds.data) && ds.data.some((v) => typeof v === 'number' && !Number.isNaN(v) && v !== 0));
    }

    // Reemplaza el <canvas> por un estado vacío explícito, dentro del mismo
    // contenedor .chart-container (conserva la altura ya definida para no
    // saltar el layout de la tarjeta).
    function mostrarSinDatos(canvasId, mensaje) {
        const el = document.getElementById(canvasId);
        if (!el) return;
        const contenedor = el.closest('.chart-container') || el.parentElement;
        contenedor.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center gap-2 px-4">
                <i class="fas fa-chart-simple text-2xl" style="color: var(--color-neutral);"></i>
                <p class="text-sm" style="color: var(--color-text-muted);">${mensaje || 'No hay datos disponibles para mostrar.'}</p>
            </div>`;
    }

    // Callback de tooltip compartido: usa el formateador que pase el llamador
    // (p. ej. UCLA.utils.formatoCOP para montos) o, por defecto, separador de
    // miles en es-CO — así ningún tooltip muestra un número plano como
    // "1500000" sin agrupar.
    // Un <canvas> es una caja negra para un lector de pantalla; sin esto la
    // gráfica queda completamente inaccesible para navegación por teclado o
    // lectores de pantalla. Se arma un resumen textual de las series a partir
    // de las mismas etiquetas/datos que ya recibe la gráfica, sin depender de
    // que cada vista escriba una descripción a mano.
    function describirParaLector(tipo, labels, datasets) {
        const resumenSerie = (ds) => (ds.label ? `${ds.label}: ` : '') + (labels || []).map((l, i) => `${l} ${ds.data[i]}`).join(', ');
        const partes = (datasets || []).map(resumenSerie).join('. ');
        return `Gráfica de ${tipo}. ${partes}`;
    }

    function marcarAccesible(canvasId, descripcion) {
        const el = document.getElementById(canvasId);
        if (!el) return;
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', descripcion);
    }

    function construirOpcionesTooltip(formatoValor) {
        if (!formatoValor) return undefined;
        return {
            callbacks: {
                label(ctx) {
                    const valor = ctx.parsed.y ?? ctx.parsed;
                    const etiqueta = ctx.dataset.label ? `${ctx.dataset.label}: ` : `${ctx.label}: `;
                    return etiqueta + formatoValor(valor);
                },
            },
        };
    }

    function initBar(canvasId, { labels, datasets, tipo = 'bar', formatoValor, opciones }) {
        destruirSiExiste(canvasId);
        if (!tieneDatos(datasets)) { mostrarSinDatos(canvasId); return; }
        const el = document.getElementById(canvasId);
        if (!el) return;
        instancias[canvasId] = new Chart(el.getContext('2d'), {
            type: tipo,
            data: { labels, datasets },
            options: Object.assign({
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', display: datasets.length > 1 },
                    tooltip: construirOpcionesTooltip(formatoValor),
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                    x: { grid: { display: false } },
                },
            }, opciones || {}),
        });
        marcarAccesible(canvasId, describirParaLector(tipo === 'line' ? 'línea' : 'barras', labels, datasets));
    }

    function initLine(canvasId, { labels, datasets, formatoValor, opciones }) {
        initBar(canvasId, { labels, datasets, tipo: 'line', formatoValor, opciones });
    }

    function initDoughnut(canvasId, { labels, data, colors, formatoValor }) {
        destruirSiExiste(canvasId);
        if (!tieneDatos([{ data }])) { mostrarSinDatos(canvasId); return; }
        const el = document.getElementById(canvasId);
        if (!el) return;
        instancias[canvasId] = new Chart(el.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors || PALETA_DEFECTO,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 11 } } },
                    // Siempre incluye el porcentaje sobre el total (útil en un
                    // doughnut aunque se pase un formatoValor para el monto/cifra).
                    tooltip: construirOpcionesTooltip((v) => {
                        const total = data.reduce((s, n) => s + n, 0);
                        const pct = total ? Math.round((v / total) * 100) : 0;
                        const valorFmt = formatoValor ? formatoValor(v) : v.toLocaleString('es-CO');
                        return `${valorFmt} (${pct}%)`;
                    }),
                },
            },
        });
        marcarAccesible(canvasId, describirParaLector('circular', labels, [{ label: '', data }]));
    }

    UCLA.components.charts = { initBar, initLine, initDoughnut, mostrarSinDatos };
})();

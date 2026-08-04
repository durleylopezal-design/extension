// Reportes BI · Reportes Financieros — statCards + gráfico sobre
// UCLA.data.consolidado, cruzado con UCLA.data.cuentasPorCobrar (cartera vencida).
(function () {
    function render(container) {
        const data = UCLA.data.consolidado;
        const ingresosTotales = data.reduce((s, d) => s + d.ingresos, 0);
        const excedentePromedio = (data.reduce((s, d) => s + d.excedente, 0) / data.length).toFixed(1);
        const mejorMes = data.reduce((max, d) => (d.ingresos > max.ingresos ? d : max), data[0]);
        const carteraVencida = UCLA.data.cuentasPorCobrar.filter((c) => c.diasMora > 0).reduce((s, c) => s + c.saldo, 0);

        container.innerHTML = `
            <div id="rfStats" class="mb-4"></div>
            <div class="bg-white rounded-xl shadow-lg p-6 mb-4">
                <h3 class="section-title text-base mb-4">Ingresos por Mes (Millones COP)</h3>
                <div class="chart-container" style="height: 280px;"><canvas id="chartFinanciero"></canvas></div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="section-title text-base mb-4">Detalle Mensual</h3>
                <div id="rfTabla"></div>
            </div>`;

        UCLA.components.statCards.render(container.querySelector('#rfStats'), [
            { etiqueta: 'Ingresos del periodo', valor: `$${ingresosTotales.toFixed(1)}M`, color: 'var(--color-primary)' },
            { etiqueta: 'Excedente promedio', valor: `${excedentePromedio}%`, color: 'var(--color-success)' },
            { etiqueta: 'Mejor mes', valor: mejorMes.mes, color: 'var(--color-accent)' },
            { etiqueta: 'Cartera vencida', valor: UCLA.utils.formatoCOP(carteraVencida), color: 'var(--color-danger)' },
        ]);

        UCLA.components.charts.initBar('chartFinanciero', {
            labels: data.map((d) => d.mes),
            datasets: [{ label: 'Ingresos (M COP)', data: data.map((d) => d.ingresos), backgroundColor: 'rgba(28, 127, 168, 0.82)', borderRadius: 6 }],
        });

        UCLA.components.dataTable.render(container.querySelector('#rfTabla'), {
            columnas: [
                { clave: 'mes', etiqueta: 'Mes' },
                { clave: 'ingresos', etiqueta: 'Ingresos', render: (d) => `$${d.ingresos.toFixed(1)}M` },
                { clave: 'excedente', etiqueta: '% Excedente', render: (d) => `${d.excedente}%` },
            ],
            filas: data,
            filaId: (d) => d.mes,
        });
    }

    UCLA.views['reportes/financieros'] = { render };
})();

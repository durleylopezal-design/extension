// Egresados · Indicadores de Empleabilidad — dashboard calculado en vivo sobre
// UCLA.data.egresados (no requiere datos nuevos).
(function () {
    function render(container) {
        const egresados = UCLA.data.egresados;
        const empleados = egresados.filter((e) => e.situacionLaboral === 'Empleado' || e.situacionLaboral === 'Independiente');
        const tasaEmpleabilidad = Math.round((empleados.length / egresados.length) * 100);
        const empleoAfin = empleados.filter((e) => e.empleoAfin);
        const tasaAfin = empleados.length ? Math.round((empleoAfin.length / empleados.length) * 100) : 0;
        const conMeses = empleados.filter((e) => typeof e.mesesHastaVinculacion === 'number');
        const promedioMeses = conMeses.length ? (conMeses.reduce((s, e) => s + e.mesesHastaVinculacion, 0) / conMeses.length).toFixed(1) : '-';

        const situaciones = {};
        egresados.forEach((e) => { situaciones[e.situacionLaboral] = (situaciones[e.situacionLaboral] || 0) + 1; });

        const rangos = ['$2.000.000 - $3.000.000', '$3.000.000 - $4.500.000', '$4.500.000 - $6.000.000', 'Más de $6.000.000'];
        // Los rótulos completos (con puntos de miles) desbordan y se superponen
        // en el eje X de la barra, sobre todo en pantallas angostas; se usa una
        // forma corta solo para el eje, el filtro sigue comparando contra `rangos`.
        const rangosCorto = ['$2M - $3M', '$3M - $4,5M', '$4,5M - $6M', '+ $6M'];
        const porRango = rangos.map((r) => empleados.filter((e) => e.rangoSalarial === r).length);

        container.innerHTML = `
            <div id="eiStats" class="mb-4"></div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="section-title text-base mb-4">Situación Laboral</h3>
                    <div class="relative h-[210px] sm:h-[240px] lg:h-[260px]"><canvas id="chartSituacionLaboral"></canvas></div>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="section-title text-base mb-4">Distribución Salarial (empleados)</h3>
                    <div class="relative h-[210px] sm:h-[240px] lg:h-[260px]"><canvas id="chartRangoSalarial"></canvas></div>
                </div>
            </div>`;

        UCLA.components.statCards.render(container.querySelector('#eiStats'), [
            { etiqueta: 'Tasa de empleabilidad', valor: `${tasaEmpleabilidad}%`, color: 'var(--color-success)' },
            { etiqueta: 'Empleo afín al programa', valor: `${tasaAfin}%`, color: 'var(--color-primary)' },
            { etiqueta: 'Meses promedio de vinculación', valor: promedioMeses, color: 'var(--color-accent)' },
            { etiqueta: 'Egresados registrados', valor: egresados.length, color: 'var(--color-primary-dark, var(--color-primary))' },
        ]);

        UCLA.components.charts.initDoughnut('chartSituacionLaboral', { labels: Object.keys(situaciones), data: Object.values(situaciones) });
        UCLA.components.charts.initBar('chartRangoSalarial', {
            labels: rangosCorto,
            datasets: [{ label: 'Egresados', data: porRango, backgroundColor: 'rgba(28, 127, 168, 0.82)' }],
        });
    }

    UCLA.views['egresados/indicadores'] = { render };
})();

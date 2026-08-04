// Reportes BI · Reportes Académicos — statCards + gráfico + tabla sobre
// UCLA.data.consolidado (misma fuente que reportes/tableros).
(function () {
    function render(container) {
        const data = UCLA.data.consolidado;
        const totales = data.reduce((acc, d) => ({ est: acc.est + d.est, grad: acc.grad + d.grad, doc: acc.doc + d.doc, ext: acc.ext + d.ext }), { est: 0, grad: 0, doc: 0, ext: 0 });

        container.innerHTML = `
            <div id="raStats" class="mb-4"></div>
            <div class="bg-white rounded-xl shadow-lg p-6 mb-4">
                <h3 class="section-title text-base mb-4">Estudiantes vs. Graduados por Mes</h3>
                <div class="chart-container" style="height: 280px;"><canvas id="chartAcademico"></canvas></div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="section-title text-base mb-4">Detalle Mensual</h3>
                <div id="raTabla"></div>
            </div>`;

        UCLA.components.statCards.render(container.querySelector('#raStats'), [
            { etiqueta: 'Estudiantes matriculados', valor: totales.est.toLocaleString('es-CO'), color: 'var(--color-primary)' },
            { etiqueta: 'Graduados', valor: totales.grad.toLocaleString('es-CO'), color: 'var(--color-success)' },
            { etiqueta: 'Docentes / Administrativos', valor: totales.doc.toLocaleString('es-CO'), color: 'var(--color-accent)' },
            { etiqueta: 'Público externo', valor: totales.ext.toLocaleString('es-CO'), color: 'var(--color-primary-dark, var(--color-primary))' },
        ]);

        UCLA.components.charts.initLine('chartAcademico', {
            labels: data.map((d) => d.mes),
            datasets: [
                { label: 'Estudiantes', data: data.map((d) => d.est), borderColor: 'rgba(28, 127, 168, 1)', backgroundColor: 'rgba(28, 127, 168, 0.15)', fill: true, tension: 0.3 },
                { label: 'Graduados', data: data.map((d) => d.grad), borderColor: 'rgba(245, 130, 31, 1)', backgroundColor: 'rgba(245, 130, 31, 0.15)', fill: true, tension: 0.3 },
            ],
        });

        UCLA.components.dataTable.render(container.querySelector('#raTabla'), {
            columnas: [
                { clave: 'mes', etiqueta: 'Mes' },
                { clave: 'est', etiqueta: 'Estudiantes' },
                { clave: 'grad', etiqueta: 'Graduados' },
                { clave: 'doc', etiqueta: 'Doc/Adm' },
                { clave: 'ext', etiqueta: 'Público Ext.' },
                { clave: 'total', etiqueta: 'Total participantes' },
            ],
            filas: data,
            filaId: (d) => d.mes,
        });
    }

    UCLA.views['reportes/academicos'] = { render };
})();

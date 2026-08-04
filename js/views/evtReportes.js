// Eventos · Reportes de Participación — statCards + gráficos (Chart.js) +
// tabla resumen por evento, cruzando eventos, eventosAsistentes y eventosEncuestas.
(function () {
    function inscritos(codigo) {
        return UCLA.data.eventosAsistentes.filter((a) => a.eventoCodigo === codigo && a.estadoInscripcion !== 'Cancelado');
    }

    function stats() {
        const conRegistro = UCLA.data.eventos.filter((e) => inscritos(e.codigo).length > 0);
        const totalInscritos = UCLA.data.eventosAsistentes.filter((a) => a.estadoInscripcion !== 'Cancelado').length;
        const totalAsistieron = UCLA.data.eventosAsistentes.filter((a) => a.asistio).length;
        const totalConAsistenciaTomada = UCLA.data.eventosAsistentes.filter((a) => a.estadoInscripcion === 'Confirmado').length;
        const asistenciaPct = totalConAsistenciaTomada ? Math.round((totalAsistieron / totalConAsistenciaTomada) * 100) : 0;
        const satisfaccionProm = UCLA.data.eventosEncuestas.length
            ? (UCLA.data.eventosEncuestas.reduce((s, e) => s + e.promedioGeneral, 0) / UCLA.data.eventosEncuestas.length).toFixed(1)
            : '—';
        return {
            conRegistro,
            tarjetas: [
                { etiqueta: 'Eventos realizados o en curso', valor: UCLA.data.eventos.filter((e) => e.estado !== 'PROGRAMADO' && e.estado !== 'CANCELADO').length, color: 'var(--color-primary)' },
                { etiqueta: 'Total de inscritos', valor: totalInscritos, color: 'var(--color-success)' },
                { etiqueta: 'Asistencia promedio', valor: `${asistenciaPct}%`, color: 'var(--color-accent)' },
                { etiqueta: 'Satisfacción promedio', valor: satisfaccionProm, color: 'var(--color-primary-dark, var(--color-primary))' },
            ],
        };
    }

    function render(container) {
        const { conRegistro, tarjetas } = stats();
        container.innerHTML = `
            <div id="erStats" class="mb-4"></div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="section-title text-base mb-4">Participación por Evento</h3>
                    <div class="chart-container" style="height: 260px;"><canvas id="chartParticipacion"></canvas></div>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="section-title text-base mb-4">Eventos por Modalidad</h3>
                    <div class="chart-container" style="height: 260px;"><canvas id="chartModalidad"></canvas></div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="section-title text-base mb-4">Resumen por Evento</h3>
                <div id="erTabla"></div>
            </div>`;

        UCLA.components.statCards.render(container.querySelector('#erStats'), tarjetas);

        UCLA.components.charts.initBar('chartParticipacion', {
            labels: conRegistro.map((e) => e.codigo),
            datasets: [
                { label: 'Inscritos', data: conRegistro.map((e) => inscritos(e.codigo).length), backgroundColor: 'rgba(28, 127, 168, 0.82)', borderRadius: 6 },
                { label: 'Asistieron', data: conRegistro.map((e) => inscritos(e.codigo).filter((a) => a.asistio).length), backgroundColor: 'rgba(245, 130, 31, 0.82)', borderRadius: 6 },
            ],
        });

        const modalidades = {};
        UCLA.data.eventos.forEach((e) => { modalidades[e.modalidad] = (modalidades[e.modalidad] || 0) + 1; });
        UCLA.components.charts.initDoughnut('chartModalidad', { labels: Object.keys(modalidades), data: Object.values(modalidades) });

        UCLA.components.dataTable.render(container.querySelector('#erTabla'), {
            columnas: [
                { clave: 'nombre', etiqueta: 'Evento', render: (e) => `<span class="font-medium" style="color: var(--color-text);">${e.nombre}</span>` },
                { clave: 'inscritos', etiqueta: 'Inscritos', render: (e) => inscritos(e.codigo).length },
                { clave: 'asistieron', etiqueta: 'Asistieron', render: (e) => inscritos(e.codigo).filter((a) => a.asistio).length },
                { clave: 'tasa', etiqueta: 'Tasa de asistencia', render: (e) => { const ins = inscritos(e.codigo).length; return ins ? `${Math.round((inscritos(e.codigo).filter((a) => a.asistio).length / ins) * 100)}%` : '—'; } },
                { clave: 'estado', etiqueta: 'Estado', render: (e) => UCLA.utils.badgeEstado(e.estado) },
            ],
            filas: UCLA.data.eventos,
            filaId: (e) => e.codigo,
        });
    }

    UCLA.views['eventos/reportes'] = { render };
})();

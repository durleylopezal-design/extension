// Dashboard Gerencial — KPIs y gráficos calculados en vivo para la sede activa
// (UCLA.state.getSedeActiva()). UCLA.data.eventos ya trae sedeId real, así que
// los KPIs de eventos y el "Top 5" se filtran directo de ahí; UCLA.data.consolidado
// es un agregado institucional sin desglose por sede, así que sus cifras se
// reparten con un peso fijo de ejemplo por sede (PESOS_SEDE) en vez de duplicar
// el arreglo — reportes/tableros, reportes/academicos y reportes/financieros
// siguen leyendo UCLA.data.consolidado institucional sin cambios.
(function () {
    const PESOS_SEDE = { MDE: 0.42, BOG: 0.20, MZL: 0.18, APD: 0.10, MTR: 0.10 };

    let sedeListener = null;

    function filasConsolidadoSede(sedeId) {
        const peso = PESOS_SEDE[sedeId] || (1 / UCLA.state.SEDES.length);
        return UCLA.data.consolidado.map((m) => ({
            mes: m.mes,
            ingresos: +(m.ingresos * peso).toFixed(1),
            estudiantes: Math.round(m.est * peso),
            publicoExt: Math.round(m.ext * peso),
            graduados: Math.round(m.grad * peso),
            docentes: Math.round(m.doc * peso),
            total: Math.round(m.total * peso),
        }));
    }

    function eventosSede(sedeId) {
        return UCLA.data.eventos.filter((e) => e.sedeId === sedeId);
    }

    function top5Excedente(eventos) {
        return eventos.slice().sort((a, b) => b.excedente - a.excedente).slice(0, 5);
    }

    function kpiCard({ icono, fondoIcono, colorIcono, borde, etiqueta, valor, nota }) {
        return `
            <div class="kpi-card bg-white rounded-xl p-6 shadow-lg" style="border-top-color: ${borde};">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-3 rounded-lg" style="background: ${fondoIcono};">
                        <i class="fas ${icono} text-xl" style="color: ${colorIcono};"></i>
                    </div>
                </div>
                <h3 class="text-sm font-medium" style="color: var(--color-text-muted);">${etiqueta}</h3>
                <p class="text-3xl font-bold mt-1" style="color: var(--color-text);">${valor}</p>
                <p class="text-xs mt-2" style="color: var(--color-text-muted);">${nota}</p>
            </div>`;
    }

    function top5Html(eventos, sede) {
        if (!eventos.length) {
            return `<div class="p-8 text-center text-sm" style="color: var(--color-text-muted);">Sin eventos con excedente registrado en ${sede.nombre} todavía.</div>`;
        }
        return `<div class="space-y-1 p-4">${eventos.map((e) => `
            <div class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-brand-50">
                <div>
                    <p class="font-medium text-sm" style="color: var(--color-text);">${e.nombre}</p>
                    <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">${e.codigo} • ${e.facultad || '-'}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold" style="color: var(--color-primary);">${e.excedente}%</p>
                    <p class="text-xs" style="color: var(--color-text-muted);">${e.estado}</p>
                </div>
            </div>`).join('')}</div>`;
    }

    function pintar(container) {
        const sedeId = UCLA.state.getSedeActiva();
        const sede = UCLA.state.SEDES.find((s) => s.codigo === sedeId) || UCLA.state.SEDES[0];
        const idxSede = UCLA.state.SEDES.findIndex((s) => s.codigo === sede.codigo);
        const filas = filasConsolidadoSede(sede.codigo);
        const eventos = eventosSede(sede.codigo);
        const activos = eventos.filter((e) => e.estado === 'ACTIVO').length;
        const certificados = eventos.filter((e) => e.estado === 'CERTIFICADO').length;
        const ingresosAcumulados = filas.reduce((s, f) => s + f.ingresos, 0);
        const totalParticipantes = filas.reduce((s, f) => s + f.total, 0);
        const top5 = top5Excedente(eventos);

        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center gap-2 -mb-2">
                    <i class="fas fa-map-marker-alt" style="color: var(--color-accent-dark);"></i>
                    <p class="text-sm font-semibold" style="color: var(--color-text-muted);">Mostrando indicadores de la sede ${sede.nombre}</p>
                </div>

                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${kpiCard({ icono: 'fa-calendar-check', fondoIcono: 'var(--color-primary-50)', colorIcono: 'var(--color-primary)', borde: 'var(--color-primary)', etiqueta: 'Eventos Activos', valor: activos, nota: `Sede ${sede.nombre}` })}
                    ${kpiCard({ icono: 'fa-check-circle', fondoIcono: 'var(--color-primary-50)', colorIcono: 'var(--color-primary)', borde: 'var(--color-success)', etiqueta: 'Eventos Certificados', valor: certificados, nota: 'Acumulado 2026' })}
                    ${kpiCard({ icono: 'fa-dollar-sign', fondoIcono: 'var(--color-accent-100)', colorIcono: 'var(--color-accent-dark)', borde: 'var(--color-accent)', etiqueta: 'Ingresos Acumulados', valor: UCLA.utils.formatoCOP(ingresosAcumulados * 1000000), nota: 'Estimado 2026' })}
                    ${kpiCard({ icono: 'fa-users', fondoIcono: 'var(--color-primary-100)', colorIcono: 'var(--color-primary)', borde: 'var(--color-primary-light)', etiqueta: 'Total Participantes', valor: totalParticipantes.toLocaleString('es-CO'), nota: 'Todos los segmentos' })}
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden" style="border-top: 4px solid var(--color-primary);">
                        <div class="flex items-center justify-between p-6 pb-4">
                            <h3 class="section-title text-base">Ingresos por Mes — ${sede.nombre}</h3>
                            <span class="tab-active px-3 py-1 text-sm rounded-lg font-semibold">2026</span>
                        </div>
                        <div class="chart-container px-6 pb-6">
                            <canvas id="ingresosChart"></canvas>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg overflow-hidden" style="border-top: 4px solid var(--color-accent);">
                        <div class="p-6 pb-2">
                            <h3 class="section-title text-base mb-4">Participantes por Segmento — ${sede.nombre}</h3>
                        </div>
                        <div class="chart-container px-6">
                            <canvas id="segmentosChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Alerts & Top Events -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden" style="border-top: 4px solid var(--color-danger);">
                        <div class="alert-panel-header flex items-center justify-between">
                            <h3 class="text-base font-bold flex items-center gap-2 text-white">
                                <i class="fas fa-exclamation-triangle" style="color: var(--color-accent);"></i> Alertas del Sistema
                            </h3>
                            <span class="text-xs font-semibold px-2 py-1 rounded-full" style="background: rgba(255,255,255,0.2); color: #fff;">3 pendientes</span>
                        </div>
                        <div class="p-6 pt-4">
                        <div class="space-y-3">
                            <div class="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                                <i class="fas fa-handshake text-red-500 mt-1"></i>
                                <div class="flex-1">
                                    <p class="font-medium text-gray-800">3 alianzas próximas a vencer</p>
                                    <p class="text-sm text-gray-600">Vencen en los próximos 30 días</p>
                                    <p class="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                                </div>
                                <button class="text-sm font-semibold hover:underline" style="color: var(--color-primary);">Ver</button>
                            </div>
                            <div class="flex items-start gap-3 p-3 rounded-lg border-l-4" style="background: var(--color-accent-50); border-color: var(--color-accent);">
                                <i class="fas fa-money-bill-wave mt-1" style="color: var(--color-accent-dark);"></i>
                                <div class="flex-1">
                                    <p class="font-medium text-gray-800">5 pagos a docentes pendientes</p>
                                    <p class="text-sm text-gray-600">&gt; 30 días sin procesar</p>
                                    <p class="text-xs text-gray-500 mt-1">Hace 5 horas</p>
                                </div>
                                <button class="text-sm font-semibold hover:underline" style="color: var(--color-primary);">Ver</button>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-accent-50 rounded-lg border-l-4 border-accent-500">
                                <i class="fas fa-file-signature mt-1" style="color: var(--color-primary);"></i>
                                <div class="flex-1">
                                    <p class="font-medium text-gray-800">2 solicitudes esperando Vo.Bo.</p>
                                    <p class="text-sm text-gray-600">Financiera y Programa</p>
                                    <p class="text-xs text-gray-500 mt-1">Hace 1 día</p>
                                </div>
                                <button class="text-sm font-semibold hover:underline" style="color: var(--color-primary);">Ver</button>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg overflow-hidden" style="border-top: 4px solid var(--color-accent);">
                        <div class="flex items-center justify-between px-6 py-4" style="border-bottom: 1px solid var(--color-border);">
                            <h3 class="section-title text-base">Top 5 Eventos por Excedente — ${sede.nombre}</h3>
                            <button onclick="UCLA.router.navigate('eventos/gestion')" class="text-sm font-semibold hover:underline" style="color: var(--color-primary-light);">Ver todos</button>
                        </div>
                        ${top5Html(top5, sede)}
                    </div>
                </div>
            </div>
        `;

        // Alterna bar/línea según la sede para que la combinación de gráficos
        // sea perceptiblemente distinta entre sedes, no solo los datos.
        const tipoIngresos = idxSede % 2 === 0 ? 'bar' : 'line';
        UCLA.components.charts.initBar('ingresosChart', {
            labels: filas.map((f) => f.mes.slice(0, 3)),
            datasets: [{
                label: `Ingresos ${sede.nombre} (M COP)`,
                data: filas.map((f) => f.ingresos),
                backgroundColor: 'rgba(28, 127, 168, 0.82)',
                borderColor: 'rgba(28, 127, 168, 1)',
                borderWidth: 2,
                borderRadius: tipoIngresos === 'bar' ? 6 : undefined,
                tension: tipoIngresos === 'line' ? 0.35 : undefined,
                fill: tipoIngresos === 'line' ? false : undefined,
            }],
            tipo: tipoIngresos,
        });

        const totalesSegmento = filas.reduce((acc, f) => {
            acc.estudiantes += f.estudiantes; acc.publicoExt += f.publicoExt;
            acc.graduados += f.graduados; acc.docentes += f.docentes;
            return acc;
        }, { estudiantes: 0, publicoExt: 0, graduados: 0, docentes: 0 });
        UCLA.components.charts.initDoughnut('segmentosChart', {
            labels: ['Estudiantes', 'Público Ext.', 'Graduados', 'Docentes'],
            data: [totalesSegmento.estudiantes, totalesSegmento.publicoExt, totalesSegmento.graduados, totalesSegmento.docentes],
        });
    }

    function render(container) {
        pintar(container);

        if (sedeListener) document.removeEventListener('ucla:sede-cambiada', sedeListener);
        sedeListener = () => pintar(container);
        document.addEventListener('ucla:sede-cambiada', sedeListener);
    }

    UCLA.views['dashboard'] = { render };
})();

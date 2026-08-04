// Dashboard Gerencial — migrado 1:1 desde el prototipo original, con la
// paleta institucional nueva.
(function () {
    function render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="kpi-card bg-white rounded-xl p-6 shadow-lg" style="border-top-color: var(--color-primary);">
                        <div class="flex items-center justify-between mb-4">
                            <div class="p-3 rounded-lg" style="background: var(--color-primary-50);">
                                <i class="fas fa-calendar-check text-xl" style="color: var(--color-primary);"></i>
                            </div>
                            <span class="text-sm font-semibold flex items-center gap-1" style="color: var(--color-primary);">
                                <i class="fas fa-arrow-up"></i> +12%
                            </span>
                        </div>
                        <h3 class="text-sm font-medium" style="color: var(--color-text-muted);">Eventos Activos</h3>
                        <p class="text-3xl font-bold mt-1" style="color: var(--color-primary);">127</p>
                        <p class="text-xs mt-2" style="color: var(--color-text-muted);">vs. 113 mes anterior</p>
                    </div>

                    <div class="kpi-card bg-white rounded-xl p-6 shadow-lg" style="border-top-color: var(--color-success);">
                        <div class="flex items-center justify-between mb-4">
                            <div class="p-3 rounded-lg" style="background: var(--color-primary-50);">
                                <i class="fas fa-check-circle text-xl" style="color: var(--color-primary);"></i>
                            </div>
                            <span class="text-sm font-semibold flex items-center gap-1" style="color: var(--color-primary);">
                                <i class="fas fa-arrow-up"></i> +8%
                            </span>
                        </div>
                        <h3 class="text-sm font-medium" style="color: var(--color-text-muted);">Eventos Certificados</h3>
                        <p class="text-3xl font-bold mt-1" style="color: var(--color-text);">845</p>
                        <p class="text-xs mt-2" style="color: var(--color-text-muted);">Acumulado 2026</p>
                    </div>

                    <div class="kpi-card bg-white rounded-xl p-6 shadow-lg" style="border-top-color: var(--color-accent);">
                        <div class="flex items-center justify-between mb-4">
                            <div class="p-3 rounded-lg" style="background: var(--color-accent-100);">
                                <i class="fas fa-dollar-sign text-xl" style="color: var(--color-accent-dark);"></i>
                            </div>
                            <span class="text-sm font-semibold flex items-center gap-1" style="color: var(--color-primary);">
                                <i class="fas fa-arrow-up"></i> +23%
                            </span>
                        </div>
                        <h3 class="text-sm font-medium" style="color: var(--color-text-muted);">Ingresos Acumulados</h3>
                        <p class="text-3xl font-bold mt-1" style="color: var(--color-text);">$1.376M</p>
                        <p class="text-xs mt-2" style="color: var(--color-text-muted);">COP mes actual</p>
                    </div>

                    <div class="kpi-card bg-white rounded-xl p-6 shadow-lg" style="border-top-color: var(--color-primary-light);">
                        <div class="flex items-center justify-between mb-4">
                            <div class="p-3 rounded-lg" style="background: var(--color-primary-100);">
                                <i class="fas fa-users text-xl" style="color: var(--color-primary);"></i>
                            </div>
                            <span class="text-sm font-semibold flex items-center gap-1" style="color: var(--color-primary);">
                                <i class="fas fa-arrow-up"></i> +18%
                            </span>
                        </div>
                        <h3 class="text-sm font-medium" style="color: var(--color-text-muted);">Total Participantes</h3>
                        <p class="text-3xl font-bold mt-1" style="color: var(--color-text);">9.349</p>
                        <p class="text-xs mt-2" style="color: var(--color-text-muted);">Todos los segmentos</p>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden" style="border-top: 4px solid var(--color-primary);">
                        <div class="flex items-center justify-between p-6 pb-4">
                            <h3 class="section-title text-base">Ingresos por Mes</h3>
                            <div class="flex gap-2">
                                <button class="tab-active px-3 py-1 text-sm rounded-lg font-semibold">2026</button>
                                <button class="tab-inactive px-3 py-1 text-sm rounded-lg font-medium">2025</button>
                            </div>
                        </div>
                        <div class="chart-container px-6 pb-6">
                            <canvas id="ingresosChart"></canvas>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg overflow-hidden" style="border-top: 4px solid var(--color-accent);">
                        <div class="p-6 pb-2">
                            <h3 class="section-title text-base mb-4">Participantes por Segmento</h3>
                        </div>
                        <div class="chart-container px-6">
                            <canvas id="segmentosChart"></canvas>
                        </div>
                        <div class="mt-4 space-y-2 px-6 pb-6">
                            <div class="flex justify-between items-center text-sm">
                                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:#1C7FA8;"></span> Estudiantes</span>
                                <span class="font-semibold">47%</span>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:#2C93BE;"></span> Público Ext.</span>
                                <span class="font-semibold">28%</span>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:#F5821F;"></span> Graduados</span>
                                <span class="font-semibold">15%</span>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:#C9CDCF;"></span> Docentes</span>
                                <span class="font-semibold">10%</span>
                            </div>
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
                            <h3 class="section-title text-base">Top 5 Eventos por Excedente</h3>
                            <button class="text-sm font-semibold hover:underline" style="color: var(--color-primary-light);">Ver todos</button>
                        </div>
                        <div class="space-y-1 p-4">
                            <div class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-brand-50">
                                <div>
                                    <p class="font-medium text-sm" style="color: var(--color-text);">Diplomado Conciliación Extrajudicial</p>
                                    <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">DIP0392 • Derecho</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold" style="color: var(--color-primary);">52.7%</p>
                                    <p class="text-xs" style="color: var(--color-text-muted);">$18.0M excedente</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-brand-50">
                                <div>
                                    <p class="font-medium text-sm" style="color: var(--color-text);">Seminario IA Aplicada</p>
                                    <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">SML0045 • Ingeniería</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold" style="color: var(--color-primary);">48.3%</p>
                                    <p class="text-xs" style="color: var(--color-text-muted);">$12.4M excedente</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-brand-50">
                                <div>
                                    <p class="font-medium text-sm" style="color: var(--color-text);">Curso Excel Avanzado</p>
                                    <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">CSO0777 • Administrativos</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold" style="color: var(--color-primary);">45.1%</p>
                                    <p class="text-xs" style="color: var(--color-text-muted);">$8.2M excedente</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-brand-50">
                                <div>
                                    <p class="font-medium text-sm" style="color: var(--color-text);">Diplomado Gestión Pública</p>
                                    <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">DIP0385 • Ciencias Políticas</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold" style="color: var(--color-primary);">42.8%</p>
                                    <p class="text-xs" style="color: var(--color-text-muted);">$15.6M excedente</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-brand-50">
                                <div>
                                    <p class="font-medium text-sm" style="color: var(--color-text);">Curso Marketing Digital</p>
                                    <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">CSO0788 • Comunicación</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold" style="color: var(--color-primary);">38.9%</p>
                                    <p class="text-xs" style="color: var(--color-text-muted);">$6.7M excedente</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        UCLA.components.charts.initIngresos('ingresosChart');
        UCLA.components.charts.initSegmentos('segmentosChart');
    }

    UCLA.views['dashboard'] = { render };
})();

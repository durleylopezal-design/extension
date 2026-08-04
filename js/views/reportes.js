// Reportes y BI — Consolidado Mensual migrado del prototipo original.
// Los tabs "Reporte Ejecutivo" y "Financiero Detallado" quedan como aviso de
// "en construcción" (antes llamaban a una función showReporte() inexistente).
(function () {
    function render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex gap-2 mb-4">
                    <button data-reporte="consolidado" class="btn-primary tab-active">Consolidado Mensual</button>
                    <button data-reporte="ejecutivo" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Reporte Ejecutivo</button>
                    <button data-reporte="financiero" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Financiero Detallado</button>
                </div>

                <div id="reporteConsolidado" class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">Consolidado Mensual - FO-MI-194</h3>
                                <p class="text-gray-500">Año 2026 - Todas las sedes</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="UCLA.utils.exportCSV('consolidado-mensual', UCLA.data.consolidado)" class="btn-primary">
                                    <i class="fas fa-file-excel"></i> Exportar Excel
                                </button>
                                <button onclick="UCLA.utils.exportPDF()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                    <i class="fas fa-file-pdf"></i> Exportar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="table-head-branded">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiantes</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Graduados</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doc/Adm</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Público Ext.</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Part.</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Excedente</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200" id="consolidadoTable"></tbody>
                        </table>
                    </div>
                </div>

                <div id="reporteOtro" class="hidden bg-white rounded-xl shadow-lg p-12 text-center" style="color: var(--color-text-muted);">
                    Este reporte está en construcción. Se implementará en una próxima iteración.
                </div>
            </div>
        `;

        const data = UCLA.data.consolidado;
        document.getElementById('consolidadoTable').innerHTML = data.map((d) => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${d.mes}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${d.est}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${d.grad}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${d.doc}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${d.ext}</td>
                <td class="px-6 py-4 text-sm font-bold text-gray-800">${d.total}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-800">$${d.ingresos}M</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-bold rounded-full" style="${d.excedente > 50 ? 'background:#E8F2F6;color:#1B4B62;' : d.excedente > 30 ? 'background:#FEF3E9;color:#CA6B1A;' : 'background:#fee2e2;color:#991b1b;'}">
                        ${d.excedente}%
                    </span>
                </td>
            </tr>
        `).join('') + `
            <tr class="bg-gray-100 font-bold">
                <td class="px-6 py-4">TOTAL</td>
                <td class="px-6 py-4">4,079</td>
                <td class="px-6 py-4">604</td>
                <td class="px-6 py-4">766</td>
                <td class="px-6 py-4">2,920</td>
                <td class="px-6 py-4">8,369</td>
                <td class="px-6 py-4">$1,576.3M</td>
                <td class="px-6 py-4">53.4%</td>
            </tr>
        `;

        container.querySelectorAll('[data-reporte]').forEach((btn) => {
            btn.addEventListener('click', () => showReporte(btn.getAttribute('data-reporte')));
        });
    }

    function showReporte(tipo) {
        const btns = document.querySelectorAll('[data-reporte]');
        btns.forEach((b) => {
            b.className = b.getAttribute('data-reporte') === tipo
                ? 'btn-primary tab-active'
                : 'px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg';
        });
        document.getElementById('reporteConsolidado').classList.toggle('hidden', tipo !== 'consolidado');
        document.getElementById('reporteOtro').classList.toggle('hidden', tipo === 'consolidado');
    }

    UCLA.views['reportes/tableros'] = { render };
    window.showReporte = showReporte;
})();

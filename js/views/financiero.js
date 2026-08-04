// Control Financiero — migrado del prototipo original.
(function () {
    function render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-white p-6 rounded-xl shadow-lg" style="border-left: 4px solid var(--color-primary);">
                        <h4 class="text-sm font-medium mb-1" style="color: var(--color-text-muted);">Ingresos Totales</h4>
                        <p class="text-2xl font-bold" style="color: var(--color-text);">$34.210.000</p>
                        <p class="text-xs mt-1" style="color: var(--color-primary);"><i class="fas fa-arrow-up"></i> +12% vs mes ant.</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg" style="border-left: 4px solid var(--color-danger);">
                        <h4 class="text-sm font-medium mb-1" style="color: var(--color-text-muted);">Costos Totales</h4>
                        <p class="text-2xl font-bold" style="color: var(--color-text);">$16.190.291</p>
                        <p class="text-xs mt-1 text-red-600"><i class="fas fa-arrow-up"></i> +5% vs mes ant.</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg" style="border-left: 4px solid var(--color-primary);">
                        <h4 class="text-sm font-medium mb-1" style="color: var(--color-text-muted);">Excedente</h4>
                        <p class="text-2xl font-bold" style="color: var(--color-text);">$18.019.709</p>
                        <p class="text-xs mt-1" style="color: var(--color-primary);">52.67% margen</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-lg" style="border-left: 4px solid var(--color-accent);">
                        <h4 class="text-sm font-medium mb-1" style="color: var(--color-text-muted);">Pendientes Pago</h4>
                        <p class="text-2xl font-bold" style="color: var(--color-text);">$2.450.000</p>
                        <p class="text-xs mt-1" style="color: var(--color-accent-dark);">3 facturas</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Control Financiero por Evento</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="table-head-branded">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costos</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Excedente</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Factura</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagado</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200" id="financieroTable"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('financieroTable').innerHTML = UCLA.data.financiero.map((f) => `
            <tr style="border-bottom: 1px solid #E1E4E5;" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${f.evento}</td>
                <td class="px-6 py-4 text-sm text-gray-600">$${f.ingresos.toLocaleString()}</td>
                <td class="px-6 py-4 text-sm text-gray-600">$${f.costos.toLocaleString()}</td>
                <td class="px-6 py-4 text-sm font-bold" style="color:#1C7FA8;">$${f.excedente.toLocaleString()}</td>
                <td class="px-6 py-4 text-sm font-bold" style="color:#1B4B62;">${f.pct}%</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full" style="${f.factura ? 'background:#E8F2F6;color:#1B4B62;' : 'background:#FEF3E9;color:#CA6B1A;'}">
                        ${f.factura ? '✓ Enviada' : 'Pendiente'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full" style="${f.pagado ? 'background:#E8F2F6;color:#1B4B62;' : 'background:#fee2e2;color:#991b1b;'}">
                        ${f.pagado ? '✓ Pagado' : 'Pendiente'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    UCLA.views['financiero/facturacion'] = { render };
})();

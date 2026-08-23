// Gestión de Eventos — listado migrado del prototipo original.
(function () {
    function render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div class="flex gap-2">
                        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500">
                            <option>Todos los estados</option>
                            <option>Programado</option>
                            <option>Activo</option>
                            <option>Certificado</option>
                            <option>Cancelado</option>
                        </select>
                        <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500">
                            <option>Todas las facultades</option>
                            <option>Derecho</option>
                            <option>Ingeniería</option>
                            <option>Ciencias Económicas</option>
                        </select>
                        <input type="month" value="2026-03" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500">
                    </div>
                    <div class="flex gap-2">
                        <button onclick="UCLA.utils.exportCSV('eventos', UCLA.data.eventos)" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <button onclick="UCLA.utils.exportPDF()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                        <button onclick="openModal('nuevoEventoModal')" class="btn-primary">
                            <i class="fas fa-plus"></i> Nuevo Evento
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="table-head-branded">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Evento</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matrículas</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Excedente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="eventosTable"></tbody>
                    </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('eventosTable').innerHTML = UCLA.data.eventos.map((e) => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${e.codigo}</td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${e.nombre}</div>
                    <div class="text-sm text-gray-500">Derecho • Medellín</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${e.fechas}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full" style="${e.estadoStyle}">${e.estado}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${e.matriculas}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div class="h-2 rounded-full" style="width: ${e.excedente}%; background: #1C7FA8;"></div>
                        </div>
                        <span class="text-sm font-medium" style="color: ${e.excedente > 0 ? '#1C7FA8' : '#6B6F72'};">${e.excedente}%</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button style="color: var(--color-primary);" class="mr-2"><i class="fas fa-eye"></i></button>
                    <button style="color: var(--color-text-muted);"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `).join('');
    }

    UCLA.views['eventos/gestion'] = { render };
})();

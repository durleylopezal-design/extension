// Solicitudes y Propuestas — flujo de aprobación Vo.Bo., migrado del prototipo original.
(function () {
    function render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold text-gray-800">Flujo de Aprobación (Vo.Bo.)</h3>
                        <button onclick="openModal('nuevaSolicitudModal')" class="btn-primary">
                            <i class="fas fa-plus"></i> Nueva Solicitud
                        </button>
                    </div>

                    <div class="space-y-4" id="solicitudesList">
                        <div class="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div class="flex items-start justify-between">
                                <div class="flex gap-4">
                                    <div class="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                                        <i class="fas fa-file-alt text-xl" style="color: var(--color-primary);"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-gray-800 text-lg">SOL-2026-0042</h4>
                                        <p class="text-gray-600">Formación en liderazgo organizacional - GRUPO ÉXITO</p>
                                        <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span><i class="fas fa-building"></i> NIT: 890.123.456-7</span>
                                            <span><i class="fas fa-calendar"></i> Recibida: 05/04/2026</span>
                                            <span><i class="fas fa-user"></i> Solicitante: Juan Martínez</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="px-3 py-1 rounded-full text-sm font-medium" style="background: var(--color-accent-100); color: var(--color-accent-dark);">En Revisión</span>
                                    <p class="text-sm text-gray-500 mt-2">Responsable: Dra. Patricia López</p>
                                </div>
                            </div>

                            <div class="mt-6">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-medium text-gray-700">Progreso de Aprobación</span>
                                    <span class="text-sm text-gray-500">2 de 4 Vo.Bo.</span>
                                </div>
                                <div class="flex gap-2">
                                    <div class="flex-1 h-2 rounded-full relative group cursor-pointer" style="background: var(--color-primary);">
                                        <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Extensión: Aprobado<br>05/04/2026 10:30
                                        </div>
                                    </div>
                                    <div class="flex-1 h-2 rounded-full relative group cursor-pointer" style="background: var(--color-primary);">
                                        <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Financiera: Aprobado<br>06/04/2026 14:15
                                        </div>
                                    </div>
                                    <div class="flex-1 h-2 rounded-full animate-pulse relative group cursor-pointer" style="background: var(--color-accent);">
                                        <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Programa: Pendiente
                                        </div>
                                    </div>
                                    <div class="flex-1 bg-gray-200 h-2 rounded-full relative group cursor-pointer">
                                        <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            OCRI: Pendiente
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-between mt-1 text-xs text-gray-500">
                                    <span>Extensión</span>
                                    <span>Financiera</span>
                                    <span>Programa</span>
                                    <span>OCRI</span>
                                </div>
                            </div>

                            <div class="mt-4 flex gap-2">
                                <button class="btn-primary text-sm">
                                    <i class="fas fa-eye"></i> Ver Detalle
                                </button>
                                <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                                    <i class="fas fa-file-pdf"></i> Ver Propuesta
                                </button>
                                <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                                    <i class="fas fa-history"></i> Historial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    UCLA.views['solicitudes/seguimiento'] = { render };
})();

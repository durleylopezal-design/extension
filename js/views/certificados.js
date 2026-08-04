// Certificados e Insignias — integración ACREDITTA, migrado del prototipo original.
(function () {
    function render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="bg-gradient-to-r from-brand-600 to-brand-400 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-2xl font-bold mb-2">Integración ACREDITTA</h3>
                            <p class="text-accent-100">Emisión automática de insignias digitales verificables</p>
                            <div class="flex items-center gap-4 mt-4">
                                <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                    <p class="text-2xl font-bold">2,847</p>
                                    <p class="text-sm text-accent-100">Insignias emitidas</p>
                                </div>
                                <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                    <p class="text-2xl font-bold">98.5%</p>
                                    <p class="text-sm text-accent-100">Tasa de éxito</p>
                                </div>
                                <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                    <p class="text-2xl font-bold">12</p>
                                    <p class="text-sm text-accent-100">Pendientes cola</p>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <i class="fas fa-medal text-4xl text-accent-600"></i>
                            </div>
                            <p class="mt-2 text-sm text-accent-100">API Conectada</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Eventos Listos para Certificación</h3>
                    <div class="space-y-3" id="certificadosList"></div>
                </div>
            </div>
        `;

        document.getElementById('certificadosList').innerHTML = UCLA.data.certificados.map((c) => `
            <div class="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-certificate text-accent-500 text-xl"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800">${c.nombre}</h4>
                        <p class="text-sm text-gray-500">${c.codigo} • ${c.participantes} participantes</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-sm font-medium" style="color: ${c.estado === 'Listo' ? '#1C7FA8' : '#CA6B1A'};">${c.estado}</p>
                        <p class="text-xs text-gray-500">${c.fecha}</p>
                    </div>
                    <button onclick="emitirInsignias('${c.codigo}')" class="btn-primary hover:shadow-lg transform hover:scale-105 transition-all" ${c.estado !== 'Listo' ? 'disabled style="background:#E1E4E5;color:#6B6F72;cursor:not-allowed;"' : ''}>
                        <i class="fas fa-medal mr-2"></i>Emitir Insignias
                    </button>
                </div>
            </div>
        `).join('');
    }

    function emitirInsignias(codigoEvento) {
        UCLA.components.toast.show(`Iniciando emisión de insignias para ${codigoEvento} vía ACREDITTA API...`, 'success');
        setTimeout(() => {
            UCLA.components.toast.show('Insignias emitidas exitosamente. Correos enviados a participantes.', 'success');
        }, 2000);
    }

    UCLA.views['certificados/emision'] = { render };
    window.emitirInsignias = emitirInsignias;
})();

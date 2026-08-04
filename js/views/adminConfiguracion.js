// Admin · Configuración General — formulario de ajustes institucionales
// (función simulada: no hay backend que persista esta configuración).
(function () {
    const configuracion = { nombreInstitucion: 'UCLA Extensión Universitaria', sedePrincipal: 'MDE', moneda: 'COP', formatoFecha: 'DD/MM/AAAA', notificarNuevasSolicitudes: true, notificarCarteraVencida: true };

    function render(container) {
        container.innerHTML = `
            <div class="max-w-2xl space-y-4">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="section-title text-base mb-4">Datos institucionales</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Nombre de la institución</label>
                            <input id="cgNombre" type="text" class="input-brand w-full px-3 py-2 text-sm" value="${configuracion.nombreInstitucion}">
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Sede principal</label>
                            <select id="cgSede" class="input-brand w-full px-3 py-2 text-sm">
                                ${UCLA.state.SEDES.map((s) => `<option value="${s.codigo}" ${s.codigo === configuracion.sedePrincipal ? 'selected' : ''}>${s.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Moneda</label>
                            <select id="cgMoneda" class="input-brand w-full px-3 py-2 text-sm">
                                <option ${configuracion.moneda === 'COP' ? 'selected' : ''}>COP</option>
                                <option ${configuracion.moneda === 'USD' ? 'selected' : ''}>USD</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Formato de fecha</label>
                            <select id="cgFormatoFecha" class="input-brand w-full px-3 py-2 text-sm">
                                <option ${configuracion.formatoFecha === 'DD/MM/AAAA' ? 'selected' : ''}>DD/MM/AAAA</option>
                                <option ${configuracion.formatoFecha === 'MM/DD/AAAA' ? 'selected' : ''}>MM/DD/AAAA</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="section-title text-base mb-4">Colores institucionales</h3>
                    <div class="flex gap-4">
                        ${[['--color-primary', 'Primario'], ['--color-primary-dark', 'Primario oscuro'], ['--color-accent', 'Acento']].map(([v, l]) => `
                            <div class="text-center">
                                <div class="w-14 h-14 rounded-lg shadow-inner" style="background: var(${v});"></div>
                                <p class="text-xs mt-1" style="color: var(--color-text-muted);">${l}</p>
                            </div>`).join('')}
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="section-title text-base mb-4">Notificaciones</h3>
                    <label class="flex items-center gap-2 text-sm mb-3 cursor-pointer" style="color: var(--color-text);">
                        <input id="cgNotifSolicitudes" type="checkbox" ${configuracion.notificarNuevasSolicitudes ? 'checked' : ''}> Notificar nuevas solicitudes
                    </label>
                    <label class="flex items-center gap-2 text-sm cursor-pointer" style="color: var(--color-text);">
                        <input id="cgNotifCartera" type="checkbox" ${configuracion.notificarCarteraVencida ? 'checked' : ''}> Notificar cartera vencida
                    </label>
                </div>

                <div class="flex justify-end">
                    <button id="cgGuardar" class="btn-primary text-sm">Guardar cambios</button>
                </div>
            </div>`;

        container.querySelector('#cgGuardar').addEventListener('click', () => {
            configuracion.nombreInstitucion = container.querySelector('#cgNombre').value;
            configuracion.sedePrincipal = container.querySelector('#cgSede').value;
            configuracion.moneda = container.querySelector('#cgMoneda').value;
            configuracion.formatoFecha = container.querySelector('#cgFormatoFecha').value;
            configuracion.notificarNuevasSolicitudes = container.querySelector('#cgNotifSolicitudes').checked;
            configuracion.notificarCarteraVencida = container.querySelector('#cgNotifCartera').checked;
            UCLA.utils.registrarAuditoria({ accion: 'Modificó configuración general', modulo: 'Administración', detalle: `Sede principal: ${configuracion.sedePrincipal}, moneda: ${configuracion.moneda}` });
            UCLA.components.toast.show('Configuración guardada', 'success');
        });
    }

    UCLA.views['admin/configuracion'] = { render };
})();

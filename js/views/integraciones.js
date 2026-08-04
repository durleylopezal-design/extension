// Integraciones — galería de tarjetas de servicios externos conectados
// (UCLA.data.integraciones). No usa listShell: es una cuadrícula de estado,
// mismo patrón que certificados/plantillas.
(function () {
    let clickHandler = null;

    function tarjeta(i) {
        const conectado = i.estado === 'Conectado';
        return `
            <div class="bg-white rounded-xl shadow-lg p-5">
                <div class="flex items-start justify-between">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center" style="background: color-mix(in srgb, ${conectado ? 'var(--color-success)' : 'var(--color-neutral-dark, #6B6F72)'} 15%, white);">
                        <i class="fas ${i.icono} text-lg" style="color: ${conectado ? 'var(--color-success)' : 'var(--color-text-muted)'};"></i>
                    </div>
                    ${UCLA.utils.badgeEstado(i.estado)}
                </div>
                <p class="text-sm font-semibold mt-3" style="color: var(--color-text);">${i.nombre}</p>
                <p class="text-xs mt-1" style="color: var(--color-text-muted); min-height: 2.5em;">${i.descripcion}</p>
                <p class="text-xs mt-2" style="color: var(--color-text-muted);">${i.ultimaSincronizacion ? 'Última sincronización: ' + UCLA.utils.formatoFecha(i.ultimaSincronizacion) : 'Nunca sincronizado'}</p>
                <div class="flex gap-3 mt-3">
                    <button data-toggle="${i.id}" class="text-xs font-medium hover:underline" style="color: ${conectado ? 'var(--color-danger)' : 'var(--color-success)'};">${conectado ? 'Desconectar' : 'Conectar'}</button>
                    ${conectado ? `<button data-probar="${i.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Probar conexión</button>` : ''}
                </div>
            </div>`;
    }

    function render(container) {
        function pintar() {
            container.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${UCLA.data.integraciones.map(tarjeta).join('')}</div>`;
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const toggle = e.target.closest('[data-toggle]');
            const probar = e.target.closest('[data-probar]');
            if (toggle) {
                const i = UCLA.data.integraciones.find((x) => x.id === toggle.getAttribute('data-toggle'));
                if (i) {
                    i.estado = i.estado === 'Conectado' ? 'Desconectado' : 'Conectado';
                    i.ultimaSincronizacion = i.estado === 'Conectado' ? new Date().toISOString().slice(0, 10) : null;
                    UCLA.components.toast.show(`${i.nombre} ${i.estado === 'Conectado' ? 'conectado' : 'desconectado'}`, i.estado === 'Conectado' ? 'success' : 'info');
                    pintar();
                }
            } else if (probar) {
                const i = UCLA.data.integraciones.find((x) => x.id === probar.getAttribute('data-probar'));
                if (i) UCLA.components.toast.show(`Conexión con ${i.nombre} verificada correctamente`, 'success');
            }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['integraciones'] = { render };
})();

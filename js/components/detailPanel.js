// Página/panel de detalle de un registro: encabezado con avatar/badges,
// pestañas, y un helper de línea de tiempo de interacciones reutilizable
// (egresados, y más adelante empresas aliadas, etc.).
(function () {
    const ICONO_TIMELINE = {
        correo: { icono: 'fa-envelope', color: 'var(--color-primary)' },
        llamada: { icono: 'fa-phone', color: 'var(--color-accent)' },
        evento: { icono: 'fa-calendar-check', color: 'var(--color-success)' },
        encuesta: { icono: 'fa-clipboard-list', color: 'var(--color-primary-light)' },
        pago: { icono: 'fa-dollar-sign', color: 'var(--color-success)' },
        postulacion: { icono: 'fa-briefcase', color: 'var(--color-accent-dark)' },
    };

    function render(container, { encabezado, pestanas, tabInicial }) {
        let activa = tabInicial || (pestanas[0] && pestanas[0].id);

        container.innerHTML = `
            <div class="space-y-4">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-start justify-between flex-wrap gap-4">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--color-primary-50);">
                                ${encabezado.avatarUrl
                                    ? `<img src="${encabezado.avatarUrl}" class="w-16 h-16 rounded-full">`
                                    : `<i class="fas ${encabezado.icono || 'fa-user'} text-2xl" style="color: var(--color-primary);"></i>`}
                            </div>
                            <div>
                                <h2 class="text-xl font-bold" style="color: var(--color-primary-dark);">${encabezado.titulo}</h2>
                                <p class="text-sm" style="color: var(--color-text-muted);">${encabezado.subtitulo || ''}</p>
                                <div class="flex gap-2 mt-2 flex-wrap">
                                    ${(encabezado.badges || []).map((b) => `
                                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: color-mix(in srgb, ${b.color} 18%, white); color: ${b.color};">${b.texto}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            ${(encabezado.acciones || []).map((a, i) => `
                                <button data-detail-accion="${i}" class="${a.principal ? 'btn-primary' : ''} text-sm ${a.principal ? '' : 'px-4 py-2 rounded-lg border'}" style="${a.principal ? '' : 'border-color: var(--color-border); color: var(--color-text);'}">${a.etiqueta}</button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="flex gap-1 mt-5 overflow-x-auto" style="border-bottom: 1px solid var(--color-border);">
                        ${pestanas.map((p) => `
                            <button data-detail-tab="${p.id}" class="px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0" style="color: ${p.id === activa ? 'var(--color-primary)' : 'var(--color-text-muted)'}; border-bottom: 2px solid ${p.id === activa ? 'var(--color-primary)' : 'transparent'};">
                                ${p.etiqueta}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div id="detailPanelCuerpo"></div>
            </div>`;

        (encabezado.acciones || []).forEach((a, i) => {
            container.querySelector(`[data-detail-accion="${i}"]`).addEventListener('click', a.onClick);
        });

        function pintarTab() {
            container.querySelectorAll('[data-detail-tab]').forEach((btn) => {
                const activo = btn.getAttribute('data-detail-tab') === activa;
                btn.style.color = activo ? 'var(--color-primary)' : 'var(--color-text-muted)';
                btn.style.borderBottom = `2px solid ${activo ? 'var(--color-primary)' : 'transparent'}`;
            });
            const pestana = pestanas.find((p) => p.id === activa);
            const cuerpo = container.querySelector('#detailPanelCuerpo');
            cuerpo.innerHTML = '';
            if (pestana) pestana.render(cuerpo);
        }

        container.querySelectorAll('[data-detail-tab]').forEach((btn) => {
            btn.addEventListener('click', () => { activa = btn.getAttribute('data-detail-tab'); pintarTab(); });
        });

        pintarTab();
    }

    // Helper reutilizable: línea de tiempo de interacciones, orden descendente.
    function renderTimeline(container, interacciones) {
        const ordenadas = interacciones.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
        if (!ordenadas.length) {
            container.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Sin interacciones registradas todavía.</div>`;
            return;
        }
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="space-y-5">
                    ${ordenadas.map((i) => {
                        const meta = ICONO_TIMELINE[i.tipo] || { icono: 'fa-circle-dot', color: 'var(--color-neutral)' };
                        return `
                            <div class="flex gap-3">
                                <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: color-mix(in srgb, ${meta.color} 18%, white);">
                                    <i class="fas ${meta.icono} text-sm" style="color: ${meta.color};"></i>
                                </div>
                                <div class="flex-1 pb-4" style="border-bottom: 1px solid var(--color-border);">
                                    <div class="flex items-center justify-between">
                                        <p class="text-sm font-semibold" style="color: var(--color-text);">${i.titulo}</p>
                                        <span class="text-xs" style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(i.fecha)}</span>
                                    </div>
                                    <p class="text-sm mt-0.5" style="color: var(--color-text-muted);">${i.detalle}</p>
                                </div>
                            </div>`;
                    }).join('')}
                </div>
            </div>`;
    }

    UCLA.components.detailPanel = { render, renderTimeline };
})();

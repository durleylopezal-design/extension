// Eventos · Calendario — vista de mes con los eventos de UCLA.data.eventos
// coloreados por estado (colorEstado). No usa listShell: es una cuadrícula de
// calendario, un patrón distinto al de listado/tabla que ya cubren los demás módulos.
(function () {
    const HOY = new Date('2026-08-04T12:00:00');
    const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    function iso(y, m, d) {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    function eventosDelDia(fechaIso) {
        return UCLA.data.eventos.filter((e) => e.fechaInicio && e.fechaFin && fechaIso >= e.fechaInicio && fechaIso <= e.fechaFin);
    }

    function render(container) {
        let vista = { anio: HOY.getFullYear(), mes: HOY.getMonth() };

        function pintar() {
            const primerDia = new Date(vista.anio, vista.mes, 1);
            const ultimoDia = new Date(vista.anio, vista.mes + 1, 0);
            const celdas = [];
            for (let i = 0; i < primerDia.getDay(); i++) celdas.push(null);
            for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(d);

            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">${MESES[vista.mes]} ${vista.anio}</h3>
                        <div class="flex items-center gap-2">
                            <button id="calHoy" class="px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">Hoy</button>
                            <button id="calAnterior" class="w-8 h-8 rounded-lg border flex items-center justify-center" style="border-color: var(--color-border);"><i class="fas fa-chevron-left text-xs"></i></button>
                            <button id="calSiguiente" class="w-8 h-8 rounded-lg border flex items-center justify-center" style="border-color: var(--color-border);"><i class="fas fa-chevron-right text-xs"></i></button>
                        </div>
                    </div>
                    <div class="grid grid-cols-7 gap-px text-xs font-semibold uppercase text-center mb-1" style="color: var(--color-text-muted);">
                        ${DIAS_SEMANA.map((d) => `<div class="py-1">${d}</div>`).join('')}
                    </div>
                    <div class="grid grid-cols-7 gap-px" style="background: var(--color-border);">
                        ${celdas.map((d) => {
                            if (!d) return `<div class="bg-white" style="min-height: 96px;"></div>`;
                            const fechaIso = iso(vista.anio, vista.mes, d);
                            const esHoy = fechaIso === iso(HOY.getFullYear(), HOY.getMonth(), HOY.getDate());
                            const eventosDia = eventosDelDia(fechaIso);
                            const visibles = eventosDia.slice(0, 2);
                            const resto = eventosDia.length - visibles.length;
                            return `
                                <div class="bg-white p-1.5" style="min-height: 96px;">
                                    <span class="text-xs font-medium inline-flex items-center justify-center ${esHoy ? 'w-5 h-5 rounded-full text-white' : ''}" style="${esHoy ? 'background: var(--color-primary);' : 'color: var(--color-text-muted);'}">${d}</span>
                                    <div class="mt-1 space-y-1">
                                        ${visibles.map((e) => `
                                            <button data-cal-evento="${e.codigo}" class="block w-full text-left text-[11px] leading-tight px-1.5 py-0.5 rounded truncate" style="background: color-mix(in srgb, ${UCLA.utils.colorEstado(e.estado)} 18%, white); color: ${UCLA.utils.colorEstado(e.estado)};" title="${e.nombre}">${e.nombre}</button>
                                        `).join('')}
                                        ${resto > 0 ? `<span class="block text-[11px]" style="color: var(--color-text-muted);">+${resto} más</span>` : ''}
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>`;

            container.querySelector('#calHoy').addEventListener('click', () => { vista = { anio: HOY.getFullYear(), mes: HOY.getMonth() }; pintar(); });
            container.querySelector('#calAnterior').addEventListener('click', () => { vista.mes--; if (vista.mes < 0) { vista.mes = 11; vista.anio--; } pintar(); });
            container.querySelector('#calSiguiente').addEventListener('click', () => { vista.mes++; if (vista.mes > 11) { vista.mes = 0; vista.anio++; } pintar(); });
            container.querySelectorAll('[data-cal-evento]').forEach((btn) => {
                btn.addEventListener('click', () => abrirDetalle(UCLA.data.eventos.find((e) => e.codigo === btn.getAttribute('data-cal-evento'))));
            });
        }

        pintar();
    }

    function abrirDetalle(evento) {
        let modal = document.getElementById('modalDetalleEvento');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalDetalleEvento';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-de-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <div class="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">${evento.nombre}</h3>
                    ${UCLA.utils.badgeEstado(evento.estado)}
                </div>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">${evento.codigo}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                    <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Fechas</p><p>${UCLA.utils.formatoFecha(evento.fechaInicio)} - ${UCLA.utils.formatoFecha(evento.fechaFin)}</p></div>
                    <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Modalidad</p><p>${evento.modalidad}</p></div>
                    <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Facultad</p><p>${evento.facultad}</p></div>
                    <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Sede</p><p>${evento.sedeId}</p></div>
                    <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Cupos</p><p>${evento.cupoOcupado} / ${evento.cupoMaximo}</p></div>
                    <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Responsable</p><p>${evento.responsable}</p></div>
                </div>
                <div class="flex justify-end gap-2">
                    <button data-de-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cerrar</button>
                    <button id="deVerGestion" class="btn-primary text-sm">Ver en Gestión de Eventos</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-de-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#deVerGestion').addEventListener('click', () => { modal.classList.add('hidden'); UCLA.router.navigate('eventos/gestion'); });
        modal.classList.remove('hidden');
    }

    UCLA.views['eventos/calendario'] = { render };
})();

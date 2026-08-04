// Eventos · Control de Cupos y Lista de Espera — statCards + listShell sobre
// UCLA.data.eventos, con acción para promover inscritos desde la lista de
// espera (UCLA.data.eventosAsistentes) cuando se libera un cupo.
(function () {
    const CAMPOS_MODULO = ['Facultad', 'Modalidad', 'Sede'];
    let clickHandler = null;

    function listaEspera(codigo) {
        return UCLA.data.eventosAsistentes.filter((a) => a.eventoCodigo === codigo && a.estadoInscripcion === 'Lista de espera');
    }

    function stats(eventos) {
        const cupoTotal = eventos.reduce((s, e) => s + e.cupoMaximo, 0);
        const ocupado = eventos.reduce((s, e) => s + e.cupoOcupado, 0);
        const enEspera = UCLA.data.eventosAsistentes.filter((a) => a.estadoInscripcion === 'Lista de espera').length;
        return [
            { etiqueta: 'Cupos ofertados', valor: cupoTotal, color: 'var(--color-primary)' },
            { etiqueta: 'Cupos ocupados', valor: ocupado, color: 'var(--color-success)' },
            { etiqueta: 'Cupos disponibles', valor: Math.max(0, cupoTotal - ocupado), color: 'var(--color-accent)' },
            { etiqueta: 'En lista de espera', valor: enEspera, color: 'var(--color-danger)' },
        ];
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Evento', render: (e) => `<span class="font-medium" style="color: var(--color-text);">${e.nombre}</span>` },
            { clave: 'fechaInicio', etiqueta: 'Fecha', render: (e) => UCLA.utils.formatoFecha(e.fechaInicio) },
            {
                clave: 'cupoOcupado', etiqueta: 'Ocupación', render: (e) => {
                    const pct = Math.min(100, Math.round((e.cupoOcupado / e.cupoMaximo) * 100));
                    return `<div class="flex items-center gap-2">
                        <div class="w-20 bg-gray-200 rounded-full h-2"><div class="h-2 rounded-full" style="width: ${pct}%; background: ${pct >= 100 ? 'var(--color-danger)' : 'var(--color-primary)'};"></div></div>
                        <span class="text-xs font-medium">${e.cupoOcupado} / ${e.cupoMaximo}</span>
                    </div>`;
                },
            },
            { clave: 'listaEspera', etiqueta: 'Lista de espera', render: (e) => { const n = listaEspera(e.codigo).length; return n > 0 ? `<span style="color: var(--color-danger); font-weight: 600;">${n}</span>` : '-'; } },
            { clave: 'estado', etiqueta: 'Estado', render: (e) => UCLA.utils.badgeEstado(e.estado) },
            { clave: 'acciones', etiqueta: 'Acciones', render: (e) => `<button data-espera="${e.codigo}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Ver lista de espera</button>` },
        ];
    }

    function render(container) {
        const eventos = UCLA.data.eventos.filter((e) => e.estado !== 'CANCELADO');

        function pintar() {
            container.innerHTML = `
                <div id="ecStats" class="mb-4"></div>
                <div id="ecLista"></div>`;
            UCLA.components.statCards.render(container.querySelector('#ecStats'), stats(eventos));
            UCLA.components.listShell.render(container.querySelector('#ecLista'), {
                titulo: 'Control de Cupos y Lista de Espera',
                columnas: columnas(),
                filas: eventos,
                filaId: (e) => e.codigo,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'cupos-eventos',
                botonPrincipal: { etiqueta: 'Ajustar cupo máximo', onClick: () => UCLA.components.toast.show('Selecciona un evento en Gestión de Eventos para editar su cupo máximo', 'info') },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-espera]');
            if (btn) abrirListaEspera(btn.getAttribute('data-espera'), pintar);
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirListaEspera(codigo, alGuardar) {
        const evento = UCLA.data.eventos.find((e) => e.codigo === codigo);
        let modal = document.getElementById('modalListaEspera');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalListaEspera';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }

        function pintar() {
            const espera = listaEspera(codigo);
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-le-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                    <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Lista de espera</h3>
                    <p class="text-sm mb-4" style="color: var(--color-text-muted);">${evento.nombre} · Cupos ${evento.cupoOcupado} / ${evento.cupoMaximo}</p>
                    ${espera.length ? `
                        <div class="space-y-2 max-h-72 overflow-y-auto">
                            ${espera.map((a) => `
                                <div class="flex items-center justify-between px-3 py-2 rounded-lg border" style="border-color: var(--color-border);">
                                    <div><p class="text-sm font-medium" style="color: var(--color-text);">${a.nombre}</p><p class="text-xs" style="color: var(--color-text-muted);">${a.documento}</p></div>
                                    <button data-promover="${a.id}" class="text-xs font-medium hover:underline" style="color: var(--color-success);">Promover</button>
                                </div>`).join('')}
                        </div>` : `<p class="text-sm text-center py-6" style="color: var(--color-text-muted);">No hay personas en lista de espera para este evento.</p>`}
                    <div class="flex justify-end pt-4">
                        <button data-le-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cerrar</button>
                    </div>
                </div>`;
            modal.querySelectorAll('[data-le-cerrar]').forEach((el) => el.addEventListener('click', () => { modal.classList.add('hidden'); alGuardar(); }));
            modal.querySelectorAll('[data-promover]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    if (evento.cupoOcupado >= evento.cupoMaximo) { UCLA.components.toast.show('El evento no tiene cupos disponibles', 'error'); return; }
                    const a = UCLA.data.eventosAsistentes.find((x) => x.id === btn.getAttribute('data-promover'));
                    a.estadoInscripcion = 'Confirmado';
                    evento.cupoOcupado++;
                    UCLA.components.toast.show(`${a.nombre} fue promovido a Confirmado`, 'success');
                    pintar();
                });
            });
        }

        pintar();
        modal.classList.remove('hidden');
    }

    UCLA.views['eventos/cupos'] = { render };
})();

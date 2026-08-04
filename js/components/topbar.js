// Barra superior: título de página, buscador global, selector de sede,
// notificaciones, botón +Nuevo y menú de perfil.
(function () {
    function buscarEnDatos(termino) {
        const t = termino.trim().toLowerCase();
        if (!t) return {};
        const resultados = {};

        const leads = (UCLA.data.leads || []).filter((l) => `${l.nombre} ${l.apellidos}`.toLowerCase().includes(t));
        if (leads.length) resultados['Posibles Estudiantes'] = leads.map((l) => ({ etiqueta: `${l.nombre} ${l.apellidos}`, sub: l.programaInteres, ruta: 'crm/leads' }));

        const cuentas = (UCLA.data.cuentas || []).filter((c) => c.razonSocial.toLowerCase().includes(t));
        if (cuentas.length) resultados['Cuentas'] = cuentas.map((c) => ({ etiqueta: c.razonSocial, sub: c.sector, ruta: 'crm/cuentas' }));

        const oportunidades = (UCLA.data.oportunidades || []).filter((o) => o.nombre.toLowerCase().includes(t));
        if (oportunidades.length) resultados['Oportunidades'] = oportunidades.map((o) => ({ etiqueta: o.nombre, sub: UCLA.utils.formatoCOP(o.valor), ruta: 'crm/oportunidades' }));

        const eventos = (UCLA.data.eventos || []).filter((e) => e.nombre.toLowerCase().includes(t) || e.codigo.toLowerCase().includes(t));
        if (eventos.length) resultados['Eventos'] = eventos.map((e) => ({ etiqueta: e.nombre, sub: e.codigo, ruta: 'eventos/gestion' }));

        const certificados = (UCLA.data.certificados || []).filter((c) => c.nombre.toLowerCase().includes(t) || c.codigo.toLowerCase().includes(t));
        if (certificados.length) resultados['Certificados'] = certificados.map((c) => ({ etiqueta: c.nombre, sub: c.codigo, ruta: 'certificados/emision' }));

        const financiero = (UCLA.data.financiero || []).filter((f) => f.evento.toLowerCase().includes(t));
        if (financiero.length) resultados['Financiero'] = financiero.map((f) => ({ etiqueta: f.evento, sub: UCLA.utils.formatoCOP(f.ingresos), ruta: 'financiero/facturacion' }));

        return resultados;
    }

    function renderResultados(panel, resultados) {
        const grupos = Object.keys(resultados);
        if (!grupos.length) {
            panel.innerHTML = `<div class="p-4 text-sm text-center" style="color: var(--color-text-muted);">Sin resultados</div>`;
            panel.classList.remove('hidden');
            return;
        }
        panel.innerHTML = grupos.map((grupo) => `
            <div class="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide" style="color: var(--color-text-muted);">${grupo}</div>
            ${resultados[grupo].map((r) => `
                <button type="button" data-ruta="${r.ruta}" class="global-search-result w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col">
                    <span class="text-sm font-medium" style="color: var(--color-text);">${r.etiqueta}</span>
                    <span class="text-xs" style="color: var(--color-text-muted);">${r.sub}</span>
                </button>
            `).join('')}
        `).join('');
        panel.classList.remove('hidden');
    }

    function html() {
        const sedes = UCLA.state.SEDES.map((s) => `<option value="${s.codigo}">${s.nombre} (${s.codigo})</option>`).join('');
        return `
            <div class="flex items-center justify-between px-8 py-4 gap-4">
                <h2 id="pageTitle" class="text-xl font-bold flex-shrink-0" style="color: var(--color-primary-dark);"></h2>

                <div class="relative flex-1 max-w-md">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm" style="color: var(--color-text-muted);"></i>
                    <input type="text" id="globalSearch" placeholder="Buscar cuentas, eventos, certificados..."
                           class="input-brand w-full pl-9 pr-4 py-2 text-sm" autocomplete="off">
                    <div id="globalSearchResults" class="hidden absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border overflow-y-auto z-20" style="max-height: 320px; border-color: var(--color-border);"></div>
                </div>

                <div class="flex items-center gap-4 flex-shrink-0">
                    <div class="relative">
                        <select id="sedeSelector" class="input-brand appearance-none bg-white py-2 pl-3 pr-8 text-sm font-medium" style="color: var(--color-primary);">
                            ${sedes}
                        </select>
                        <i class="fas fa-chevron-down absolute right-3 top-3 pointer-events-none text-xs" style="color: var(--color-primary);"></i>
                    </div>

                    <button id="btnNotificaciones" class="relative p-2 transition-colors" style="color: var(--color-primary);" title="Notificaciones">
                        <i class="fas fa-bell text-xl"></i>
                        <span class="notification-dot"></span>
                        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                    </button>

                    <div class="relative">
                        <button id="btnNuevo" class="btn-accent flex items-center gap-2">
                            <i class="fas fa-plus"></i> Nuevo
                        </button>
                        <div id="menuNuevo" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border py-2 z-20" style="border-color: var(--color-border);">
                            <button type="button" data-modal="nuevaOportunidadModal" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><i class="fas fa-bullseye w-4" style="color: var(--color-primary);"></i> Nueva Oportunidad</button>
                            <button type="button" data-modal="nuevoEventoModal" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><i class="fas fa-calendar-plus w-4" style="color: var(--color-primary);"></i> Nuevo Evento</button>
                            <button type="button" data-modal="nuevaSolicitudModal" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><i class="fas fa-file-circle-plus w-4" style="color: var(--color-primary);"></i> Nueva Solicitud</button>
                        </div>
                    </div>

                    <div class="relative">
                        <button id="btnPerfil" class="flex items-center gap-2">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(UCLA.state.usuarioActual.nombre)}&background=1C7FA8&color=fff" class="w-9 h-9 rounded-full">
                        </button>
                        <div id="menuPerfil" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border py-3 z-20" style="border-color: var(--color-border);">
                            <div class="px-4 pb-2 mb-2" style="border-bottom: 1px solid var(--color-border);">
                                <p class="text-sm font-semibold" style="color: var(--color-text);">${UCLA.state.usuarioActual.nombre}</p>
                                <p class="text-xs" style="color: var(--color-text-muted);">${UCLA.state.usuarioActual.cargo}</p>
                                <p class="text-xs" style="color: var(--color-text-muted);">${UCLA.state.usuarioActual.correo}</p>
                            </div>
                            <button type="button" onclick="logout()" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" style="color: var(--color-danger);">
                                <i class="fas fa-sign-out-alt w-4"></i> Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function cerrarMenusFlotantes() {
        document.getElementById('menuNuevo')?.classList.add('hidden');
        document.getElementById('menuPerfil')?.classList.add('hidden');
        document.getElementById('globalSearchResults')?.classList.add('hidden');
    }

    function bind(container) {
        const buscador = container.querySelector('#globalSearch');
        const panelResultados = container.querySelector('#globalSearchResults');
        buscador.addEventListener('input', UCLA.utils.debounce((e) => {
            const resultados = buscarEnDatos(e.target.value);
            if (!e.target.value.trim()) { panelResultados.classList.add('hidden'); return; }
            renderResultados(panelResultados, resultados);
        }, 200));
        panelResultados.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-ruta]');
            if (!btn) return;
            UCLA.router.navigate(btn.getAttribute('data-ruta'));
            buscador.value = '';
            panelResultados.classList.add('hidden');
        });

        const sedeSelector = container.querySelector('#sedeSelector');
        sedeSelector.value = UCLA.state.getSedeActiva();
        sedeSelector.addEventListener('change', (e) => {
            UCLA.state.setSedeActiva(e.target.value);
            UCLA.components.toast.show(`Sede activa: ${e.target.selectedOptions[0].textContent}`, 'info');
        });

        container.querySelector('#btnNotificaciones').addEventListener('click', (e) => {
            e.stopPropagation();
            window.toggleNotifications();
        });

        const btnNuevo = container.querySelector('#btnNuevo');
        const menuNuevo = container.querySelector('#menuNuevo');
        btnNuevo.addEventListener('click', (e) => {
            e.stopPropagation();
            const abrir = menuNuevo.classList.contains('hidden');
            cerrarMenusFlotantes();
            menuNuevo.classList.toggle('hidden', !abrir);
        });
        menuNuevo.querySelectorAll('[data-modal]').forEach((btn) => {
            btn.addEventListener('click', () => {
                UCLA.components.modal.open(btn.getAttribute('data-modal'));
                cerrarMenusFlotantes();
            });
        });

        const btnPerfil = container.querySelector('#btnPerfil');
        const menuPerfil = container.querySelector('#menuPerfil');
        btnPerfil.addEventListener('click', (e) => {
            e.stopPropagation();
            const abrir = menuPerfil.classList.contains('hidden');
            cerrarMenusFlotantes();
            menuPerfil.classList.toggle('hidden', !abrir);
        });

        document.addEventListener('click', cerrarMenusFlotantes);
    }

    function render(container) {
        if (!container) return;
        container.innerHTML = html();
        bind(container);
    }

    UCLA.components.topbar = { render };
    window.changeSede = (codigo) => UCLA.state.setSedeActiva(codigo);
})();

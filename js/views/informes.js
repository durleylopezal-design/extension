// Informes — listado con desplegable de carpetas, favoritos y buscador.
(function () {
    const ACCESOS_GENERALES = [
        { id: 'todos', icono: 'fa-layer-group', etiqueta: 'Todos los informes' },
        { id: 'mios', icono: 'fa-user', etiqueta: 'Mis informes' },
        { id: 'favoritos', icono: 'fa-star', etiqueta: 'Favoritos' },
        { id: 'recientes', icono: 'fa-clock', etiqueta: 'Vistos recientemente' },
        { id: 'programados', icono: 'fa-calendar-check', etiqueta: 'Informes de programación' },
        { id: 'eliminados', icono: 'fa-trash', etiqueta: 'Eliminado recientemente' },
    ];

    let carpetaActiva = { tipo: 'acceso', id: 'todos', etiqueta: 'Todos los informes' };
    let panelAbierto = false;
    let textoBusquedaCarpeta = '';
    let textoBusquedaTabla = '';

    function informesFiltrados() {
        let lista = UCLA.data.informes.slice();

        if (carpetaActiva.tipo === 'acceso') {
            if (carpetaActiva.id === 'favoritos') {
                const favs = UCLA.state.getFavoritos();
                lista = lista.filter((i) => favs.includes(i.id));
            }
            // 'mios' / 'recientes' / 'programados' / 'eliminados' se simulan mostrando el set completo
        } else if (carpetaActiva.tipo === 'modulo') {
            lista = lista.filter((i) => i.carpeta === carpetaActiva.id);
        } else if (carpetaActiva.tipo === 'custom') {
            lista = lista.filter((i) => i.carpetaCustomId === carpetaActiva.id);
        }

        if (textoBusquedaTabla.trim()) {
            const t = textoBusquedaTabla.trim().toLowerCase();
            lista = lista.filter((i) => i.nombre.toLowerCase().includes(t) || i.descripcion.toLowerCase().includes(t));
        }
        return lista;
    }

    function render(container) {
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h2 class="text-2xl font-bold" style="color: var(--color-primary);">Informes</h2>
                        <div class="relative mt-2 inline-block">
                            <button id="btnCarpetaDropdown" class="input-brand flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white" style="color: var(--color-text);">
                                <span id="etiquetaCarpetaActiva"></span>
                                <i class="fas fa-chevron-down text-xs transition-transform"></i>
                            </button>
                            <div id="panelCarpetas" class="hidden absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-30" style="border-color: var(--color-border);"></div>
                        </div>
                    </div>
                    <div class="relative">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm" style="color: var(--color-text-muted);"></i>
                        <input id="buscarRegistros" type="text" placeholder="Buscar registros" class="input-brand pl-9 pr-4 py-2 text-sm w-64">
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table class="w-full">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--color-primary-100);">
                                <th class="w-10 px-4 py-3"><input type="checkbox" disabled></th>
                                <th class="w-10 px-2 py-3"></th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Nombre del informe</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Descripción</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Carpeta</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Última modificación</th>
                            </tr>
                        </thead>
                        <tbody id="filasInformes"></tbody>
                    </table>
                    <div id="estadoVacioInformes" class="hidden p-12 text-center text-sm" style="color: var(--color-text-muted);">No se encontraron informes en esta carpeta.</div>
                </div>
            </div>

            <!-- Modal Administrar Carpetas -->
            <div id="modalCarpetas" class="hidden fixed inset-0 z-50 flex items-center justify-center modal">
                <div class="fixed inset-0 bg-black opacity-50" data-cerrar-modal-carpetas></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">Administrar Carpetas</h3>
                        <button data-cerrar-modal-carpetas class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <div id="listaCarpetasCustom" class="space-y-2 mb-4 max-h-56 overflow-y-auto"></div>
                    <div class="flex gap-2">
                        <input id="nombreCarpetaNueva" type="text" placeholder="Nombre de la carpeta" class="input-brand flex-1 px-3 py-2 text-sm">
                        <button id="btnCrearCarpeta" class="btn-primary text-sm">Crear</button>
                    </div>
                </div>
            </div>
        `;

        pintarCarpetaDropdown(container);
        pintarTabla(container);
        bind(container);
    }

    function carpetasCustom() {
        return UCLA.state.getCarpetasPersonalizadas();
    }

    function pintarCarpetaDropdown(container) {
        container.querySelector('#etiquetaCarpetaActiva').textContent = carpetaActiva.etiqueta;
        const panel = container.querySelector('#panelCarpetas');

        const filtro = (etiqueta) => !textoBusquedaCarpeta.trim() || etiqueta.toLowerCase().includes(textoBusquedaCarpeta.trim().toLowerCase());

        const accesosHtml = ACCESOS_GENERALES.filter((a) => filtro(a.etiqueta)).map((a) => `
            <button type="button" data-carpeta-tipo="acceso" data-carpeta-id="${a.id}" data-carpeta-etiqueta="${a.etiqueta}"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left">
                <i class="fas ${a.icono} w-4" style="color: var(--color-text-muted);"></i>
                <span class="flex-1" style="color: var(--color-text);">${a.etiqueta}</span>
                ${carpetaActiva.tipo === 'acceso' && carpetaActiva.id === a.id ? `<i class="fas fa-check text-xs" style="color: var(--color-accent);"></i>` : ''}
            </button>`).join('');

        const modulosHtml = UCLA.data.carpetasModulo.filter((m) => filtro(m)).map((m) => `
            <button type="button" data-carpeta-tipo="modulo" data-carpeta-id="${m}" data-carpeta-etiqueta="${m}"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left">
                <i class="fas fa-folder w-4" style="color: var(--color-text-muted);"></i>
                <span class="flex-1" style="color: var(--color-text);">${m}</span>
            </button>`).join('');

        const customHtml = carpetasCustom().filter((c) => filtro(c.nombre)).map((c) => `
            <button type="button" data-carpeta-tipo="custom" data-carpeta-id="${c.id}" data-carpeta-etiqueta="${c.nombre}"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left">
                <i class="fas fa-folder-open w-4" style="color: var(--color-accent);"></i>
                <span class="flex-1" style="color: var(--color-text);">${c.nombre}</span>
            </button>`).join('');

        panel.innerHTML = `
            <div class="p-3" style="border-bottom: 1px solid var(--color-border);">
                <div class="relative">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style="color: var(--color-text-muted);"></i>
                    <input id="buscarCarpeta" type="text" placeholder="Carpeta de búsqueda" value="${textoBusquedaCarpeta}"
                        class="input-brand w-full pl-8 pr-3 py-1.5 text-sm">
                </div>
            </div>
            <div class="py-2 max-h-72 overflow-y-auto custom-scrollbar">
                ${accesosHtml}
                <div class="my-2" style="border-top: 1px solid var(--color-border);"></div>
                ${modulosHtml}
                ${customHtml ? `<div class="my-2" style="border-top: 1px solid var(--color-border);"></div>${customHtml}` : ''}
            </div>
            <div class="py-2" style="border-top: 1px solid var(--color-border);">
                <button type="button" id="btnAdministrarCarpetas" class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left">
                    <i class="fas fa-gear w-4" style="color: var(--color-text-muted);"></i>
                    <span style="color: var(--color-text);">Administrar Carpetas</span>
                </button>
                <button type="button" id="btnAnaliticaAvanzada" class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 text-left">
                    <i class="fas fa-chart-line w-4" style="color: var(--color-primary);"></i>
                    <span style="color: var(--color-primary);">Analítica avanzada UCLA</span>
                </button>
            </div>
        `;
    }

    function pintarTabla(container) {
        const lista = informesFiltrados();
        const favs = UCLA.state.getFavoritos();
        const tbody = container.querySelector('#filasInformes');
        const vacio = container.querySelector('#estadoVacioInformes');

        vacio.classList.toggle('hidden', lista.length > 0);
        tbody.closest('table').classList.toggle('hidden', lista.length === 0);

        tbody.innerHTML = lista.map((inf, idx) => `
            <tr class="${idx % 2 === 1 ? '' : ''} hover:bg-brand-50 transition-colors" style="${idx % 2 === 1 ? 'background: var(--color-primary-50);' : ''} border-bottom: 1px solid var(--color-border);">
                <td class="px-4 py-3"><input type="checkbox"></td>
                <td class="px-2 py-3">
                    <button data-fav="${inf.id}" class="text-lg leading-none">
                        <i class="${favs.includes(inf.id) ? 'fas' : 'far'} fa-star" style="color: ${favs.includes(inf.id) ? 'var(--color-accent)' : 'var(--color-neutral)'};"></i>
                    </button>
                </td>
                <td class="px-4 py-3">
                    <a href="#/informes/${inf.id}" class="text-sm font-medium hover:underline" style="color: var(--color-primary);">${inf.nombre}</a>
                </td>
                <td class="px-4 py-3 text-sm" style="color: var(--color-text-muted);">${inf.descripcion}</td>
                <td class="px-4 py-3 text-sm" style="color: var(--color-text);">${inf.carpeta}</td>
                <td class="px-4 py-3 text-sm" style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(inf.ultimaModificacion)}</td>
            </tr>
        `).join('');
    }

    function pintarCarpetasCustom(container) {
        const lista = carpetasCustom();
        const cont = container.querySelector('#listaCarpetasCustom');
        cont.innerHTML = lista.length
            ? lista.map((c) => `
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background: var(--color-primary-50);">
                    <i class="fas fa-folder-open" style="color: var(--color-accent);"></i>
                    <span class="flex-1 text-sm" style="color: var(--color-text);">${c.nombre}</span>
                    <button data-renombrar-carpeta="${c.id}" title="Renombrar" style="color: var(--color-primary);"><i class="fas fa-pen text-xs"></i></button>
                    <button data-eliminar-carpeta="${c.id}" title="Eliminar" style="color: var(--color-danger);"><i class="fas fa-trash text-xs"></i></button>
                </div>`).join('')
            : `<p class="text-sm" style="color: var(--color-text-muted);">Aún no hay carpetas personalizadas.</p>`;
    }

    function bind(container) {
        const btnDropdown = container.querySelector('#btnCarpetaDropdown');
        const panel = container.querySelector('#panelCarpetas');

        btnDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            panelAbierto = !panelAbierto;
            if (panelAbierto && textoBusquedaCarpeta) { textoBusquedaCarpeta = ''; pintarCarpetaDropdown(container); }
            panel.classList.toggle('hidden', !panelAbierto);
            btnDropdown.style.borderColor = panelAbierto ? 'var(--color-primary)' : '';
        });
        document.addEventListener('click', () => {
            if (panelAbierto) {
                panelAbierto = false;
                textoBusquedaCarpeta = '';
                panel.classList.add('hidden');
                btnDropdown.style.borderColor = '';
            }
        });
        panel.addEventListener('click', (e) => e.stopPropagation());

        panel.addEventListener('input', (e) => {
            if (e.target.id === 'buscarCarpeta') {
                textoBusquedaCarpeta = e.target.value;
                pintarCarpetaDropdown(container);
                container.querySelector('#panelCarpetas').classList.remove('hidden');
                container.querySelector('#buscarCarpeta').focus();
            }
        });

        panel.addEventListener('click', (e) => {
            const opcion = e.target.closest('[data-carpeta-tipo]');
            if (opcion) {
                carpetaActiva = {
                    tipo: opcion.getAttribute('data-carpeta-tipo'),
                    id: opcion.getAttribute('data-carpeta-id'),
                    etiqueta: opcion.getAttribute('data-carpeta-etiqueta'),
                };
                panelAbierto = false;
                textoBusquedaCarpeta = '';
                panel.classList.add('hidden');
                pintarCarpetaDropdown(container);
                pintarTabla(container);
                return;
            }
            if (e.target.closest('#btnAdministrarCarpetas')) {
                panelAbierto = false;
                panel.classList.add('hidden');
                pintarCarpetasCustom(container);
                container.querySelector('#modalCarpetas').classList.remove('hidden');
            }
            if (e.target.closest('#btnAnaliticaAvanzada')) {
                UCLA.components.toast.show('Analítica avanzada UCLA - función simulada', 'info');
            }
        });

        container.querySelector('#buscarRegistros').addEventListener('input', UCLA.utils.debounce((e) => {
            textoBusquedaTabla = e.target.value;
            pintarTabla(container);
        }, 200));

        container.querySelector('#filasInformes').addEventListener('click', (e) => {
            const btnFav = e.target.closest('[data-fav]');
            if (btnFav) {
                UCLA.state.toggleFavorito(btnFav.getAttribute('data-fav'));
                pintarTabla(container);
            }
        });

        const modal = container.querySelector('#modalCarpetas');
        modal.querySelectorAll('[data-cerrar-modal-carpetas]').forEach((el) => {
            el.addEventListener('click', () => modal.classList.add('hidden'));
        });
        container.querySelector('#btnCrearCarpeta').addEventListener('click', () => {
            const input = container.querySelector('#nombreCarpetaNueva');
            if (!input.value.trim()) return;
            UCLA.state.crearCarpeta(input.value.trim());
            input.value = '';
            pintarCarpetasCustom(container);
            pintarCarpetaDropdown(container);
        });
        modal.addEventListener('click', (e) => {
            const renombrar = e.target.closest('[data-renombrar-carpeta]');
            if (renombrar) {
                const nuevoNombre = prompt('Nuevo nombre de la carpeta:');
                if (nuevoNombre && nuevoNombre.trim()) {
                    UCLA.state.renombrarCarpeta(renombrar.getAttribute('data-renombrar-carpeta'), nuevoNombre.trim());
                    pintarCarpetasCustom(container);
                    pintarCarpetaDropdown(container);
                }
            }
            const eliminar = e.target.closest('[data-eliminar-carpeta]');
            if (eliminar) {
                UCLA.state.eliminarCarpeta(eliminar.getAttribute('data-eliminar-carpeta'));
                pintarCarpetasCustom(container);
                pintarCarpetaDropdown(container);
            }
        });
    }

    UCLA.views['informes'] = { render };
})();

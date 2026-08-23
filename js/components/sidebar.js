// Sidebar completo: sección Inicio, MÓDULOS (carpetas desplegables) y
// ADMINISTRACIÓN. El estado expandido/colapsado de cada carpeta persiste en
// localStorage vía UCLA.state.
(function () {
    const INICIO = [
        { ruta: 'inicio', icono: 'fa-house', etiqueta: 'Inicio' },
        { ruta: 'dashboard', icono: 'fa-gauge-high', etiqueta: 'Dashboard Gerencial' },
        { ruta: 'informes', icono: 'fa-file-lines', etiqueta: 'Informes' },
        { ruta: 'analisis', icono: 'fa-chart-pie', etiqueta: 'Análisis' },
        { ruta: 'asistente', icono: 'fa-robot', etiqueta: 'Asistente Virtual' },
    ];

    const MODULOS = [
        {
            id: 'crm', icono: 'fa-users', etiqueta: 'CRM', badge: 'Nuevo',
            items: [
                { ruta: 'crm/leads', etiqueta: 'Posibles Estudiantes' },
                { ruta: 'crm/contactos', etiqueta: 'Contactos' },
                { ruta: 'crm/cuentas', etiqueta: 'Cuentas' },
                { ruta: 'crm/oportunidades', etiqueta: 'Oportunidades' },
                { ruta: 'crm/previsiones', etiqueta: 'Previsiones de Matrícula' },
                { ruta: 'crm/documentos', etiqueta: 'Documentos' },
                { ruta: 'crm/campanas', etiqueta: 'Campañas de Mercadeo' },
            ],
        },
        {
            id: 'solicitudes', icono: 'fa-file-alt', etiqueta: 'Solicitudes',
            items: [
                { ruta: 'solicitudes/admision', etiqueta: 'Solicitudes de Admisión' },
                { ruta: 'solicitudes/becas', etiqueta: 'Becas o Descuentos' },
                { ruta: 'solicitudes/homologacion', etiqueta: 'Homologación' },
                { ruta: 'solicitudes/seguimiento', etiqueta: 'Seguimiento y Estados' },
            ],
        },
        {
            id: 'eventos', icono: 'fa-calendar-alt', etiqueta: 'Eventos',
            items: [
                { ruta: 'eventos/calendario', etiqueta: 'Calendario de Eventos' },
                { ruta: 'eventos/gestion', etiqueta: 'Crear y Editar Eventos' },
                { ruta: 'eventos/asistentes', etiqueta: 'Registro de Asistentes' },
                { ruta: 'eventos/cupos', etiqueta: 'Cupos y Lista de Espera' },
                { ruta: 'eventos/checkin', etiqueta: 'Check-in de Asistencia' },
                { ruta: 'eventos/encuestas', etiqueta: 'Encuestas de Satisfacción' },
                { ruta: 'eventos/reportes', etiqueta: 'Reportes de Participación' },
            ],
        },
        {
            id: 'egresados', icono: 'fa-user-graduate', etiqueta: 'Seguimiento a Egresados',
            items: [
                { ruta: 'egresados/base', etiqueta: 'Base de Datos' },
                { ruta: 'egresados/encuestas', etiqueta: 'Encuestas de Seguimiento' },
                { ruta: 'egresados/empleo', etiqueta: 'Bolsa de Empleo' },
                { ruta: 'egresados/comunidad', etiqueta: 'Comunidad de Egresados' },
                { ruta: 'egresados/indicadores', etiqueta: 'Indicadores de Empleabilidad' },
            ],
        },
        {
            id: 'actividades', icono: 'fa-list-check', etiqueta: 'Actividades',
            items: [
                { ruta: 'actividades/tareas', etiqueta: 'Tareas' },
                { ruta: 'actividades/reuniones', etiqueta: 'Reuniones' },
                { ruta: 'actividades/llamadas', etiqueta: 'Llamadas' },
                { ruta: 'actividades/recordatorios', etiqueta: 'Recordatorios' },
            ],
        },
        {
            id: 'financiero', icono: 'fa-dollar-sign', etiqueta: 'Financiero',
            items: [
                { ruta: 'financiero/facturacion', etiqueta: 'Facturación' },
                { ruta: 'financiero/pagos', etiqueta: 'Pagos y Matrículas' },
                { ruta: 'financiero/cartera', etiqueta: 'Cartera por Cobrar' },
                { ruta: 'financiero/becas', etiqueta: 'Becas y Descuentos' },
                { ruta: 'financiero/conciliacion', etiqueta: 'Conciliación de Pagos' },
            ],
        },
        {
            id: 'alianzas', icono: 'fa-handshake', etiqueta: 'Alianzas',
            items: [
                { ruta: 'alianzas/convenios', etiqueta: 'Convenios Institucionales' },
                { ruta: 'alianzas/empresas', etiqueta: 'Empresas Aliadas' },
                { ruta: 'alianzas/programas', etiqueta: 'Programas en Alianza' },
                { ruta: 'alianzas/seguimiento', etiqueta: 'Acuerdos y Vigencias' },
            ],
        },
        {
            id: 'certificados', icono: 'fa-certificate', etiqueta: 'Certificados', badge: 'ACREDITTA',
            items: [
                { ruta: 'certificados/emision', etiqueta: 'Emisión de Certificados' },
                { ruta: 'certificados/plantillas', etiqueta: 'Plantillas' },
                { ruta: 'certificados/verificacion', etiqueta: 'Verificación Pública' },
                { ruta: 'certificados/historial', etiqueta: 'Historial de Emitidos' },
            ],
        },
        {
            id: 'reportes', icono: 'fa-chart-bar', etiqueta: 'Reportes BI',
            items: [
                { ruta: 'reportes/tableros', etiqueta: 'Tableros por Sede' },
                { ruta: 'reportes/academicos', etiqueta: 'Matrícula y Graduación' },
                { ruta: 'reportes/financieros', etiqueta: 'Reportes Financieros' },
            ],
        },
        {
            id: 'inventario', icono: 'fa-boxes-stacked', etiqueta: 'Inventario',
            items: [
                { ruta: 'inventario/salones', etiqueta: 'Salones y Espacios' },
                { ruta: 'inventario/equipos', etiqueta: 'Equipos y Materiales' },
                { ruta: 'inventario/reservas', etiqueta: 'Reservas de Recursos' },
            ],
        },
    ];

    const INTEGRACIONES = { ruta: 'integraciones', icono: 'fa-plug', etiqueta: 'Integraciones' };

    const ADMIN = [
        { ruta: 'admin/usuarios', icono: 'fa-user-cog', etiqueta: 'Usuarios' },
        { ruta: 'admin/configuracion', icono: 'fa-cog', etiqueta: 'Configuración General' },
        { ruta: 'admin/auditoria', icono: 'fa-clipboard-list', etiqueta: 'Auditoría' },
        { ruta: 'admin/plantillas', icono: 'fa-envelope-open-text', etiqueta: 'Plantillas de Correo' },
    ];

    function esRutaActiva(ruta, rutaActual) {
        return ruta === rutaActual;
    }

    function linkHtml(item, rutaActual, indent) {
        const activo = esRutaActiva(item.ruta, rutaActual);
        return `
            <a href="#/${item.ruta}" data-ruta="${item.ruta}"
               class="sidebar-item flex items-center gap-3 ${indent ? 'pl-11 pr-4' : 'px-4'} py-2.5 text-sm rounded-lg mx-2 ${activo ? 'sidebar-item-active' : ''}">
                ${item.icono ? `<i class="fas ${item.icono} w-5"></i>` : ''}
                <span class="truncate">${item.etiqueta}</span>
            </a>`;
    }

    function folderHtml(folder, rutaActual) {
        const abierta = UCLA.state.isFolderOpen(folder.id) || folder.items.some((i) => i.ruta === rutaActual);
        return `
            <div class="sidebar-folder" data-folder="${folder.id}">
                <button type="button" data-toggle-folder="${folder.id}"
                        class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 sidebar-item" style="width: calc(100% - 1rem);">
                    <i class="fas ${folder.icono} w-5"></i>
                    <span class="flex-1 text-left truncate">${folder.etiqueta}</span>
                    ${folder.badge ? `<span class="text-[10px] px-2 py-0.5 rounded-full font-bold" style="background: var(--color-accent); color: #fff;">${folder.badge}</span>` : ''}
                    <i class="fas fa-chevron-down text-xs transition-transform duration-200" style="${abierta ? 'transform: rotate(180deg);' : ''}"></i>
                </button>
                <div class="sidebar-subitems ${abierta ? '' : 'hidden'}">
                    ${folder.items.map((i) => linkHtml(i, rutaActual, true)).join('')}
                </div>
            </div>`;
    }

    function html(rutaActual) {
        return `
            <div class="p-6" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: var(--color-accent);">
                        <i class="fas fa-graduation-cap text-white"></i>
                    </div>
                    <div>
                        <h1 class="font-bold text-lg leading-tight text-white">UCLA Extensión</h1>
                        <p class="text-xs" style="color: rgba(255,255,255,0.55);">CRM Sistema</p>
                    </div>
                </div>
            </div>

            <nav class="flex-1 overflow-y-auto custom-scrollbar py-4">
                <div class="px-4 mb-2 text-xs font-semibold uppercase tracking-wider" style="color: rgba(255,255,255,0.45);">Inicio</div>
                ${INICIO.map((i) => linkHtml(i, rutaActual, false)).join('')}

                <div class="px-4 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider" style="color: rgba(255,255,255,0.45);">Módulos</div>
                ${MODULOS.map((f) => folderHtml(f, rutaActual)).join('')}
                ${linkHtml(INTEGRACIONES, rutaActual, false)}

                <div class="px-4 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider" style="color: rgba(255,255,255,0.45);">Administración</div>
                ${UCLA.state.isAdmin() ? ADMIN.map((i) => linkHtml(i, rutaActual, false)).join('') : '<p class="px-4 text-xs" style="color: rgba(255,255,255,0.35);">Sin acceso para su rol</p>'}
            </nav>

            <div class="p-4" style="border-top: 1px solid rgba(255,255,255,0.1);">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(UCLA.state.usuarioActual.nombre)}&background=1C7FA8&color=F5821F" class="w-10 h-10 rounded-full">
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style="background: var(--color-success); border-color: var(--color-primary-dark);"></span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate">${UCLA.state.usuarioActual.nombre}</p>
                        <p class="text-xs truncate" style="color: rgba(255,255,255,0.55);">${UCLA.state.usuarioActual.correo}</p>
                    </div>
                    <button onclick="logout()" title="Cerrar sesión" style="color: rgba(255,255,255,0.55);" class="hover:text-white transition-colors">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
                <p class="text-[10px] text-center mt-3" style="color: rgba(255,255,255,0.35);">© 2026 Todos los derechos reservados. S.R.C</p>
            </div>`;
    }

    function bind(container) {
        container.querySelectorAll('[data-toggle-folder]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const folderId = btn.getAttribute('data-toggle-folder');
                const abierta = UCLA.state.toggleFolder(folderId);
                const subitems = btn.parentElement.querySelector('.sidebar-subitems');
                const chevron = btn.querySelector('.fa-chevron-down');
                subitems.classList.toggle('hidden', !abierta);
                chevron.style.transform = abierta ? 'rotate(180deg)' : '';
            });
        });
        // En móvil/tablet el sidebar es un panel superpuesto (off-canvas): al
        // navegar a una ruta se cierra solo para no tapar el contenido. En
        // escritorio (lg+) esta clase queda anulada por lg:translate-x-0.
        container.querySelectorAll('a[href^="#/"]').forEach((a) => a.addEventListener('click', cerrarMovil));
    }

    // ---------- Off-canvas móvil ----------
    function abrirMovil() {
        document.getElementById('sidebar')?.classList.remove('-translate-x-full');
        document.getElementById('sidebarBackdrop')?.classList.remove('hidden');
    }

    function cerrarMovil() {
        document.getElementById('sidebar')?.classList.add('-translate-x-full');
        document.getElementById('sidebarBackdrop')?.classList.add('hidden');
    }

    function toggleMovil() {
        const abierto = document.getElementById('sidebar') && !document.getElementById('sidebar').classList.contains('-translate-x-full');
        if (abierto) cerrarMovil(); else abrirMovil();
    }

    function render(container) {
        if (!container) return;
        container.innerHTML = html(UCLA.router.rutaActual());
        bind(container);
        document.getElementById('sidebarBackdrop')?.addEventListener('click', cerrarMovil);
    }

    function setActive(ruta) {
        const container = document.getElementById('sidebar');
        if (!container) return;
        container.querySelectorAll('[data-ruta]').forEach((a) => {
            a.classList.toggle('sidebar-item-active', a.getAttribute('data-ruta') === ruta);
        });
        // Expande automáticamente la carpeta que contiene la ruta activa
        const activo = container.querySelector(`[data-ruta="${ruta}"]`);
        const folder = activo && activo.closest('.sidebar-folder');
        if (folder) {
            const subitems = folder.querySelector('.sidebar-subitems');
            const chevron = folder.querySelector('.fa-chevron-down');
            subitems.classList.remove('hidden');
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
    }

    UCLA.components.sidebar = { render, setActive, abrirMovil, cerrarMovil, toggleMovil };
})();

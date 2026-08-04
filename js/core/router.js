// Router por hash. Lee la ruta actual (#/modulo/submodulo), busca una vista
// registrada en UCLA.views y la monta en #contentArea. Las rutas sin vista
// propia todavía muestran el placeholder "Módulo en construcción".
(function () {
    // Título de página para cada ruta conocida de la especificación completa,
    // aunque en esta fase la mayoría todavía no tiene vista implementada.
    const TITULOS = {
        'inicio': 'Inicio',
        'dashboard': 'Dashboard Gerencial',
        'informes': 'Informes',
        'analisis': 'Análisis',
        'asistente': 'Asistente Virtual',

        'crm/leads': 'Posibles Estudiantes',
        'crm/contactos': 'Contactos',
        'crm/cuentas': 'Cuentas',
        'crm/oportunidades': 'Oportunidades de Matrícula',
        'crm/previsiones': 'Previsiones de Matrícula',
        'crm/documentos': 'Documentos',
        'crm/campanas': 'Campañas de Mercadeo',

        'solicitudes/admision': 'Solicitudes de Admisión',
        'solicitudes/becas': 'Solicitudes de Becas o Descuentos',
        'solicitudes/homologacion': 'Solicitudes de Homologación',
        'solicitudes/seguimiento': 'Solicitudes y Propuestas',

        'eventos/calendario': 'Calendario de Eventos',
        'eventos/gestion': 'Gestión de Eventos',
        'eventos/asistentes': 'Registro de Asistentes',
        'eventos/cupos': 'Control de Cupos y Lista de Espera',
        'eventos/checkin': 'Check-in de Asistencia',
        'eventos/encuestas': 'Encuestas de Satisfacción',
        'eventos/reportes': 'Reportes de Participación',

        'egresados/base': 'Base de Datos de Egresados',
        'egresados/encuestas': 'Encuestas de Seguimiento',
        'egresados/empleo': 'Bolsa de Empleo',
        'egresados/comunidad': 'Comunidad de Egresados',
        'egresados/indicadores': 'Indicadores de Empleabilidad',

        'actividades/tareas': 'Tareas',
        'actividades/reuniones': 'Reuniones',
        'actividades/llamadas': 'Llamadas',
        'actividades/recordatorios': 'Recordatorios y Notificaciones',

        'financiero/facturacion': 'Control Financiero',
        'financiero/pagos': 'Pagos y Matrículas',
        'financiero/cartera': 'Cartera y Cuentas por Cobrar',
        'financiero/becas': 'Becas y Descuentos Aplicados',
        'financiero/conciliacion': 'Conciliación de Pagos',

        'alianzas/convenios': 'Convenios Institucionales',
        'alianzas/empresas': 'Empresas Aliadas',
        'alianzas/programas': 'Programas en Alianza',
        'alianzas/seguimiento': 'Seguimiento de Acuerdos y Vigencias',

        'certificados/emision': 'Certificados e Insignias',
        'certificados/plantillas': 'Plantillas de Certificados',
        'certificados/verificacion': 'Verificación Pública',
        'certificados/historial': 'Historial de Emitidos',

        'reportes/tableros': 'Reportes y BI',
        'reportes/academicos': 'Reportes Académicos',
        'reportes/financieros': 'Reportes Financieros',

        'inventario/salones': 'Salones y Espacios',
        'inventario/equipos': 'Equipos y Materiales',
        'inventario/reservas': 'Reservas de Recursos',

        'integraciones': 'Integraciones',

        'admin/usuarios': 'Administración de Usuarios',
        'admin/configuracion': 'Configuración del Sistema',
        'admin/auditoria': 'Auditoría y Registros de Actividad',
        'admin/plantillas': 'Plantillas de Correo y Comunicaciones',
    };

    const RUTA_POR_DEFECTO = 'dashboard';

    function rutaActual() {
        const hash = location.hash || '';
        const ruta = hash.replace(/^#\/?/, '').replace(/\/$/, '');
        return ruta || RUTA_POR_DEFECTO;
    }

    // Busca una vista para `ruta`: primero match exacto en UCLA.views, luego
    // rutas registradas con parámetro (p. ej. 'informes/:id'). Devuelve
    // { vista, params } o null si ninguna registrada coincide.
    function matchRoute(ruta) {
        if (UCLA.views[ruta]) return { vista: UCLA.views[ruta], params: { ruta } };

        const segmentosRuta = ruta.split('/');
        for (const clave of Object.keys(UCLA.views)) {
            if (clave.indexOf(':') === -1) continue;
            const segmentosClave = clave.split('/');
            if (segmentosClave.length !== segmentosRuta.length) continue;

            const params = { ruta };
            const coincide = segmentosClave.every((seg, i) => {
                if (seg.charAt(0) === ':') {
                    params[seg.slice(1)] = segmentosRuta[i];
                    return true;
                }
                return seg === segmentosRuta[i];
            });
            if (coincide) return { vista: UCLA.views[clave], params };
        }
        return null;
    }

    function render(ruta) {
        const contenedor = document.getElementById('contentArea');
        if (!contenedor) return;

        const match = matchRoute(ruta);
        const titulo = TITULOS[ruta] || 'Módulo en construcción';

        // El título se fija ANTES de renderizar la vista: así, si la vista
        // necesita un título más específico (p. ej. informeDetalle.js con el
        // nombre real del informe), su propia asignación queda como la última
        // y no se pisa después.
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titulo;
        document.title = titulo + ' · UCLA Extensión CRM';

        contenedor.innerHTML = '';
        if (match && typeof match.vista.render === 'function') {
            match.vista.render(contenedor, match.params);
        } else {
            UCLA.components.placeholder.render(contenedor, { titulo, ruta });
        }

        if (UCLA.components.sidebar) UCLA.components.sidebar.setActive(ruta);
    }

    function navigate(ruta) {
        location.hash = '#/' + ruta;
    }

    function start() {
        render(rutaActual());
        window.addEventListener('hashchange', () => render(rutaActual()));
    }

    UCLA.router = { start, navigate, rutaActual, matchRoute, TITULOS };
})();

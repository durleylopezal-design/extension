// Campañas de Mercadeo — módulo real de crm/campanas.js (antes solo mostraba
// emptyState.bienvenida()). Relaciones con otros arreglos (sin duplicar datos,
// mismo criterio que solicitudesBecas.js/alianzas.js):
//   - Campaña ↔ Segmentos: campo `segmentacion` (array simple embebido)
//   - Campaña ↔ Contactos: `contactosIds` referencia UCLA.data.contactos
//   - Campaña ↔ Clientes/Cuentas: `cuentasIds` referencia UCLA.data.cuentas
//   - Campaña ↔ Canales: campo `canales` (array simple embebido)
//   - Campaña ↔ Actividades: UCLA.data.tareas/reuniones/llamadas filtran por su propio `campanaId`
//   - Campaña ↔ Leads: UCLA.data.leads filtra por `campanaId` (agregado en leads.js)
//   - Campaña ↔ Oportunidades: UCLA.data.oportunidades filtra por `campanaId` (agregado en oportunidades.js)
//   - Campaña ↔ Productos/Servicios: `productos` referencia UCLA.data.productosServicios
//   - Campaña ↔ Contenidos: campo `contenidos` (lista simple embebida)
//   - Campaña ↔ Resultados/KPIs: sección "Resultados" de cada registro (ROI se calcula en vivo, no se guarda)
UCLA.data.productosServicios = ['Diplomados', 'Seminarios', 'Cursos cortos', 'Semilleros', 'Programas de idiomas'];

UCLA.data.campanas = UCLA.store.hidratar('campanas', [
    {
        id: 'camp-01', nombre: 'Feria Educativa Medellín 2026', descripcion: 'Campaña de captación en la feria educativa anual de Medellín.', tipo: 'Feria educativa', estado: 'Activa',
        objetivo: 'Captar 150 nuevos leads para programas de Ingeniería y Derecho.', publicoObjetivo: 'Bachilleres próximos a graduarse en colegios de Medellín', segmentacion: ['Bachilleres', 'Grado 11'], fechaInicio: '2026-07-01', fechaFin: '2026-08-31', responsable: 'Ana García', presupuesto: 15000000,
        canales: ['Presencial', 'Redes sociales'], contenido: 'Stand institucional + material impreso + activaciones en redes.', cta: 'Agenda tu asesoría gratuita', landingPage: 'https://ucla.edu.co/feria-2026', frecuencia: 'Única (evento)', contenidos: ['Video institucional', 'Brochure de programas', 'Historias en Instagram'],
        alcance: 12000, interacciones: 3400, leads: 180, leadsCalificados: 95, oportunidades: 40, ventas: 22, ingresos: 198000000, costos: 15000000,
        productos: ['Diplomados', 'Cursos cortos'], cuentasIds: [], contactosIds: [],
        usuarioCreador: 'Ana García', fechaCreacion: '2026-06-15', usuarioModificador: 'Ana García', fechaModificacion: '2026-07-20',
    },
    {
        id: 'camp-02', nombre: 'Email Marketing Egresados - Reentrenamiento', descripcion: 'Campaña de correo dirigida a egresados para promover diplomados de actualización.', tipo: 'Email marketing', estado: 'Completada',
        objetivo: 'Reactivar egresados inactivos con oferta de diplomados de actualización.', publicoObjetivo: 'Egresados con más de 3 años de graduados', segmentacion: ['Egresados', 'Sin actividad reciente'], fechaInicio: '2026-04-01', fechaFin: '2026-04-30', responsable: 'Carlos Pérez', presupuesto: 3000000,
        canales: ['Email', 'WhatsApp'], contenido: 'Secuencia de 3 correos + recordatorio por WhatsApp.', cta: 'Conoce los diplomados 2026', landingPage: 'https://ucla.edu.co/diplomados-egresados', frecuencia: 'Mensual', contenidos: ['Plantilla de correo #1', 'Plantilla de correo #2', 'Mensaje de WhatsApp'],
        alcance: 5200, interacciones: 890, leads: 60, leadsCalificados: 28, oportunidades: 10, ventas: 6, ingresos: 32000000, costos: 3000000,
        productos: ['Diplomados'], cuentasIds: [], contactosIds: [],
        usuarioCreador: 'Carlos Pérez', fechaCreacion: '2026-03-20', usuarioModificador: 'María López', fechaModificacion: '2026-05-02',
    },
    {
        id: 'camp-03', nombre: 'Convenios Corporativos - Capacitación Empresarial', descripcion: 'Campaña dirigida a empresas aliadas para ofrecer formación a la medida.', tipo: 'Referidos', estado: 'Planeada',
        objetivo: 'Cerrar 5 nuevos convenios de capacitación empresarial en el segundo semestre.', publicoObjetivo: 'Empresas medianas y grandes del sector servicios', segmentacion: ['Empresas aliadas', 'Sector servicios'], fechaInicio: '2026-09-01', fechaFin: '', responsable: 'María López', presupuesto: 8000000,
        canales: ['Visitas comerciales', 'LinkedIn'], contenido: 'Propuesta comercial personalizada por cuenta.', cta: 'Solicita una propuesta a la medida', landingPage: '', frecuencia: 'Continua', contenidos: ['Propuesta comercial tipo', 'Portafolio de servicios'],
        alcance: 0, interacciones: 0, leads: 0, leadsCalificados: 0, oportunidades: 0, ventas: 0, ingresos: 0, costos: 0,
        productos: ['Seminarios', 'Cursos cortos'], cuentasIds: ['cta-01'], contactosIds: ['con-01'],
        usuarioCreador: 'María López', fechaCreacion: '2026-07-28', usuarioModificador: 'María López', fechaModificacion: '2026-07-28',
    },
]);

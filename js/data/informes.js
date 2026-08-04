// Carpetas fijas por módulo (orden exacto de la especificación) e informes de ejemplo.
UCLA.data.carpetasModulo = [
    'Posibles estudiantes',
    'Campañas',
    'Solicitudes',
    'Contactos y Cuentas',
    'Eventos',
    'Seguimiento a egresados',
    'Financiero',
    'Alianzas',
    'Certificados',
    'Correo electrónico',
    'Reuniones',
];

UCLA.data.informes = [
    { id: 'inf-01', nombre: 'Matrículas confirmadas por sede este mes', descripcion: 'Total de matrículas confirmadas, desglosadas por las cinco sedes.', carpeta: 'Solicitudes', favorito: false, ultimaModificacion: '2026-07-28', tipoGrafico: 'barra', modulo: 'Solicitudes' },
    { id: 'inf-02', nombre: 'Egresados con empleo dentro de los primeros seis meses', descripcion: 'Porcentaje de egresados vinculados laboralmente antes de cumplir 6 meses de grado.', carpeta: 'Seguimiento a egresados', favorito: true, ultimaModificacion: '2026-07-25', tipoGrafico: 'dona', modulo: 'Seguimiento a egresados' },
    { id: 'inf-03', nombre: 'Eventos con mayor tasa de asistencia', descripcion: 'Ranking de eventos por porcentaje de asistentes confirmados frente a inscritos.', carpeta: 'Eventos', favorito: false, ultimaModificacion: '2026-07-30', tipoGrafico: 'barra', modulo: 'Eventos' },
    { id: 'inf-04', nombre: 'Ingresos por programa académico', descripcion: 'Distribución de ingresos acumulados del periodo por programa.', carpeta: 'Financiero', favorito: true, ultimaModificacion: '2026-08-01', tipoGrafico: 'linea', modulo: 'Financiero' },
    { id: 'inf-05', nombre: 'Efectividad de campañas de captación', descripcion: 'Tasa de conversión de posibles estudiantes generados por cada campaña activa.', carpeta: 'Campañas', favorito: false, ultimaModificacion: '2026-07-22', tipoGrafico: 'dona', modulo: 'Campañas' },
    { id: 'inf-06', nombre: 'Convenios activos por vencer este trimestre', descripcion: 'Alianzas institucionales con fecha de vencimiento dentro de los próximos 90 días.', carpeta: 'Alianzas', favorito: false, ultimaModificacion: '2026-07-27', tipoGrafico: 'barra', modulo: 'Alianzas' },

    { id: 'inf-07', nombre: 'Posibles estudiantes por fuente de origen', descripcion: 'Volumen de posibles estudiantes captados por canal (redes, feria, referido, web).', carpeta: 'Posibles estudiantes', favorito: false, ultimaModificacion: '2026-07-29', tipoGrafico: 'dona', modulo: 'CRM' },
    { id: 'inf-08', nombre: 'Posibles estudiantes calificados vs. no calificados', descripcion: 'Comparación mensual de calificación de leads por el equipo de asesores.', carpeta: 'Posibles estudiantes', favorito: false, ultimaModificacion: '2026-07-18', tipoGrafico: 'barra', modulo: 'CRM' },
    { id: 'inf-09', nombre: 'Cuentas aliadas activas por sector', descripcion: 'Distribución de empresas e instituciones aliadas según sector económico.', carpeta: 'Contactos y Cuentas', favorito: false, ultimaModificacion: '2026-07-15', tipoGrafico: 'dona', modulo: 'CRM' },
    { id: 'inf-10', nombre: 'Contactos sin actividad reciente', descripcion: 'Contactos sin llamadas, reuniones ni correos en los últimos 30 días.', carpeta: 'Contactos y Cuentas', favorito: false, ultimaModificacion: '2026-07-12', tipoGrafico: 'barra', modulo: 'CRM' },
    { id: 'inf-11', nombre: 'Solicitudes por etapa del flujo de aprobación', descripcion: 'Distribución de solicitudes activas según su etapa de Vo.Bo. actual.', carpeta: 'Solicitudes', favorito: false, ultimaModificacion: '2026-07-31', tipoGrafico: 'dona', modulo: 'Solicitudes' },
    { id: 'inf-12', nombre: 'Tiempo promedio de respuesta a solicitudes', descripcion: 'Días promedio entre radicación y primera respuesta, por sede.', carpeta: 'Solicitudes', favorito: false, ultimaModificacion: '2026-07-20', tipoGrafico: 'linea', modulo: 'Solicitudes' },
    { id: 'inf-13', nombre: 'Ocupación de cupos por evento', descripcion: 'Porcentaje de cupo utilizado frente al máximo permitido por segmento.', carpeta: 'Eventos', favorito: false, ultimaModificacion: '2026-07-26', tipoGrafico: 'barra', modulo: 'Eventos' },
    { id: 'inf-14', nombre: 'Satisfacción promedio post-evento', descripcion: 'Calificación promedio de las encuestas de satisfacción por tipo de evento.', carpeta: 'Eventos', favorito: false, ultimaModificacion: '2026-07-19', tipoGrafico: 'linea', modulo: 'Eventos' },
    { id: 'inf-15', nombre: 'Egresados por cohorte y programa', descripcion: 'Distribución de egresados registrados en la comunidad, por cohorte.', carpeta: 'Seguimiento a egresados', favorito: false, ultimaModificacion: '2026-07-10', tipoGrafico: 'barra', modulo: 'Seguimiento a egresados' },
    { id: 'inf-16', nombre: 'Cartera pendiente por vencer', descripcion: 'Facturas pendientes de pago agrupadas por antigüedad de la cartera.', carpeta: 'Financiero', favorito: false, ultimaModificacion: '2026-08-02', tipoGrafico: 'barra', modulo: 'Financiero' },
    { id: 'inf-17', nombre: 'Becas y descuentos aplicados por sede', descripcion: 'Monto total de becas y descuentos otorgados, comparado entre sedes.', carpeta: 'Financiero', favorito: false, ultimaModificacion: '2026-07-14', tipoGrafico: 'dona', modulo: 'Financiero' },
    { id: 'inf-18', nombre: 'Certificados emitidos vía ACREDITTA', descripcion: 'Volumen de insignias digitales emitidas y tasa de éxito de la integración.', carpeta: 'Certificados', favorito: false, ultimaModificacion: '2026-07-30', tipoGrafico: 'linea', modulo: 'Certificados' },
    { id: 'inf-19', nombre: 'Aperturas y clics de campañas de correo', descripcion: 'Tasa de apertura y clic de las comunicaciones enviadas desde el CRM.', carpeta: 'Correo electrónico', favorito: false, ultimaModificacion: '2026-07-21', tipoGrafico: 'linea', modulo: 'Correo electrónico' },
    { id: 'inf-20', nombre: 'Reuniones agendadas por asesor', descripcion: 'Cantidad de reuniones programadas y completadas por cada asesor comercial.', carpeta: 'Reuniones', favorito: false, ultimaModificacion: '2026-07-24', tipoGrafico: 'barra', modulo: 'Reuniones' },
];

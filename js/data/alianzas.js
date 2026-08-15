// Alianzas — convenios institucionales, programas ofrecidos en alianza e
// interacciones. cuentaId referencia UCLA.data.cuentas (misma fuente que CRM ·
// Cuentas: las empresas/entidades aliadas no se duplican en un arreglo aparte).
// El estado de cada convenio (Vigente/Por vencer/Vencido) se calcula en las
// vistas a partir de fechaFin, no se guarda aquí.
UCLA.data.convenios = [
    { id: 'conv-01', cuentaId: 'cta-01', nombre: 'Convenio de prácticas profesionales y capacitación empresarial', tipo: 'Prácticas', fechaInicio: '2024-03-01', fechaFin: '2026-09-15', responsable: 'Ana García', beneficio: 'Descuento del 15% en diplomados para empleados de la empresa' },
    { id: 'conv-02', cuentaId: 'cta-02', nombre: 'Convenio de formación complementaria SENA-UCLA', tipo: 'Formación complementaria', fechaInicio: '2023-01-15', fechaFin: '2027-01-15', responsable: 'María López', beneficio: 'Cupos preferenciales en diplomados técnicos' },
    { id: 'conv-03', cuentaId: 'cta-03', nombre: 'Convenio de bienestar y educación continua', tipo: 'Descuento matrícula', fechaInicio: '2024-02-01', fechaFin: '2026-08-30', responsable: 'Carlos Pérez', beneficio: 'Descuento del 10% en programas de Extensión para colaboradores' },
    { id: 'conv-04', cuentaId: 'cta-04', nombre: 'Convenio de patrocinio Semillero de Innovación Financiera', tipo: 'Patrocinio', fechaInicio: '2022-06-01', fechaFin: '2026-12-20', responsable: 'Ana García', beneficio: 'Financiación de becas parciales para el semillero' },
    { id: 'conv-05', cuentaId: 'cta-05', nombre: 'Convenio de capacitación técnica en sostenibilidad', tipo: 'Capacitación', fechaInicio: '2021-05-01', fechaFin: '2026-08-25', responsable: 'Juan Martínez', beneficio: 'Cupos gratuitos en cursos de sostenibilidad energética' },
    { id: 'conv-06', cuentaId: 'cta-06', nombre: 'Convenio de fortalecimiento institucional', tipo: 'Cooperación', fechaInicio: '2024-04-10', fechaFin: '2026-10-10', responsable: 'Carlos Pérez', beneficio: 'Programas de formación para funcionarios públicos' },
    { id: 'conv-07', cuentaId: 'cta-07', nombre: 'Convenio de articulación con la media técnica', tipo: 'Articulación', fechaInicio: '2024-01-20', fechaFin: '2026-11-30', responsable: 'María López', beneficio: 'Semilleros y visitas guiadas para estudiantes de grado 10° y 11°' },
    { id: 'conv-08', cuentaId: 'cta-09', nombre: 'Convenio de emprendimiento y empleabilidad', tipo: 'Empleabilidad', fechaInicio: '2023-03-01', fechaFin: '2026-07-31', responsable: 'Juan Martínez', beneficio: 'Bolsa de empleo compartida y ruedas de negocio' },
    { id: 'conv-09', cuentaId: 'cta-12', nombre: 'Convenio de bienestar deportivo', tipo: 'Bienestar', fechaInicio: '2023-08-04', fechaFin: '2026-08-04', responsable: 'Ana García', beneficio: 'Tarifa preferencial para estudiantes y egresados' },
    { id: 'conv-10', cuentaId: 'cta-15', nombre: 'Convenio de formación para afiliados', tipo: 'Formación complementaria', fechaInicio: '2022-01-01', fechaFin: '2026-12-31', responsable: 'María López', beneficio: 'Descuentos en diplomados para afiliados a la caja de compensación' },
];

UCLA.data.programasAlianza = [
    { id: 'pa-01', cuentaId: 'cta-01', convenioId: 'conv-01', nombre: 'Diplomado en Transformación Digital', modalidad: 'Virtual', cupoMaximo: 30, inscritos: 22, fechaInicio: '2026-09-01', estado: 'Activo' },
    { id: 'pa-02', cuentaId: 'cta-02', convenioId: 'conv-02', nombre: 'Curso Técnico en Gestión de Proyectos', modalidad: 'Presencial', cupoMaximo: 35, inscritos: 35, fechaInicio: '2026-08-10', estado: 'Activo' },
    { id: 'pa-03', cuentaId: 'cta-03', convenioId: 'conv-03', nombre: 'Diplomado en Liderazgo Comercial', modalidad: 'Híbrido', cupoMaximo: 25, inscritos: 14, fechaInicio: '2026-09-20', estado: 'Programado' },
    { id: 'pa-04', cuentaId: 'cta-04', convenioId: 'conv-04', nombre: 'Semillero de Innovación Financiera', modalidad: 'Presencial', cupoMaximo: 20, inscritos: 18, fechaInicio: '2026-08-18', estado: 'Activo' },
    { id: 'pa-05', cuentaId: 'cta-05', convenioId: 'conv-05', nombre: 'Curso de Sostenibilidad Energética', modalidad: 'Virtual', cupoMaximo: 40, inscritos: 9, fechaInicio: '2026-10-05', estado: 'Programado' },
    { id: 'pa-06', cuentaId: 'cta-07', convenioId: 'conv-07', nombre: 'Semillero de Ciencias para Media Técnica', modalidad: 'Presencial', cupoMaximo: 30, inscritos: 30, fechaInicio: '2026-04-04', estado: 'Finalizado' },
    { id: 'pa-07', cuentaId: 'cta-09', convenioId: 'conv-08', nombre: 'Rueda de Negocios y Empleabilidad 2026', modalidad: 'Presencial', cupoMaximo: 50, inscritos: 47, fechaInicio: '2026-08-28', estado: 'Activo' },
    { id: 'pa-08', cuentaId: 'cta-15', convenioId: 'conv-10', nombre: 'Diplomado en Bienestar Organizacional', modalidad: 'Virtual', cupoMaximo: 30, inscritos: 6, fechaInicio: '2026-11-01', estado: 'Programado' },
];

UCLA.data.interaccionesAlianza = UCLA.store.hidratar('interaccionesAlianza', [
    { id: 'ia-01', cuentaId: 'cta-01', tipo: 'correo', fecha: '2026-07-10', titulo: 'Propuesta de renovación anticipada', detalle: 'Se envió propuesta de renovación con nuevas condiciones de descuento.' },
    { id: 'ia-02', cuentaId: 'cta-01', tipo: 'llamada', fecha: '2026-06-15', titulo: 'Seguimiento semestral del convenio', detalle: 'Revisión de cupos utilizados y satisfacción de los empleados inscritos.' },
    { id: 'ia-03', cuentaId: 'cta-02', tipo: 'evento', fecha: '2026-05-20', titulo: 'Participación en feria de formación técnica', detalle: 'SENA participó como aliado en la feria de programas técnicos.' },
    { id: 'ia-04', cuentaId: 'cta-03', tipo: 'correo', fecha: '2026-07-25', titulo: 'Alerta de vencimiento próximo', detalle: 'Se notificó al responsable la proximidad del vencimiento del convenio.' },
    { id: 'ia-05', cuentaId: 'cta-04', tipo: 'llamada', fecha: '2026-06-30', titulo: 'Coordinación de becas del semillero', detalle: 'Definición del número de becas parciales para el próximo semestre.' },
    { id: 'ia-06', cuentaId: 'cta-05', tipo: 'correo', fecha: '2026-07-28', titulo: 'Alerta de vencimiento próximo', detalle: 'Convenio próximo a vencer, pendiente de gestión de renovación.' },
    { id: 'ia-07', cuentaId: 'cta-07', tipo: 'evento', fecha: '2026-04-04', titulo: 'Cierre del semillero de ciencias', detalle: 'Ceremonia de cierre con entrega de reconocimientos a estudiantes.' },
    { id: 'ia-08', cuentaId: 'cta-09', tipo: 'llamada', fecha: '2026-07-15', titulo: 'Planeación de rueda de negocios', detalle: 'Definición de agenda y empresas invitadas para la rueda de negocios.' },
]);

// Solicitudes de Formación radicadas por empresas/entidades externas desde el
// modal "Nueva Solicitud de Formación" (carpeta de Área "Extensión" en
// Informes, js/views/informes.js). Mismo shape que solicitudesAdmision.js /
// solicitudesBecas.js (radicado, estado, fecha) para reutilizar
// UCLA.utils.colorEstado()/badgeEstado() sin código nuevo.
UCLA.data.solicitudesFormacion = [
    { id: 'sf-01', radicado: 'SF-2026-014', entidad: 'Constructora Bolívar S.A.S.', nit: '900.123.456-7', contacto: 'Laura Gómez', cargo: 'Gerente de Talento Humano', correo: 'laura.gomez@constructorabolivar.com', telefono: '3011234567', objetivo: 'Capacitar al equipo comercial en negociación y cierre de ventas.', sedeId: 'MDE', facultadId: 'fac-economicas', estado: 'En revisión', fechaRadicado: '2026-07-15', documentos: [] },
    { id: 'sf-02', radicado: 'SF-2026-009', entidad: 'Alcaldía de Manizales', nit: '890.901.234-1', contacto: 'Jorge Iván Castaño', cargo: 'Secretario de Gobierno', correo: 'jicastano@manizales.gov.co', telefono: '3126543210', objetivo: 'Diplomado en gestión pública para funcionarios de la Secretaría.', sedeId: 'MZL', facultadId: 'fac-derecho', estado: 'Aprobada', fechaRadicado: '2026-06-02', documentos: [{ nombre: 'propuesta-tecnica.pdf', estado: 'Cargado' }] },
    { id: 'sf-03', radicado: 'SF-2026-021', entidad: 'Clínica del Norte', nit: '811.222.333-9', contacto: 'Sandra Milena Ruiz', cargo: 'Directora de Enfermería', correo: 'sruiz@clinicadelnorte.com', telefono: '3145557788', objetivo: 'Actualización en protocolos de bioseguridad para personal asistencial.', sedeId: 'BOG', facultadId: 'fac-salud', estado: 'Rechazada', fechaRadicado: '2026-05-20', documentos: [] },
];

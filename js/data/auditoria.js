// Admin · Auditoría — bitácora de acciones del sistema. Los flujos de
// aprobación reales (solicitudes/admision, solicitudes/becas) agregan
// entradas nuevas en vivo vía UCLA.utils.registrarAuditoria(); estas son solo
// el historial semilla.
UCLA.data.registrosAuditoria = [
    { id: 'aud-01', fecha: '2026-08-01T09:15', usuario: 'Coord. Sede Medellín', accion: 'Aprobó solicitud de admisión', modulo: 'Solicitudes', detalle: 'Radicado ADM-2026-0138 - contacto creado en CRM' },
    { id: 'aud-02', fecha: '2026-07-30T14:22', usuario: 'Coord. Sede Medellín', accion: 'Aprobó solicitud de beca', modulo: 'Solicitudes', detalle: 'Beca al 20% - visible en Financiero › Becas' },
    { id: 'aud-03', fecha: '2026-07-29T11:05', usuario: 'María López', accion: 'Renovó convenio institucional', modulo: 'Alianzas', detalle: 'Convenio de capacitación técnica en sostenibilidad - nueva vigencia' },
    { id: 'aud-04', fecha: '2026-07-28T16:40', usuario: 'Coord. Sede Medellín', accion: 'Conciliar movimiento bancario', modulo: 'Financiero', detalle: 'TRX-88213 vinculado a REC-2026-3301' },
    { id: 'aud-05', fecha: '2026-07-27T08:50', usuario: 'Carlos Pérez', accion: 'Revocó certificado emitido', modulo: 'Certificados', detalle: 'UCLA-SML0033-0002 - revocado por solicitud del participante' },
    { id: 'aud-06', fecha: '2026-07-25T10:30', usuario: 'Juan Martínez', accion: 'Creó regla automática', modulo: 'Actividades', detalle: 'Regla "Convenio próximo a vencer" activada' },
    { id: 'aud-07', fecha: '2026-07-22T13:15', usuario: 'Coord. Sede Medellín', accion: 'Rechazó solicitud de homologación', modulo: 'Solicitudes', detalle: 'Créditos insuficientes según acta de comité' },
    { id: 'aud-08', fecha: '2026-07-20T09:00', usuario: 'María López', accion: 'Publicó oferta de empleo', modulo: 'Egresados', detalle: 'Analista de Datos - EPM' },
    { id: 'aud-09', fecha: '2026-07-18T15:45', usuario: 'Coord. Sede Medellín', accion: 'Modificó configuración general', modulo: 'Administración', detalle: 'Actualizó formato de fecha institucional' },
    { id: 'aud-10', fecha: '2026-07-15T12:10', usuario: 'Carlos Pérez', accion: 'Invitó nuevo usuario', modulo: 'Administración', detalle: 'asesor.bogota@ucla.edu.co - rol Asesor' },
];

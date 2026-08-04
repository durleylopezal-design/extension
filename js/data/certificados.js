UCLA.data.certificados = [
    { nombre: 'Diplomado Conciliación Extrajudicial', codigo: 'DIP0392', participantes: 51, estado: 'Listo', fecha: '2025-07-27' },
    { nombre: 'Seminario IA Aplicada', codigo: 'SML0045', participantes: 45, estado: 'Listo', fecha: '2025-07-20' },
    { nombre: 'Curso Excel Avanzado', codigo: 'CSO0777', participantes: 32, estado: 'Pendiente', fecha: '2025-08-15' },
];

// Certificados · Historial de Emitidos — certificados individuales emitidos vía
// ACREDITTA (eventoCodigo referencia UCLA.data.eventos), consultables también
// desde certificados/verificacion por codigoVerificacion.
UCLA.data.certificadosEmitidos = [
    { id: 'ce-01', destinatario: 'Felipe Osorio Gómez', eventoCodigo: 'DIP0392', codigoVerificacion: 'UCLA-DIP0392-0001', fechaEmision: '2026-07-28', estado: 'Emitido' },
    { id: 'ce-02', destinatario: 'Laura Jaramillo Vélez', eventoCodigo: 'DIP0392', codigoVerificacion: 'UCLA-DIP0392-0002', fechaEmision: '2026-07-28', estado: 'Emitido' },
    { id: 'ce-03', destinatario: 'Ricardo Muñoz Salazar', eventoCodigo: 'DIP0392', codigoVerificacion: 'UCLA-DIP0392-0003', fechaEmision: '2026-07-28', estado: 'Emitido' },
    { id: 'ce-04', destinatario: 'Juan Pablo Hincapié Ríos', eventoCodigo: 'EVT1004', codigoVerificacion: 'UCLA-EVT1004-0001', fechaEmision: '2026-07-06', estado: 'Emitido' },
    { id: 'ce-05', destinatario: 'Luciana Mejía Ramírez', eventoCodigo: 'EVT1004', codigoVerificacion: 'UCLA-EVT1004-0002', fechaEmision: '2026-07-06', estado: 'Emitido' },
    { id: 'ce-06', destinatario: 'Andrés Felipe Londoño Marín', eventoCodigo: 'SML0033', codigoVerificacion: 'UCLA-SML0033-0001', fechaEmision: '2026-06-01', estado: 'Emitido' },
    { id: 'ce-07', destinatario: 'Valentina Restrepo Gómez', eventoCodigo: 'SML0033', codigoVerificacion: 'UCLA-SML0033-0002', fechaEmision: '2026-06-01', estado: 'Revocado' },
    { id: 'ce-08', destinatario: 'Mariana Correa Vélez', eventoCodigo: 'SML0033', codigoVerificacion: 'UCLA-SML0033-0003', fechaEmision: '2026-06-01', estado: 'Emitido' },
];

// Certificados · Plantillas — diseños reutilizables para la emisión (galería).
UCLA.data.plantillasCertificado = [
    { id: 'pc-01', nombre: 'Plantilla Diplomado Clásica', tipo: 'Diplomado', colorPrincipal: '#1C7FA8', activa: true, usosEsteAnio: 12 },
    { id: 'pc-02', nombre: 'Plantilla Semillero Juvenil', tipo: 'Semillero', colorPrincipal: '#F5821F', activa: true, usosEsteAnio: 6 },
    { id: 'pc-03', nombre: 'Plantilla Taller Corporativo', tipo: 'Taller', colorPrincipal: '#1B3A4A', activa: true, usosEsteAnio: 3 },
    { id: 'pc-04', nombre: 'Plantilla Curso Virtual', tipo: 'Curso', colorPrincipal: '#2C93BE', activa: false, usosEsteAnio: 0 },
];

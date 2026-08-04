// Eventos — catálogo de eventos/programas de Extensión. Los campos legacy
// (codigo, nombre, fechas, estado, estadoStyle, matriculas, excedente) los usan
// eventos/gestion (vista original migrada) y el buscador global (topbar.js);
// los campos nuevos (fechaInicio/Fin, cupos, sede...) los usan calendario,
// cupos, check-in, asistentes y reportes.
UCLA.data.eventos = [
    { codigo: 'DIP0392', nombre: 'Diplomado Conciliación Extrajudicial', fechas: '03/06 - 26/07', estado: 'CERTIFICADO', estadoStyle: 'background:#E8F2F6;color:#1B4B62;', matriculas: 51, excedente: 52.7,
      fechaInicio: '2026-06-03', fechaFin: '2026-07-26', sedeId: 'MDE', facultad: 'Derecho', modalidad: 'Presencial', tipo: 'Diplomado', responsable: 'Ana García', cupoMaximo: 55, cupoOcupado: 51 },
    { codigo: 'SML0033', nombre: 'Semillero Emprendimiento Grados 10° y 11°', fechas: '04/04 - 30/05', estado: 'CERTIFICADO', estadoStyle: 'background:#E8F2F6;color:#1B4B62;', matriculas: 45, excedente: 0.0,
      fechaInicio: '2026-04-04', fechaFin: '2026-05-30', sedeId: 'MDE', facultad: 'Ciencias Económicas', modalidad: 'Presencial', tipo: 'Semillero', responsable: 'María López', cupoMaximo: 45, cupoOcupado: 45 },
    { codigo: 'DIP0385', nombre: 'Pedagogía Prof. No Licenciados', fechas: '01/08 - 13/02', estado: 'ACTIVO', estadoStyle: 'background:#FEF3E9;color:#CA6B1A;', matriculas: 38, excedente: 65.3,
      fechaInicio: '2026-08-01', fechaFin: '2027-02-13', sedeId: 'MZL', facultad: 'Educación', modalidad: 'Virtual', tipo: 'Diplomado', responsable: 'Carlos Pérez', cupoMaximo: 45, cupoOcupado: 38 },
    { codigo: 'CSO0777', nombre: 'Convenio Smartfit', fechas: '04/08 - 15/02', estado: 'CANCELADO', estadoStyle: 'background:#fee2e2;color:#991b1b;', matriculas: 0, excedente: 0.0,
      fechaInicio: '2026-08-04', fechaFin: '2027-02-15', sedeId: 'MDE', facultad: 'Ciencias Económicas', modalidad: 'Presencial', tipo: 'Convenio', responsable: 'Ana García', cupoMaximo: 25, cupoOcupado: 0 },
    { codigo: 'CSO0788', nombre: 'Curso Marketing Digital', fechas: '15/04 - 30/05', estado: 'PROGRAMADO', estadoStyle: 'background:#E1E4E5;color:#3A3C3D;', matriculas: 0, excedente: 0.0,
      fechaInicio: '2026-09-15', fechaFin: '2026-10-30', sedeId: 'BOG', facultad: 'Comunicación Social', modalidad: 'Virtual', tipo: 'Curso', responsable: 'Juan Martínez', cupoMaximo: 40, cupoOcupado: 12 },
    { codigo: 'EVT1001', nombre: 'Seminario Internacional de Innovación Social', fechas: '15/08', estado: 'PROGRAMADO', estadoStyle: 'background:#E1E4E5;color:#3A3C3D;', matriculas: 80, excedente: 0.0,
      fechaInicio: '2026-08-15', fechaFin: '2026-08-15', sedeId: 'MDE', facultad: 'Ciencias Económicas', modalidad: 'Presencial', tipo: 'Seminario', responsable: 'Juan Martínez', cupoMaximo: 80, cupoOcupado: 80 },
    { codigo: 'EVT1002', nombre: 'Curso Excel Avanzado para Profesionales', fechas: '28/07 - 25/08', estado: 'ACTIVO', estadoStyle: 'background:#FEF3E9;color:#CA6B1A;', matriculas: 33, excedente: 0.0,
      fechaInicio: '2026-07-28', fechaFin: '2026-08-25', sedeId: 'MZL', facultad: 'Administración de Empresas', modalidad: 'Virtual', tipo: 'Curso', responsable: 'Carlos Pérez', cupoMaximo: 40, cupoOcupado: 33 },
    { codigo: 'EVT1003', nombre: 'Conversatorio Derechos Humanos', fechas: '20/08', estado: 'PROGRAMADO', estadoStyle: 'background:#E1E4E5;color:#3A3C3D;', matriculas: 58, excedente: 0.0,
      fechaInicio: '2026-08-20', fechaFin: '2026-08-20', sedeId: 'BOG', facultad: 'Derecho', modalidad: 'Híbrido', tipo: 'Conversatorio', responsable: 'María López', cupoMaximo: 60, cupoOcupado: 58 },
    { codigo: 'EVT1004', nombre: 'Taller de Oratoria y Liderazgo', fechas: '05/07', estado: 'CERTIFICADO', estadoStyle: 'background:#E8F2F6;color:#1B4B62;', matriculas: 30, excedente: 0.0,
      fechaInicio: '2026-07-05', fechaFin: '2026-07-05', sedeId: 'MDE', facultad: 'Comunicación Social', modalidad: 'Presencial', tipo: 'Taller', responsable: 'Ana García', cupoMaximo: 30, cupoOcupado: 30 },
];

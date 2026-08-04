// Inventario — salones/espacios, equipos y sus reservas. reservasRecursos
// cruza con UCLA.data.eventos por eventoCodigo (reserva de espacio/equipo
// para un evento real, no un arreglo aislado).
UCLA.data.salones = [
    { id: 'sal-01', nombre: 'Auditorio Principal', sedeId: 'MDE', capacidad: 120, tipo: 'Auditorio', estado: 'Disponible' },
    { id: 'sal-02', nombre: 'Sala de Cómputo 1', sedeId: 'MDE', capacidad: 30, tipo: 'Laboratorio', estado: 'Disponible' },
    { id: 'sal-03', nombre: 'Aula Múltiple 205', sedeId: 'MDE', capacidad: 45, tipo: 'Aula', estado: 'En uso' },
    { id: 'sal-04', nombre: 'Sala de Juntas Directiva', sedeId: 'MDE', capacidad: 12, tipo: 'Sala de juntas', estado: 'Disponible' },
    { id: 'sal-05', nombre: 'Auditorio Manizales', sedeId: 'MZL', capacidad: 80, tipo: 'Auditorio', estado: 'Disponible' },
    { id: 'sal-06', nombre: 'Aula 101', sedeId: 'BOG', capacidad: 40, tipo: 'Aula', estado: 'Mantenimiento' },
    { id: 'sal-07', nombre: 'Sala Virtual UCLA Studio', sedeId: 'MDE', capacidad: 5, tipo: 'Estudio virtual', estado: 'Disponible' },
    { id: 'sal-08', nombre: 'Auditorio Apartadó', sedeId: 'APD', capacidad: 60, tipo: 'Auditorio', estado: 'Disponible' },
];

UCLA.data.equipos = [
    { id: 'eq-01', nombre: 'Videobeam Epson X400', categoria: 'Audiovisual', cantidad: 6, disponibles: 4, sedeId: 'MDE', estado: 'Disponible' },
    { id: 'eq-02', nombre: 'Micrófono inalámbrico Shure', categoria: 'Audio', cantidad: 10, disponibles: 7, sedeId: 'MDE', estado: 'Disponible' },
    { id: 'eq-03', nombre: 'Portátil Dell Latitude', categoria: 'Cómputo', cantidad: 15, disponibles: 2, sedeId: 'MDE', estado: 'Disponible' },
    { id: 'eq-04', nombre: 'Cámara de streaming Logitech', categoria: 'Audiovisual', cantidad: 4, disponibles: 0, sedeId: 'MDE', estado: 'Agotado' },
    { id: 'eq-05', nombre: 'Consola de sonido Yamaha', categoria: 'Audio', cantidad: 2, disponibles: 1, sedeId: 'MZL', estado: 'Disponible' },
    { id: 'eq-06', nombre: 'Tablero digital interactivo', categoria: 'Audiovisual', cantidad: 3, disponibles: 1, sedeId: 'BOG', estado: 'En mantenimiento' },
];

UCLA.data.reservasRecursos = [
    { id: 'res-01', recursoTipo: 'salon', recursoId: 'sal-01', eventoCodigo: 'EVT1001', fecha: '2026-08-15', horaInicio: '08:00', horaFin: '12:00', estado: 'Confirmada' },
    { id: 'res-02', recursoTipo: 'equipo', recursoId: 'eq-01', eventoCodigo: 'EVT1001', fecha: '2026-08-15', horaInicio: '08:00', horaFin: '12:00', estado: 'Confirmada' },
    { id: 'res-03', recursoTipo: 'salon', recursoId: 'sal-03', eventoCodigo: 'EVT1002', fecha: '2026-08-25', horaInicio: '14:00', horaFin: '18:00', estado: 'Confirmada' },
    { id: 'res-04', recursoTipo: 'salon', recursoId: 'sal-06', eventoCodigo: 'EVT1003', fecha: '2026-08-20', horaInicio: '09:00', horaFin: '11:00', estado: 'Pendiente' },
    { id: 'res-05', recursoTipo: 'equipo', recursoId: 'eq-02', eventoCodigo: 'EVT1003', fecha: '2026-08-20', horaInicio: '09:00', horaFin: '11:00', estado: 'Pendiente' },
    { id: 'res-06', recursoTipo: 'salon', recursoId: 'sal-04', eventoCodigo: null, fecha: '2026-08-10', horaInicio: '10:00', horaFin: '11:00', estado: 'Confirmada' },
    { id: 'res-07', recursoTipo: 'equipo', recursoId: 'eq-04', eventoCodigo: 'DIP0385', fecha: '2026-08-08', horaInicio: '08:00', horaFin: '17:00', estado: 'Cancelada' },
];

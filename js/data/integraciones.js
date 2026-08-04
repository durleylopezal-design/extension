// Integraciones — servicios externos conectados al CRM (ACREDITTA es la misma
// integración mencionada en certificados/emision, no un dato aislado).
UCLA.data.integraciones = [
    { id: 'int-01', nombre: 'ACREDITTA', descripcion: 'Emisión de insignias digitales verificables', icono: 'fa-medal', estado: 'Conectado', ultimaSincronizacion: '2026-08-04' },
    { id: 'int-02', nombre: 'Pasarela de Pagos PSE', descripcion: 'Procesamiento de pagos en línea de matrículas y cuotas', icono: 'fa-credit-card', estado: 'Conectado', ultimaSincronizacion: '2026-08-03' },
    { id: 'int-03', nombre: 'Servicio de Correo Transaccional', descripcion: 'Envío de correos automáticos (recordatorios, bienvenida)', icono: 'fa-envelope', estado: 'Conectado', ultimaSincronizacion: '2026-08-04' },
    { id: 'int-04', nombre: 'Google Calendar', descripcion: 'Sincronización de reuniones y eventos con calendarios personales', icono: 'fa-calendar-days', estado: 'Desconectado', ultimaSincronizacion: null },
    { id: 'int-05', nombre: 'Zoom', descripcion: 'Generación de enlaces de videollamada para reuniones virtuales', icono: 'fa-video', estado: 'Desconectado', ultimaSincronizacion: null },
];

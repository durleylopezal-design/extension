// Admin · Plantillas de Correo — los id de las primeras 4 coinciden a
// propósito con el plantillaId ya referenciado por UCLA.data.reglasAutomaticas
// (js/data/recordatorios.js), que hasta esta iteración apuntaba a un id sin
// plantilla real detrás.
UCLA.data.plantillasCorreo = [
    { id: 'pl-convenio-vencer', nombre: 'Alerta de convenio próximo a vencer', asunto: 'Tu convenio con UCLA Extensión vence pronto', cuerpo: 'Estimado aliado, tu convenio institucional vence en los próximos 30 días. Contáctanos para gestionar la renovación.', modulo: 'Alianzas', ultimaModificacion: '2026-06-01' },
    { id: 'pl-recordatorio-pago', nombre: 'Recordatorio de cuota por vencer', asunto: 'Recuerda tu próximo pago de matrícula', cuerpo: 'Tu cuota vence en 3 días. Evita recargos realizando el pago a través de nuestros canales habilitados.', modulo: 'Financiero', ultimaModificacion: '2026-05-15' },
    { id: 'pl-encuesta-evento', nombre: 'Invitación a encuesta post evento', asunto: 'Cuéntanos qué te pareció el evento', cuerpo: 'Gracias por participar. Tu opinión nos ayuda a mejorar: responde la encuesta de satisfacción en menos de 3 minutos.', modulo: 'Eventos', ultimaModificacion: '2026-04-20' },
    { id: 'pl-actualizacion-egresados', nombre: 'Solicitud de actualización de datos', asunto: 'Ayúdanos a actualizar tu información', modulo: 'Egresados', cuerpo: 'Han pasado más de 12 meses desde tu último contacto con nosotros. Actualiza tus datos laborales y de contacto.', ultimaModificacion: '2026-03-10' },
    { id: 'pl-bienvenida-admision', nombre: 'Bienvenida tras admisión aprobada', asunto: '¡Bienvenido a UCLA Extensión!', cuerpo: 'Nos complace informarte que tu solicitud de admisión fue aprobada. Pronto recibirás los siguientes pasos para tu matrícula.', modulo: 'Solicitudes', ultimaModificacion: '2026-07-01' },
    { id: 'pl-beca-aprobada', nombre: 'Notificación de beca aprobada', asunto: 'Tu solicitud de beca fue aprobada', cuerpo: 'Tu solicitud de beca o descuento fue aprobada por el comité. El porcentaje aplicado ya está disponible en tu estado de cuenta.', modulo: 'Financiero', ultimaModificacion: '2026-07-30' },
];

// Oportunidades de matrícula — pipeline Kanban. Etapas: contacto-inicial (10%),
// interesado (20%), propuesta-enviada (40%), documentacion-revision (60%),
// matricula-confirmada (100%).
UCLA.data.oportunidades = UCLA.store.hidratar('oportunidades', [
    { id: 'opp-01', nombre: 'TECNOVA', descripcion: 'Formación en gestión de proyectos', valor: 45000000, etapa: 'contacto-inicial', fecha: '15/03', campanaId: null, propietario: 'Ana García', sedeId: 'MDE' },
    { id: 'opp-02', nombre: 'CÁMARA DE COMERCIO', descripcion: 'Capacitación empresarial', valor: 30000000, etapa: 'contacto-inicial', fecha: '18/03', campanaId: null, propietario: 'Carlos Pérez', sedeId: 'MDE' },
    { id: 'opp-03', nombre: 'COMFAMA', descripcion: 'Diplomado en bienestar laboral', valor: 38000000, etapa: 'contacto-inicial', fecha: '20/03', campanaId: null, propietario: 'María López', sedeId: 'MDE' },
    { id: 'opp-04', nombre: 'ALCALDÍA DE APARTADÓ', descripcion: 'Formación en gestión pública municipal', valor: 52000000, etapa: 'contacto-inicial', fecha: '21/03', campanaId: null, propietario: 'Carlos Pérez', sedeId: 'APD' },

    { id: 'opp-05', nombre: 'SENA', descripcion: 'Diplomado técnico instructores', valor: 120000000, etapa: 'interesado', fecha: '20/03', campanaId: null, propietario: 'María López', sedeId: 'MDE' },
    { id: 'opp-06', nombre: 'MINTIC', descripcion: 'Programación básica', valor: 95000000, etapa: 'interesado', fecha: '22/03', campanaId: null, propietario: 'Ana García', sedeId: 'BOG' },
    { id: 'opp-07', nombre: 'GRUPO NUTRESA', descripcion: 'Programa de liderazgo para supervisores', valor: 68000000, etapa: 'interesado', fecha: '24/03', campanaId: null, propietario: 'Carlos Pérez', sedeId: 'MDE' },
    { id: 'opp-08', nombre: 'COMFAMA - REGIONAL ORIENTE', descripcion: 'Diplomado en economía solidaria', valor: 41000000, etapa: 'interesado', fecha: '26/03', campanaId: null, propietario: 'Juan Martínez', sedeId: 'MDE' },
    { id: 'opp-09', nombre: 'UNIVERSIDAD DE ANTIOQUIA', descripcion: 'Curso complementario para egresados', valor: 22000000, etapa: 'interesado', fecha: '27/03', campanaId: null, propietario: 'María López', sedeId: 'MDE' },

    { id: 'opp-10', nombre: 'GOBERNACIÓN', descripcion: 'Gestión pública territorial', valor: 80000000, etapa: 'propuesta-enviada', fecha: '25/03', campanaId: null, propietario: 'Ana García', sedeId: 'MZL' },
    { id: 'opp-11', nombre: 'BANCOLOMBIA', descripcion: 'Liderazgo transformacional', valor: 55000000, etapa: 'propuesta-enviada', fecha: '28/03', campanaId: 'camp-01', propietario: 'Carlos Pérez', sedeId: 'BOG' },
    { id: 'opp-12', nombre: 'CÁMARA DE COMERCIO DE MEDELLÍN', descripcion: 'Formación a emprendedores 2026', valor: 47000000, etapa: 'propuesta-enviada', fecha: '29/03', campanaId: null, propietario: 'María López', sedeId: 'MDE' },
    { id: 'opp-13', nombre: 'FUNDACIÓN UNIVERSITARIA AMIGÓ', descripcion: 'Diplomado en docencia universitaria', valor: 33000000, etapa: 'propuesta-enviada', fecha: '30/03', campanaId: 'camp-02', propietario: 'Juan Martínez', sedeId: 'MDE' },

    { id: 'opp-14', nombre: 'COLCIENCIAS', descripcion: 'Investigación aplicada', valor: 200000000, etapa: 'documentacion-revision', fecha: 'HOY', campanaId: null, propietario: 'Ana García', sedeId: 'BOG', etiqueta: 'VENCE HOY' },
    { id: 'opp-15', nombre: 'MINTIC - REGIÓN CAFETERA', descripcion: 'Alfabetización digital para docentes', valor: 61000000, etapa: 'documentacion-revision', fecha: '02/04', campanaId: null, propietario: 'Carlos Pérez', sedeId: 'MZL' },
    { id: 'opp-16', nombre: 'GRUPO ÉXITO', descripcion: 'Programa de formación en servicio al cliente', valor: 39000000, etapa: 'documentacion-revision', fecha: '03/04', campanaId: 'camp-01', propietario: 'María López', sedeId: 'MZL' },

    { id: 'opp-17', nombre: 'EPM', descripcion: 'Seguridad industrial', valor: 75000000, etapa: 'matricula-confirmada', fecha: '01/03', campanaId: null, propietario: 'Juan Martínez', sedeId: 'MDE' },
    { id: 'opp-18', nombre: 'SENA REGIONAL ANTIOQUIA', descripcion: 'Diplomado técnico en instrumentación', valor: 88000000, etapa: 'matricula-confirmada', fecha: '05/03', campanaId: null, propietario: 'Ana García', sedeId: 'MDE' },
]);

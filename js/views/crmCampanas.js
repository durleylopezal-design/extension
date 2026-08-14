// CRM · Campañas de Mercadeo — listShell + recordForm sobre UCLA.data.campanas
// (antes solo mostraba emptyState.bienvenida()). El detalle de cada campaña
// (leads/oportunidades/actividades relacionados por campanaId) vive en
// js/views/crmCampanaDetalle.js (detailPanel), ruta crm/campanas/:id.
(function () {
    const TIPOS = ['Feria educativa', 'Email marketing', 'Referidos', 'Redes sociales', 'Evento', 'Digital'];
    const ESTADOS = ['Planeada', 'Activa', 'Pausada', 'Completada', 'Cancelada'];
    const CAMPOS_MODULO = ['Tipo', 'Estado', 'Responsable'];

    function roi(c) {
        if (!c.costos) return null;
        return (c.ingresos - c.costos) / c.costos;
    }

    function roiHtml(c) {
        const valor = roi(c);
        if (valor === null) return '<span style="color: var(--color-text-muted);">-</span>';
        const color = valor >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        return `<span class="font-semibold" style="color: ${color};">${(valor * 100).toFixed(0)}%</span>`;
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Nombre', render: (c) => `<a href="#/crm/campanas/${c.id}" class="font-medium hover:underline" style="color: var(--color-primary);">${c.nombre}</a>` },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => UCLA.utils.badgeEstado(c.estado) },
            { clave: 'fechaInicio', etiqueta: 'Inicio', render: (c) => UCLA.utils.formatoFecha(c.fechaInicio) },
            { clave: 'fechaFin', etiqueta: 'Fin', render: (c) => c.fechaFin ? UCLA.utils.formatoFecha(c.fechaFin) : '-' },
            { clave: 'presupuesto', etiqueta: 'Presupuesto', render: (c) => UCLA.utils.formatoCOP(c.presupuesto) },
            { clave: 'roi', etiqueta: 'ROI', render: roiHtml },
        ];
    }

    function secciones() {
        return [
            {
                titulo: 'Identificación',
                camposIzquierda: [
                    { clave: 'nombre', etiqueta: 'Nombre', tipo: 'text', obligatorio: true },
                    { clave: 'tipo', etiqueta: 'Tipo', tipo: 'select', opciones: TIPOS },
                ],
                camposDerecha: [
                    { clave: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea' },
                    { clave: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ESTADOS },
                ],
            },
            {
                titulo: 'Planeación',
                camposIzquierda: [
                    { clave: 'objetivo', etiqueta: 'Objetivo', tipo: 'textarea' },
                    { clave: 'publicoObjetivo', etiqueta: 'Público objetivo', tipo: 'text' },
                    { clave: 'fechaInicio', etiqueta: 'Fecha inicio', tipo: 'date' },
                    { clave: 'responsable', etiqueta: 'Responsable', tipo: 'text' },
                ],
                camposDerecha: [
                    { clave: 'segmentacion', etiqueta: 'Segmentación (separada por comas)', tipo: 'text' },
                    { clave: 'fechaFin', etiqueta: 'Fecha fin', tipo: 'date' },
                    { clave: 'presupuesto', etiqueta: 'Presupuesto', tipo: 'number' },
                ],
            },
            {
                titulo: 'Ejecución',
                camposIzquierda: [
                    { clave: 'canales', etiqueta: 'Canales (separados por comas)', tipo: 'text' },
                    { clave: 'contenido', etiqueta: 'Contenido', tipo: 'textarea' },
                    { clave: 'frecuencia', etiqueta: 'Frecuencia', tipo: 'text' },
                ],
                camposDerecha: [
                    { clave: 'cta', etiqueta: 'CTA (llamado a la acción)', tipo: 'text' },
                    { clave: 'landingPage', etiqueta: 'Landing page', tipo: 'text' },
                ],
            },
            {
                titulo: 'Resultados',
                camposIzquierda: [
                    { clave: 'alcance', etiqueta: 'Alcance', tipo: 'number' },
                    { clave: 'interacciones', etiqueta: 'Interacciones', tipo: 'number' },
                    { clave: 'leads', etiqueta: 'Leads', tipo: 'number' },
                    { clave: 'leadsCalificados', etiqueta: 'Leads calificados', tipo: 'number' },
                ],
                camposDerecha: [
                    { clave: 'oportunidades', etiqueta: 'Oportunidades', tipo: 'number' },
                    { clave: 'ventas', etiqueta: 'Ventas', tipo: 'number' },
                    { clave: 'ingresos', etiqueta: 'Ingresos', tipo: 'number' },
                    { clave: 'costos', etiqueta: 'Costos', tipo: 'number' },
                ],
            },
        ];
    }

    function render(container) {
        const filas = UCLA.data.campanas.slice();

        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Campañas de Mercadeo',
                columnas: columnas(),
                filas,
                filaId: (c) => c.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'campanas',
                botonPrincipal: {
                    etiqueta: 'Crear',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva campaña',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            const ahora = new Date().toISOString().slice(0, 10);
                            filas.unshift({
                                id: 'camp-' + Date.now(),
                                nombre: datos.nombre || 'Sin nombre',
                                descripcion: datos.descripcion || '',
                                tipo: datos.tipo || TIPOS[0],
                                estado: datos.estado || ESTADOS[0],
                                objetivo: datos.objetivo || '',
                                publicoObjetivo: datos.publicoObjetivo || '',
                                segmentacion: (datos.segmentacion || '').split(',').map((s) => s.trim()).filter(Boolean),
                                fechaInicio: datos.fechaInicio || '',
                                fechaFin: datos.fechaFin || '',
                                responsable: datos.responsable || UCLA.state.usuarioActual.nombre,
                                presupuesto: Number(datos.presupuesto) || 0,
                                canales: (datos.canales || '').split(',').map((s) => s.trim()).filter(Boolean),
                                contenido: datos.contenido || '',
                                cta: datos.cta || '',
                                landingPage: datos.landingPage || '',
                                frecuencia: datos.frecuencia || '',
                                contenidos: [],
                                alcance: Number(datos.alcance) || 0,
                                interacciones: Number(datos.interacciones) || 0,
                                leads: Number(datos.leads) || 0,
                                leadsCalificados: Number(datos.leadsCalificados) || 0,
                                oportunidades: Number(datos.oportunidades) || 0,
                                ventas: Number(datos.ventas) || 0,
                                ingresos: Number(datos.ingresos) || 0,
                                costos: Number(datos.costos) || 0,
                                productos: [],
                                cuentasIds: [],
                                contactosIds: [],
                                usuarioCreador: UCLA.state.usuarioActual.nombre,
                                fechaCreacion: ahora,
                                usuarioModificador: UCLA.state.usuarioActual.nombre,
                                fechaModificacion: ahora,
                            });
                            UCLA.utils.registrarAuditoria({ accion: 'Creó campaña de mercadeo', modulo: 'CRM', detalle: datos.nombre || 'Sin nombre' });
                            pintar();
                        },
                    }),
                },
            });
        }

        pintar();
    }

    UCLA.views['crm/campanas'] = { render };
})();

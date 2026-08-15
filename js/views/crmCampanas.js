// CRM · Campañas de Mercadeo — listShell + recordForm sobre UCLA.data.campanas
// (antes solo mostraba emptyState.bienvenida()). El detalle de cada campaña
// (leads/oportunidades/actividades relacionados por campanaId) vive en
// js/views/crmCampanaDetalle.js (detailPanel), ruta crm/campanas/:id.
(function () {
    const TIPOS = ['Feria educativa', 'Email marketing', 'Referidos', 'Redes sociales', 'Evento', 'Digital'];
    const ESTADOS = ['Planeada', 'Activa', 'Pausada', 'Completada', 'Cancelada'];
    const CAMPOS_MODULO = ['Tipo', 'Estado', 'Responsable'];

    let clickHandler = null;

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
            { clave: 'acciones', etiqueta: 'Acciones', render: (c) => `
                <button data-editar-campana="${c.id}" class="mr-2" style="color: var(--color-primary);" title="Editar"><i class="fas fa-pen text-xs"></i></button>
                <button data-eliminar-campana="${c.id}" style="color: var(--color-danger);" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>` },
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

    function datosDesdeFormulario(datos) {
        return {
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
            alcance: Number(datos.alcance) || 0,
            interacciones: Number(datos.interacciones) || 0,
            leads: Number(datos.leads) || 0,
            leadsCalificados: Number(datos.leadsCalificados) || 0,
            oportunidades: Number(datos.oportunidades) || 0,
            ventas: Number(datos.ventas) || 0,
            ingresos: Number(datos.ingresos) || 0,
            costos: Number(datos.costos) || 0,
        };
    }

    function datosParaEditar(campana) {
        return Object.assign({}, campana, {
            segmentacion: (campana.segmentacion || []).join(', '),
            canales: (campana.canales || []).join(', '),
        });
    }

    function render(container) {
        function abrirEditar(id) {
            const campana = UCLA.store.obtener('campanas', id);
            if (!campana) return;
            UCLA.components.recordForm.abrir({
                titulo: 'Editar campaña',
                secciones: secciones(),
                datosIniciales: datosParaEditar(campana),
                esEdicion: true,
                onGuardar: (datos) => {
                    const ahora = new Date().toISOString().slice(0, 10);
                    UCLA.store.actualizar('campanas', id, Object.assign(datosDesdeFormulario(datos), {
                        usuarioModificador: UCLA.state.usuarioActual.nombre,
                        fechaModificacion: ahora,
                    }));
                    UCLA.utils.registrarAuditoria({ accion: 'Editó campaña de mercadeo', modulo: 'CRM', detalle: campana.nombre });
                    pintar();
                },
            });
        }

        function confirmarEliminar(id) {
            const campana = UCLA.store.obtener('campanas', id);
            if (!campana) return;
            UCLA.components.confirmModal.abrir({
                titulo: 'Eliminar campaña',
                mensaje: `¿Eliminar "${campana.nombre}"? Esta acción no se puede deshacer.`,
                onConfirmar: () => {
                    UCLA.store.eliminar('campanas', id);
                    UCLA.utils.registrarAuditoria({ accion: 'Eliminó campaña de mercadeo', modulo: 'CRM', detalle: campana.nombre });
                    UCLA.components.toast.show('Campaña eliminada', 'success');
                    pintar();
                },
            });
        }

        function pintar() {
            const filas = UCLA.data.campanas;
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
                            const nueva = UCLA.store.crear('campanas', Object.assign(datosDesdeFormulario(datos), {
                                contenidos: [],
                                productos: [],
                                cuentasIds: [],
                                contactosIds: [],
                                usuarioCreador: UCLA.state.usuarioActual.nombre,
                                fechaCreacion: ahora,
                                usuarioModificador: UCLA.state.usuarioActual.nombre,
                                fechaModificacion: ahora,
                            }));
                            UCLA.utils.registrarAuditoria({ accion: 'Creó campaña de mercadeo', modulo: 'CRM', detalle: nueva.nombre });
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btnEditar = e.target.closest('[data-editar-campana]');
            if (btnEditar) { abrirEditar(btnEditar.getAttribute('data-editar-campana')); return; }
            const btnEliminar = e.target.closest('[data-eliminar-campana]');
            if (btnEliminar) { confirmarEliminar(btnEliminar.getAttribute('data-eliminar-campana')); return; }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['crm/campanas'] = { render, secciones, datosDesdeFormulario, datosParaEditar };
})();

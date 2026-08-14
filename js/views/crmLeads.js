// CRM · Posibles Estudiantes — listado sobre listShell/dataTable + formulario
// de creación en recordForm.
(function () {
    const CAMPOS_MODULO = ['Apellidos', 'Calificación', 'Programa de interés', 'Conectado a', 'Correo electrónico', 'Estado', 'Fuente', 'Nivel educativo'];

    let clickHandler = null;

    function etiquetaActividad(prox) {
        if (!prox) return '';
        const color = prox.estado === 'vencida' ? 'var(--color-danger)' : 'var(--color-success)';
        return `<div class="text-xs mt-1" style="color: ${color};"><i class="fas fa-circle" style="font-size: 5px;"></i> ${prox.tipo} · ${UCLA.utils.formatoFecha(prox.fecha)}</div>`;
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Nombre', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.nombre} ${f.apellidos}</span>${etiquetaActividad(f.proximaActividad)}` },
            { clave: 'institucionProcedencia', etiqueta: 'Institución / Colegio' },
            { clave: 'correo', etiqueta: 'Correo' },
            { clave: 'movil', etiqueta: 'Teléfono', render: (f) => `<i class="fas fa-phone text-xs mr-1" style="color: var(--color-text-muted);"></i>${f.movil || f.telefono || '-'}` },
            { clave: 'fuente', etiqueta: 'Fuente' },
            { clave: 'propietario', etiqueta: 'Propietario' },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `
                <button data-editar-lead="${f.id}" class="mr-2" style="color: var(--color-primary);" title="Editar"><i class="fas fa-pen text-xs"></i></button>
                <button data-eliminar-lead="${f.id}" style="color: var(--color-danger);" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>` },
        ];
    }

    function secciones() {
        return [
            {
                titulo: 'Información del posible estudiante',
                camposIzquierda: [
                    { clave: 'propietario', etiqueta: 'Propietario', tipo: 'text' },
                    { clave: 'nombre', etiqueta: 'Nombre', tipo: 'text', obligatorio: true },
                    { clave: 'ocupacion', etiqueta: 'Título u ocupación actual', tipo: 'text' },
                    { clave: 'telefono', etiqueta: 'Teléfono', tipo: 'tel' },
                    { clave: 'movil', etiqueta: 'Móvil', tipo: 'tel' },
                    { clave: 'fuente', etiqueta: 'Fuente', tipo: 'select', opciones: ['Redes sociales', 'Feria educativa', 'Referido', 'Página web', 'Llamada del asesor', 'Convenio institucional'] },
                    { clave: 'programaInteres', etiqueta: 'Programa de interés', tipo: 'text' },
                    { clave: 'presupuesto', etiqueta: 'Presupuesto o modalidad de pago estimada', tipo: 'text' },
                    { clave: 'noParticiparCampanas', etiqueta: 'No participar en campañas de correo', tipo: 'checkbox' },
                    { clave: 'conectadoA', etiqueta: 'Conectado a', tipo: 'text' },
                ],
                camposDerecha: [
                    { clave: 'institucionProcedencia', etiqueta: 'Institución o colegio de procedencia', tipo: 'text' },
                    { clave: 'apellidos', etiqueta: 'Apellidos', tipo: 'text', obligatorio: true },
                    { clave: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['Nuevo', 'Contactado', 'Calificado', 'No calificado', 'Matriculado'] },
                    { clave: 'nivelEducativo', etiqueta: 'Nivel educativo actual', tipo: 'text' },
                    { clave: 'calificacion', etiqueta: 'Calificación del interés', tipo: 'select', opciones: ['Alta', 'Media', 'Baja'] },
                    { clave: 'correo', etiqueta: 'Correo', tipo: 'email' },
                    { clave: 'sitioWeb', etiqueta: 'Sitio web personal o red profesional', tipo: 'text' },
                    { clave: 'mensajeria', etiqueta: 'Identificador de mensajería', tipo: 'text' },
                    { clave: 'correoSecundario', etiqueta: 'Correo secundario', tipo: 'email' },
                    { clave: 'redSocial', etiqueta: 'Usuario de red social', tipo: 'text' },
                ],
            },
            {
                titulo: 'Información de la dirección',
                camposIzquierda: [
                    { clave: 'pais', etiqueta: 'País o región', tipo: 'text' },
                    { clave: 'direccion', etiqueta: 'Dirección', tipo: 'text' },
                ],
                camposDerecha: [
                    { clave: 'ciudad', etiqueta: 'Ciudad', tipo: 'text' },
                    { clave: 'departamento', etiqueta: 'Departamento o provincia', tipo: 'text' },
                ],
            },
        ];
    }

    function datosDesdeFormulario(datos) {
        return {
            nombre: datos.nombre || 'Sin nombre',
            apellidos: datos.apellidos || '',
            institucionProcedencia: datos.institucionProcedencia || '',
            correo: datos.correo || '',
            correoSecundario: datos.correoSecundario || '',
            movil: datos.movil || '',
            telefono: datos.telefono || '',
            fuente: datos.fuente || 'Página web',
            programaInteres: datos.programaInteres || '',
            estado: datos.estado || 'Nuevo',
            nivelEducativo: datos.nivelEducativo || '',
            calificacion: datos.calificacion || '',
            propietario: datos.propietario || UCLA.state.usuarioActual.nombre,
            conectadoA: datos.conectadoA || '',
            ocupacion: datos.ocupacion || '',
            presupuesto: datos.presupuesto || '',
            noParticiparCampanas: !!datos.noParticiparCampanas,
            sitioWeb: datos.sitioWeb || '',
            mensajeria: datos.mensajeria || '',
            redSocial: datos.redSocial || '',
            pais: datos.pais || '',
            direccion: datos.direccion || '',
            ciudad: datos.ciudad || '',
            departamento: datos.departamento || '',
        };
    }

    function render(container) {
        function abrirEditar(id) {
            const lead = UCLA.store.obtener('leads', id);
            if (!lead) return;
            UCLA.components.recordForm.abrir({
                titulo: 'Editar posible estudiante',
                secciones: secciones(),
                datosIniciales: lead,
                esEdicion: true,
                onGuardar: (datos) => {
                    UCLA.store.actualizar('leads', id, datosDesdeFormulario(datos));
                    pintar();
                },
            });
        }

        function confirmarEliminar(id) {
            const lead = UCLA.store.obtener('leads', id);
            if (!lead) return;
            UCLA.components.confirmModal.abrir({
                titulo: 'Eliminar posible estudiante',
                mensaje: `¿Eliminar a "${lead.nombre} ${lead.apellidos}"? Esta acción no se puede deshacer.`,
                onConfirmar: () => {
                    UCLA.store.eliminar('leads', id);
                    UCLA.components.toast.show('Posible estudiante eliminado', 'success');
                    pintar();
                },
            });
        }

        function pintar() {
            const filas = UCLA.data.leads;
            UCLA.components.listShell.render(container, {
                titulo: 'Posibles Estudiantes',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'posibles-estudiantes',
                botonPrincipal: {
                    etiqueta: 'Crear posible estudiante',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nuevo posible estudiante',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.store.crear('leads', Object.assign(datosDesdeFormulario(datos), {
                                sedeId: UCLA.state.usuarioActual.sedeId,
                                campanaId: null,
                                proximaActividad: null,
                            }));
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btnEditar = e.target.closest('[data-editar-lead]');
            if (btnEditar) { abrirEditar(btnEditar.getAttribute('data-editar-lead')); return; }
            const btnEliminar = e.target.closest('[data-eliminar-lead]');
            if (btnEliminar) { confirmarEliminar(btnEliminar.getAttribute('data-eliminar-lead')); return; }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['crm/leads'] = { render };
})();

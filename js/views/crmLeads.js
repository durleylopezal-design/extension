// CRM · Posibles Estudiantes — listado sobre listShell/dataTable + formulario
// de creación en recordForm.
(function () {
    const CAMPOS_MODULO = ['Apellidos', 'Calificación', 'Programa de interés', 'Conectado a', 'Correo electrónico', 'Estado', 'Fuente', 'Nivel educativo'];

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

    function render(container) {
        const filas = UCLA.data.leads.slice();

        function pintar() {
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
                            filas.unshift({
                                id: 'lead-' + Date.now(),
                                nombre: datos.nombre || 'Sin nombre',
                                apellidos: datos.apellidos || '',
                                institucionProcedencia: datos.institucionProcedencia || '',
                                correo: datos.correo || '',
                                movil: datos.movil, telefono: datos.telefono,
                                fuente: datos.fuente || 'Página web',
                                propietario: datos.propietario || UCLA.state.usuarioActual.nombre,
                                proximaActividad: null,
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        pintar();
    }

    UCLA.views['crm/leads'] = { render };
})();

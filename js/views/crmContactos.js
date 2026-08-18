// CRM · Contactos — listado sobre listShell/dataTable + formulario de
// creación en recordForm.
(function () {
    const CAMPOS_MODULO = ['Apellidos', 'Fuente del posible estudiante', 'Institución aliada relacionada', 'Área o dependencia', 'Fecha de nacimiento', 'Correo electrónico'];

    let clickHandler = null;

    function etiquetaActividad(prox) {
        if (!prox) return '';
        const color = prox.estado === 'vencida' ? 'var(--color-danger)' : 'var(--color-success)';
        return `<div class="text-xs mt-1" style="color: ${color};"><i class="fas fa-circle" style="font-size: 5px;"></i> ${prox.tipo} · ${UCLA.utils.formatoFecha(prox.fecha)}</div>`;
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Nombre', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.nombre} ${f.apellidos}</span>${etiquetaActividad(f.proximaActividad)}` },
            { clave: 'programaAsociado', etiqueta: 'Institución / Programa asociado' },
            { clave: 'correo', etiqueta: 'Correo' },
            { clave: 'movil', etiqueta: 'Teléfono', render: (f) => `<i class="fas fa-phone text-xs mr-1" style="color: var(--color-text-muted);"></i>${f.movil || f.telefono || '-'}` },
            { clave: 'propietario', etiqueta: 'Propietario' },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `
                <button data-editar-contacto="${f.id}" class="mr-2" style="color: var(--color-primary);" title="Editar"><i class="fas fa-pen text-xs"></i></button>
                <button data-eliminar-contacto="${f.id}" style="color: var(--color-danger);" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>` },
        ];
    }

    function secciones() {
        return [
            {
                titulo: 'Información de contacto',
                camposIzquierda: [
                    { clave: 'propietario', etiqueta: 'Propietario', tipo: 'text' },
                    { clave: 'nombre', etiqueta: 'Nombre', tipo: 'text', obligatorio: true },
                    { clave: 'programaAsociado', etiqueta: 'Nombre del programa o curso asociado', tipo: 'text' },
                    { clave: 'correo', etiqueta: 'Correo', tipo: 'email' },
                    { clave: 'telefono', etiqueta: 'Teléfono', tipo: 'tel' },
                    { clave: 'otroTelefono', etiqueta: 'Otro teléfono', tipo: 'tel' },
                    { clave: 'movil', etiqueta: 'Móvil', tipo: 'tel' },
                    { clave: 'acudiente', etiqueta: 'Persona de referencia o acudiente', tipo: 'text' },
                    { clave: 'conectadoA', etiqueta: 'Conectado a', tipo: 'text' },
                ],
                camposDerecha: [
                    { clave: 'fuente', etiqueta: 'Fuente del posible estudiante', tipo: 'select', opciones: ['Redes sociales', 'Feria educativa', 'Referido', 'Página web', 'Llamada del asesor', 'Convenio institucional'] },
                    { clave: 'apellidos', etiqueta: 'Apellidos', tipo: 'text', obligatorio: true },
                    { clave: 'institucionAliada', etiqueta: 'Institución aliada relacionada', tipo: 'text' },
                    { clave: 'ocupacion', etiqueta: 'Título u ocupación', tipo: 'text' },
                    { clave: 'area', etiqueta: 'Área o dependencia', tipo: 'text' },
                    { clave: 'telefonoParticular', etiqueta: 'Teléfono particular', tipo: 'tel' },
                    { clave: 'fax', etiqueta: 'Fax', tipo: 'text' },
                    { clave: 'fechaNacimiento', etiqueta: 'Fecha de nacimiento', tipo: 'date' },
                    { clave: 'contactoReferencia', etiqueta: 'Número de contacto de referencia', tipo: 'tel' },
                    { clave: 'noParticiparCorreo', etiqueta: 'No participar en campañas de correo', tipo: 'checkbox' },
                    { clave: 'mensajeria', etiqueta: 'Identificador de mensajería', tipo: 'text' },
                    { clave: 'correoSecundario', etiqueta: 'Correo secundario', tipo: 'email' },
                    { clave: 'redSocial', etiqueta: 'Usuario de red social', tipo: 'text' },
                    { clave: 'reportaA', etiqueta: 'Reporta a', tipo: 'text' },
                ],
            },
            {
                titulo: 'Información de la dirección: Domicilio postal',
                camposIzquierda: [
                    { clave: 'domPais', etiqueta: 'País o región', tipo: 'text' },
                    { clave: 'domDireccion', etiqueta: 'Dirección', tipo: 'text' },
                ],
                camposDerecha: [
                    { clave: 'domCiudad', etiqueta: 'Ciudad', tipo: 'text' },
                    { clave: 'domDepartamento', etiqueta: 'Departamento o provincia', tipo: 'text' },
                ],
            },
            {
                titulo: 'Información de la dirección: Dirección alterna',
                camposIzquierda: [
                    { clave: 'altPais', etiqueta: 'País o región', tipo: 'text' },
                    { clave: 'altDireccion', etiqueta: 'Dirección', tipo: 'text' },
                ],
                camposDerecha: [
                    { clave: 'altCiudad', etiqueta: 'Ciudad', tipo: 'text' },
                    { clave: 'altDepartamento', etiqueta: 'Departamento o provincia', tipo: 'text' },
                ],
            },
        ];
    }

    function datosDesdeFormulario(datos) {
        return {
            nombre: datos.nombre || 'Sin nombre',
            apellidos: datos.apellidos || '',
            programaAsociado: datos.programaAsociado || '',
            correo: datos.correo || '',
            telefono: datos.telefono || '',
            otroTelefono: datos.otroTelefono || '',
            movil: datos.movil || '',
            acudiente: datos.acudiente || '',
            conectadoA: datos.conectadoA || '',
            fuente: datos.fuente || '',
            institucionAliada: datos.institucionAliada || '',
            ocupacion: datos.ocupacion || '',
            area: datos.area || '',
            telefonoParticular: datos.telefonoParticular || '',
            fax: datos.fax || '',
            fechaNacimiento: datos.fechaNacimiento || '',
            contactoReferencia: datos.contactoReferencia || '',
            noParticiparCorreo: !!datos.noParticiparCorreo,
            mensajeria: datos.mensajeria || '',
            correoSecundario: datos.correoSecundario || '',
            redSocial: datos.redSocial || '',
            reportaA: datos.reportaA || '',
            domPais: datos.domPais || '', domDireccion: datos.domDireccion || '', domCiudad: datos.domCiudad || '', domDepartamento: datos.domDepartamento || '',
            altPais: datos.altPais || '', altDireccion: datos.altDireccion || '', altCiudad: datos.altCiudad || '', altDepartamento: datos.altDepartamento || '',
            propietario: datos.propietario || UCLA.state.usuarioActual.nombre,
        };
    }

    function render(container) {
        function abrirEditar(id) {
            const contacto = UCLA.store.obtener('contactos', id);
            if (!contacto) return;
            UCLA.components.recordForm.abrir({
                titulo: 'Editar contacto',
                secciones: secciones(),
                datosIniciales: contacto,
                esEdicion: true,
                onGuardar: (datos) => {
                    UCLA.store.actualizar('contactos', id, datosDesdeFormulario(datos));
                    pintar();
                },
            });
        }

        function confirmarEliminar(id) {
            const contacto = UCLA.store.obtener('contactos', id);
            if (!contacto) return;
            UCLA.components.confirmModal.abrir({
                titulo: 'Eliminar contacto',
                mensaje: `¿Eliminar a "${contacto.nombre} ${contacto.apellidos}"? Esta acción no se puede deshacer.`,
                onConfirmar: () => {
                    UCLA.store.eliminar('contactos', id);
                    UCLA.components.toast.show('Contacto eliminado', 'success');
                    pintar();
                },
            });
        }

        function pintar() {
            const filas = UCLA.data.contactos;
            UCLA.components.listShell.render(container, {
                titulo: 'Contactos',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'contactos',
                botonPrincipal: {
                    etiqueta: 'Crear contacto',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nuevo contacto',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.store.crear('contactos', Object.assign(datosDesdeFormulario(datos), {
                                sedeId: UCLA.state.usuarioActual.sedeId,
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
            const btnEditar = e.target.closest('[data-editar-contacto]');
            if (btnEditar) { abrirEditar(btnEditar.getAttribute('data-editar-contacto')); return; }
            const btnEliminar = e.target.closest('[data-eliminar-contacto]');
            if (btnEliminar) { confirmarEliminar(btnEliminar.getAttribute('data-eliminar-contacto')); return; }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['crm/contactos'] = { render };
})();

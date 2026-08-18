// CRM · Cuentas — instituciones aliadas, empresas convenio y colegios.
(function () {
    const CAMPOS_MODULO = ['Tipo de cuenta', 'Sector', 'Calificación del convenio', 'Número de convenio', 'Cuenta principal', 'Número de empleados'];

    let clickHandler = null;

    function columnas() {
        return [
            { clave: 'razonSocial', etiqueta: 'Nombre de la cuenta', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.razonSocial}</span>` },
            { clave: 'telefono', etiqueta: 'Teléfono', render: (f) => f.telefono || '-' },
            { clave: 'sitioWeb', etiqueta: 'Sitio web', render: (f) => f.sitioWeb ? `<a href="#" onclick="return false;" style="color: var(--color-primary);">${f.sitioWeb}</a>` : '-' },
            { clave: 'propietario', etiqueta: 'Propietario' },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `
                <button data-editar-cuenta="${f.id}" class="mr-2" style="color: var(--color-primary);" title="Editar"><i class="fas fa-pen text-xs"></i></button>
                <button data-eliminar-cuenta="${f.id}" style="color: var(--color-danger);" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>` },
        ];
    }

    function secciones() {
        return [
            {
                titulo: 'Información de cuenta',
                camposIzquierda: [
                    { clave: 'propietario', etiqueta: 'Propietario', tipo: 'text' },
                    { clave: 'razonSocial', etiqueta: 'Nombre de la institución o empresa', tipo: 'text', obligatorio: true },
                    { clave: 'sitioConvenio', etiqueta: 'Sitio de la cuenta o portal del convenio', tipo: 'text' },
                    { clave: 'cuentaPrincipal', etiqueta: 'Cuenta principal', tipo: 'text' },
                    { clave: 'numeroConvenio', etiqueta: 'Número de convenio o acuerdo', tipo: 'text' },
                    { clave: 'tipo', etiqueta: 'Tipo de cuenta', tipo: 'select', opciones: ['Colegio', 'Empresa', 'Entidad pública', 'ONG'] },
                    { clave: 'sector', etiqueta: 'Sector', tipo: 'text' },
                    { clave: 'numeroEmpleados', etiqueta: 'Número de empleados o de estudiantes potenciales', tipo: 'text' },
                ],
                camposDerecha: [
                    { clave: 'calificacionConvenio', etiqueta: 'Calificación del convenio', tipo: 'select', opciones: ['Alta', 'Media', 'Baja'] },
                    { clave: 'telefono', etiqueta: 'Teléfono', tipo: 'tel' },
                    { clave: 'fax', etiqueta: 'Fax', tipo: 'text' },
                    { clave: 'sitioWeb', etiqueta: 'Sitio web', tipo: 'text' },
                    { clave: 'logotipo', etiqueta: 'Símbolo o logotipo', tipo: 'text' },
                    { clave: 'contactoPrincipal', etiqueta: 'Propietario del contacto principal', tipo: 'text' },
                    { clave: 'conectadoA', etiqueta: 'Conectado a', tipo: 'text' },
                ],
            },
            {
                titulo: 'Información de la dirección: Facturación',
                camposIzquierda: [{ clave: 'facDireccion', etiqueta: 'Dirección', tipo: 'text' }],
                camposDerecha: [{ clave: 'facCiudad', etiqueta: 'Ciudad', tipo: 'text' }],
            },
            {
                titulo: 'Información de la dirección: Envío',
                camposIzquierda: [{ clave: 'envDireccion', etiqueta: 'Dirección', tipo: 'text' }],
                camposDerecha: [{ clave: 'envCiudad', etiqueta: 'Ciudad', tipo: 'text' }],
            },
        ];
    }

    function datosDesdeFormulario(datos) {
        return {
            razonSocial: datos.razonSocial || 'Sin nombre',
            sitioConvenio: datos.sitioConvenio || '',
            cuentaPrincipal: datos.cuentaPrincipal || '',
            numeroConvenio: datos.numeroConvenio || '',
            tipo: datos.tipo || '',
            sector: datos.sector || '',
            numeroEmpleados: datos.numeroEmpleados || '',
            calificacionConvenio: datos.calificacionConvenio || '',
            telefono: datos.telefono || '',
            fax: datos.fax || '',
            sitioWeb: datos.sitioWeb || '',
            logotipo: datos.logotipo || '',
            contactoPrincipal: datos.contactoPrincipal || '',
            conectadoA: datos.conectadoA || '',
            dirFacturacion: { direccion: datos.facDireccion || '', ciudad: datos.facCiudad || '' },
            dirEnvio: { direccion: datos.envDireccion || '', ciudad: datos.envCiudad || '' },
            propietario: datos.propietario || UCLA.state.usuarioActual.nombre,
        };
    }

    function datosParaEditar(cuenta) {
        return Object.assign({}, cuenta, {
            facDireccion: cuenta.dirFacturacion?.direccion || '', facCiudad: cuenta.dirFacturacion?.ciudad || '',
            envDireccion: cuenta.dirEnvio?.direccion || '', envCiudad: cuenta.dirEnvio?.ciudad || '',
        });
    }

    function render(container) {
        function abrirEditar(id) {
            const cuenta = UCLA.store.obtener('cuentas', id);
            if (!cuenta) return;
            UCLA.components.recordForm.abrir({
                titulo: 'Editar cuenta',
                secciones: secciones(),
                datosIniciales: datosParaEditar(cuenta),
                esEdicion: true,
                onGuardar: (datos) => {
                    UCLA.store.actualizar('cuentas', id, datosDesdeFormulario(datos));
                    pintar();
                },
            });
        }

        function confirmarEliminar(id) {
            const cuenta = UCLA.store.obtener('cuentas', id);
            if (!cuenta) return;
            UCLA.components.confirmModal.abrir({
                titulo: 'Eliminar cuenta',
                mensaje: `¿Eliminar "${cuenta.razonSocial}"? Esta acción no se puede deshacer.`,
                onConfirmar: () => {
                    UCLA.store.eliminar('cuentas', id);
                    UCLA.components.toast.show('Cuenta eliminada', 'success');
                    pintar();
                },
            });
        }

        function pintar() {
            const filas = UCLA.data.cuentas;
            UCLA.components.listShell.render(container, {
                titulo: 'Cuentas',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'razonSocial',
                exportName: 'cuentas',
                botonPrincipal: {
                    etiqueta: 'Crear cuenta',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva cuenta',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.store.crear('cuentas', Object.assign(datosDesdeFormulario(datos), {
                                sedeId: UCLA.state.usuarioActual.sedeId,
                            }));
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btnEditar = e.target.closest('[data-editar-cuenta]');
            if (btnEditar) { abrirEditar(btnEditar.getAttribute('data-editar-cuenta')); return; }
            const btnEliminar = e.target.closest('[data-eliminar-cuenta]');
            if (btnEliminar) { confirmarEliminar(btnEliminar.getAttribute('data-eliminar-cuenta')); return; }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['crm/cuentas'] = { render };
})();

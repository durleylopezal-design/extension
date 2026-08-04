// CRM · Cuentas — instituciones aliadas, empresas convenio y colegios.
(function () {
    const CAMPOS_MODULO = ['Tipo de cuenta', 'Sector', 'Calificación del convenio', 'Número de convenio', 'Cuenta principal', 'Número de empleados'];

    function columnas() {
        return [
            { clave: 'razonSocial', etiqueta: 'Nombre de la cuenta', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.razonSocial}</span>` },
            { clave: 'telefono', etiqueta: 'Teléfono', render: (f) => f.telefono || '—' },
            { clave: 'sitioWeb', etiqueta: 'Sitio web', render: (f) => f.sitioWeb ? `<a href="#" onclick="return false;" style="color: var(--color-primary);">${f.sitioWeb}</a>` : '—' },
            { clave: 'propietario', etiqueta: 'Propietario' },
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
                titulo: 'Información de la dirección — Facturación',
                camposIzquierda: [{ clave: 'facDireccion', etiqueta: 'Dirección', tipo: 'text' }],
                camposDerecha: [{ clave: 'facCiudad', etiqueta: 'Ciudad', tipo: 'text' }],
            },
            {
                titulo: 'Información de la dirección — Envío',
                camposIzquierda: [{ clave: 'envDireccion', etiqueta: 'Dirección', tipo: 'text' }],
                camposDerecha: [{ clave: 'envCiudad', etiqueta: 'Ciudad', tipo: 'text' }],
            },
        ];
    }

    function render(container) {
        const filas = UCLA.data.cuentas.slice();

        function pintar() {
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
                            filas.unshift({
                                id: 'cta-' + Date.now(),
                                razonSocial: datos.razonSocial || 'Sin nombre',
                                telefono: datos.telefono || '',
                                sitioWeb: datos.sitioWeb || '',
                                propietario: datos.propietario || UCLA.state.usuarioActual.nombre,
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        pintar();
    }

    UCLA.views['crm/cuentas'] = { render };
})();

// Alianzas · Empresas Aliadas — listShell sobre UCLA.data.cuentas (misma
// fuente que CRM · Cuentas: no se duplica en un arreglo aparte). El nombre
// enlaza al perfil de detalle (alianzas/empresas/:id, ver aliEmpresaPerfil.js).
(function () {
    const CAMPOS_MODULO = ['Tipo de cuenta', 'Sector', 'Calificación del convenio', 'Sede'];

    function columnas() {
        return [
            { clave: 'razonSocial', etiqueta: 'Empresa / Entidad', render: (c) => `<a href="#/alianzas/empresas/${c.id}" class="font-medium hover:underline" style="color: var(--color-primary);">${c.razonSocial}</a>` },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'sector', etiqueta: 'Sector' },
            { clave: 'numeroConvenio', etiqueta: 'N.° de convenio', render: (c) => c.numeroConvenio || '-' },
            { clave: 'calificacionConvenio', etiqueta: 'Calificación', render: (c) => c.calificacionConvenio ? UCLA.utils.badgeEstado(c.calificacionConvenio) : '-' },
            { clave: 'numeroEmpleados', etiqueta: 'N.° empleados' },
            { clave: 'sedeId', etiqueta: 'Sede' },
            { clave: 'contactoPrincipal', etiqueta: 'Contacto principal', render: (c) => c.contactoPrincipal || '-' },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nueva empresa aliada',
            camposIzquierda: [
                { clave: 'razonSocial', etiqueta: 'Razón social', tipo: 'text', obligatorio: true },
                { clave: 'nit', etiqueta: 'NIT', tipo: 'text' },
                { clave: 'tipo', etiqueta: 'Tipo de cuenta', tipo: 'select', opciones: ['Empresa', 'Entidad pública', 'Colegio', 'ONG'] },
                { clave: 'sector', etiqueta: 'Sector', tipo: 'text' },
            ],
            camposDerecha: [
                { clave: 'telefono', etiqueta: 'Teléfono', tipo: 'tel' },
                { clave: 'sitioWeb', etiqueta: 'Sitio web', tipo: 'text' },
                { clave: 'contactoPrincipal', etiqueta: 'Contacto principal', tipo: 'text' },
                { clave: 'sedeId', etiqueta: 'Sede', tipo: 'select', opciones: ['MDE', 'MZL', 'BOG', 'APD', 'MTR'] },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Empresas Aliadas',
                columnas: columnas(),
                filas: UCLA.data.cuentas,
                filaId: (c) => c.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'razonSocial',
                exportName: 'empresas-aliadas',
                botonPrincipal: {
                    etiqueta: 'Nueva empresa aliada',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva empresa aliada',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.data.cuentas.unshift({
                                id: 'cta-' + Date.now(), razonSocial: datos.razonSocial || 'Sin nombre', nit: datos.nit || '',
                                tipo: datos.tipo || 'Empresa', sector: datos.sector || '', numeroEmpleados: 0, numeroConvenio: '', calificacionConvenio: '',
                                telefono: datos.telefono || '', fax: '', sitioWeb: datos.sitioWeb || '', propietario: UCLA.state.usuarioActual.nombre,
                                contactoPrincipal: datos.contactoPrincipal || '', sedeId: datos.sedeId || 'MDE',
                                dirFacturacion: { direccion: '', ciudad: '' }, dirEnvio: { direccion: '', ciudad: '' },
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        pintar();
    }

    UCLA.views['alianzas/empresas'] = { render };
})();

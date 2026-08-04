// Inventario · Equipos y Materiales — listShell sobre UCLA.data.equipos.
(function () {
    const CAMPOS_MODULO = ['Categoría', 'Sede', 'Estado'];

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Equipo', render: (e) => `<span class="font-medium" style="color: var(--color-text);">${e.nombre}</span>` },
            { clave: 'categoria', etiqueta: 'Categoría' },
            { clave: 'sedeId', etiqueta: 'Sede' },
            { clave: 'cantidad', etiqueta: 'Cantidad total' },
            { clave: 'disponibles', etiqueta: 'Disponibles', render: (e) => e.disponibles === 0 ? `<span style="color: var(--color-danger); font-weight: 600;">0</span>` : e.disponibles },
            { clave: 'estado', etiqueta: 'Estado', render: (e) => UCLA.utils.badgeEstado(e.estado) },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nuevo equipo',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre', tipo: 'text', obligatorio: true },
                { clave: 'categoria', etiqueta: 'Categoría', tipo: 'select', opciones: ['Audiovisual', 'Audio', 'Cómputo', 'Mobiliario'] },
            ],
            camposDerecha: [
                { clave: 'sedeId', etiqueta: 'Sede', tipo: 'select', opciones: ['MDE', 'MZL', 'BOG', 'APD', 'MTR'] },
                { clave: 'cantidad', etiqueta: 'Cantidad total', tipo: 'number' },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Equipos y Materiales',
                columnas: columnas(),
                filas: UCLA.data.equipos,
                filaId: (e) => e.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'equipos',
                botonPrincipal: {
                    etiqueta: 'Nuevo equipo',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nuevo equipo',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            const cantidad = Number(datos.cantidad) || 0;
                            UCLA.data.equipos.unshift({ id: 'eq-' + Date.now(), nombre: datos.nombre || 'Sin nombre', categoria: datos.categoria || 'Audiovisual', cantidad, disponibles: cantidad, sedeId: datos.sedeId || 'MDE', estado: 'Disponible' });
                            pintar();
                        },
                    }),
                },
            });
        }

        pintar();
    }

    UCLA.views['inventario/equipos'] = { render };
})();

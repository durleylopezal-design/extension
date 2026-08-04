// Inventario · Salones y Espacios — listShell sobre UCLA.data.salones.
(function () {
    const CAMPOS_MODULO = ['Sede', 'Tipo', 'Estado'];

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Espacio', render: (s) => `<span class="font-medium" style="color: var(--color-text);">${s.nombre}</span>` },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'sedeId', etiqueta: 'Sede' },
            { clave: 'capacidad', etiqueta: 'Capacidad', render: (s) => `${s.capacidad} personas` },
            { clave: 'estado', etiqueta: 'Estado', render: (s) => UCLA.utils.badgeEstado(s.estado) },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nuevo espacio',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre', tipo: 'text', obligatorio: true },
                { clave: 'tipo', etiqueta: 'Tipo', tipo: 'select', opciones: ['Auditorio', 'Aula', 'Laboratorio', 'Sala de juntas', 'Estudio virtual'] },
            ],
            camposDerecha: [
                { clave: 'sedeId', etiqueta: 'Sede', tipo: 'select', opciones: ['MDE', 'MZL', 'BOG', 'APD', 'MTR'] },
                { clave: 'capacidad', etiqueta: 'Capacidad', tipo: 'number' },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Salones y Espacios',
                columnas: columnas(),
                filas: UCLA.data.salones,
                filaId: (s) => s.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'salones',
                botonPrincipal: {
                    etiqueta: 'Nuevo espacio',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nuevo espacio',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.data.salones.unshift({ id: 'sal-' + Date.now(), nombre: datos.nombre || 'Sin nombre', sedeId: datos.sedeId || 'MDE', capacidad: Number(datos.capacidad) || 0, tipo: datos.tipo || 'Aula', estado: 'Disponible' });
                            pintar();
                        },
                    }),
                },
            });
        }

        pintar();
    }

    UCLA.views['inventario/salones'] = { render };
})();

// Alianzas · Programas en Alianza — listShell sobre UCLA.data.programasAlianza,
// cruzado con cuentaId (empresa) y convenioId (convenio que lo respalda).
(function () {
    const CAMPOS_MODULO = ['Modalidad', 'Estado'];

    function cuentaDe(id) { return UCLA.data.cuentas.find((c) => c.id === id); }
    function convenioDe(id) { return UCLA.data.convenios.find((c) => c.id === id); }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Programa', render: (p) => `<span class="font-medium" style="color: var(--color-text);">${p.nombre}</span>` },
            { clave: 'cuentaId', etiqueta: 'Empresa / Entidad', render: (p) => { const cta = cuentaDe(p.cuentaId); return cta ? `<a href="#/alianzas/empresas/${cta.id}" class="hover:underline" style="color: var(--color-primary);">${cta.razonSocial}</a>` : '—'; } },
            { clave: 'convenioId', etiqueta: 'Convenio', render: (p) => { const cv = convenioDe(p.convenioId); return cv ? cv.nombre : '—'; } },
            { clave: 'modalidad', etiqueta: 'Modalidad' },
            { clave: 'inscritos', etiqueta: 'Inscritos', render: (p) => `${p.inscritos} / ${p.cupoMaximo}` },
            { clave: 'fechaInicio', etiqueta: 'Fecha de inicio', render: (p) => UCLA.utils.formatoFecha(p.fechaInicio) },
            { clave: 'estado', etiqueta: 'Estado', render: (p) => UCLA.utils.badgeEstado(p.estado) },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nuevo programa en alianza',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre del programa', tipo: 'text', obligatorio: true },
                { clave: 'cuenta', etiqueta: 'Empresa / Entidad', tipo: 'select', opciones: UCLA.data.cuentas.map((c) => c.id + ' — ' + c.razonSocial), obligatorio: true },
                { clave: 'convenio', etiqueta: 'Convenio', tipo: 'select', opciones: UCLA.data.convenios.map((c) => c.id + ' — ' + c.nombre) },
            ],
            camposDerecha: [
                { clave: 'modalidad', etiqueta: 'Modalidad', tipo: 'select', opciones: ['Presencial', 'Virtual', 'Híbrido'] },
                { clave: 'cupoMaximo', etiqueta: 'Cupo máximo', tipo: 'number' },
                { clave: 'fechaInicio', etiqueta: 'Fecha de inicio', tipo: 'date' },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Programas en Alianza',
                columnas: columnas(),
                filas: UCLA.data.programasAlianza,
                filaId: (p) => p.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaInicio',
                exportName: 'programas-alianza',
                botonPrincipal: {
                    etiqueta: 'Nuevo programa',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nuevo programa en alianza',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.data.programasAlianza.unshift({
                                id: 'pa-' + Date.now(), cuentaId: (datos.cuenta || '').split(' — ')[0], convenioId: (datos.convenio || '').split(' — ')[0],
                                nombre: datos.nombre || 'Sin nombre', modalidad: datos.modalidad || 'Presencial', cupoMaximo: Number(datos.cupoMaximo) || 20,
                                inscritos: 0, fechaInicio: datos.fechaInicio || new Date().toISOString().slice(0, 10), estado: 'Programado',
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        pintar();
    }

    UCLA.views['alianzas/programas'] = { render };
})();

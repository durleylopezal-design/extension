// Eventos · Registro de Asistentes — listShell filtrable por evento sobre
// UCLA.data.eventosAsistentes. Al inscribir, si el evento ya está en su cupo
// máximo la inscripción entra en Lista de espera (ver también eventos/cupos).
(function () {
    const CAMPOS_MODULO = ['Evento', 'Tipo de público', 'Estado de inscripción'];
    let clickHandler = null;

    function nombreEvento(codigo) {
        const e = UCLA.data.eventos.find((x) => x.codigo === codigo);
        return e ? e.nombre : codigo;
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Nombre', render: (a) => `<span class="font-medium" style="color: var(--color-text);">${a.nombre}</span>` },
            { clave: 'eventoCodigo', etiqueta: 'Evento', render: (a) => nombreEvento(a.eventoCodigo) },
            { clave: 'documento', etiqueta: 'Documento' },
            { clave: 'tipoPublico', etiqueta: 'Tipo de público' },
            { clave: 'email', etiqueta: 'Correo' },
            { clave: 'telefono', etiqueta: 'Teléfono' },
            { clave: 'fechaInscripcion', etiqueta: 'Fecha de inscripción', render: (a) => UCLA.utils.formatoFecha(a.fechaInscripcion) },
            { clave: 'estadoInscripcion', etiqueta: 'Estado', render: (a) => UCLA.utils.badgeEstado(a.estadoInscripcion) },
            {
                clave: 'acciones', etiqueta: 'Acciones',
                render: (a) => a.estadoInscripcion !== 'Cancelado' ? `<button data-cancelar="${a.id}" class="text-xs font-medium hover:underline" style="color: var(--color-danger);">Cancelar inscripción</button>` : '—',
            },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nueva inscripción',
            camposIzquierda: [
                { clave: 'eventoCodigo', etiqueta: 'Evento', tipo: 'select', opciones: UCLA.data.eventos.map((e) => e.codigo + ' — ' + e.nombre), obligatorio: true },
                { clave: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', obligatorio: true },
                { clave: 'documento', etiqueta: 'Documento', tipo: 'text' },
            ],
            camposDerecha: [
                { clave: 'email', etiqueta: 'Correo', tipo: 'email' },
                { clave: 'telefono', etiqueta: 'Teléfono', tipo: 'text' },
                { clave: 'tipoPublico', etiqueta: 'Tipo de público', tipo: 'select', opciones: ['Estudiante', 'Egresado', 'Docente', 'Público externo', 'Empresa aliada'] },
            ],
        }];
    }

    function render(container) {
        let filtroEvento = '';

        function filasFiltradas() {
            return filtroEvento ? UCLA.data.eventosAsistentes.filter((a) => a.eventoCodigo === filtroEvento) : UCLA.data.eventosAsistentes;
        }

        function pintar() {
            container.innerHTML = `<div id="eaLista"></div>`;
            UCLA.components.listShell.render(container.querySelector('#eaLista'), {
                titulo: 'Registro de Asistentes',
                columnas: columnas(),
                filas: filasFiltradas(),
                filaId: (a) => a.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'asistentes-eventos',
                extraToolbarHtml: `
                    <select id="eaFiltroEvento" class="px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">
                        <option value="">Todos los eventos</option>
                        ${UCLA.data.eventos.map((e) => `<option value="${e.codigo}" ${e.codigo === filtroEvento ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                    </select>`,
                onExtraToolbarBind: (c) => {
                    c.querySelector('#eaFiltroEvento').addEventListener('change', (e) => { filtroEvento = e.target.value; pintar(); });
                },
                botonPrincipal: {
                    etiqueta: 'Inscribir asistente',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Inscribir asistente',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            const codigo = (datos.eventoCodigo || '').split(' — ')[0];
                            const evento = UCLA.data.eventos.find((e) => e.codigo === codigo);
                            const confirmado = evento && evento.cupoOcupado < evento.cupoMaximo;
                            if (evento && confirmado) evento.cupoOcupado++;
                            UCLA.data.eventosAsistentes.unshift({
                                id: 'ea-' + Date.now(), eventoCodigo: codigo || (UCLA.data.eventos[0] && UCLA.data.eventos[0].codigo),
                                nombre: datos.nombre || 'Sin nombre', documento: datos.documento || '', email: datos.email || '', telefono: datos.telefono || '',
                                tipoPublico: datos.tipoPublico || 'Público externo', estadoInscripcion: confirmado ? 'Confirmado' : 'Lista de espera',
                                fechaInscripcion: new Date().toISOString().slice(0, 10), asistio: false,
                            });
                            if (!confirmado) UCLA.components.toast.show('El evento está en su cupo máximo: inscripción registrada en lista de espera', 'info');
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const cancelar = e.target.closest('[data-cancelar]');
            if (!cancelar) return;
            const a = UCLA.data.eventosAsistentes.find((x) => x.id === cancelar.getAttribute('data-cancelar'));
            if (!a) return;
            if (a.estadoInscripcion === 'Confirmado') {
                const evento = UCLA.data.eventos.find((ev) => ev.codigo === a.eventoCodigo);
                if (evento) evento.cupoOcupado = Math.max(0, evento.cupoOcupado - 1);
            }
            a.estadoInscripcion = 'Cancelado';
            UCLA.components.toast.show('Inscripción cancelada', 'info');
            pintar();
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['eventos/asistentes'] = { render };
})();

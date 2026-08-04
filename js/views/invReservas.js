// Inventario · Reservas de Recursos — listShell sobre UCLA.data.reservasRecursos,
// cruzando recursoId (salones/equipos) y eventoCodigo (UCLA.data.eventos real).
(function () {
    const CAMPOS_MODULO = ['Tipo de recurso', 'Estado'];
    let clickHandler = null;

    function recursoDe(reserva) {
        const fuente = reserva.recursoTipo === 'salon' ? UCLA.data.salones : UCLA.data.equipos;
        return fuente.find((r) => r.id === reserva.recursoId);
    }
    function eventoDe(codigo) { return UCLA.data.eventos.find((e) => e.codigo === codigo); }

    function opcionesRecurso() {
        return [
            ...UCLA.data.salones.map((s) => `salon:${s.id} - Salón - ${s.nombre}`),
            ...UCLA.data.equipos.map((e) => `equipo:${e.id} - Equipo - ${e.nombre}`),
        ];
    }

    function columnas() {
        return [
            { clave: 'recurso', etiqueta: 'Recurso', render: (r) => { const rec = recursoDe(r); return `<span class="font-medium" style="color: var(--color-text);"><i class="fas ${r.recursoTipo === 'salon' ? 'fa-door-open' : 'fa-box'} text-xs" style="color: var(--color-text-muted);"></i> ${rec ? rec.nombre : '-'}</span>`; } },
            { clave: 'eventoCodigo', etiqueta: 'Evento asociado', render: (r) => { const e = eventoDe(r.eventoCodigo); return e ? e.nombre : '-'; } },
            { clave: 'fecha', etiqueta: 'Fecha', render: (r) => UCLA.utils.formatoFecha(r.fecha) },
            { clave: 'horario', etiqueta: 'Horario', render: (r) => `${r.horaInicio} - ${r.horaFin}` },
            { clave: 'estado', etiqueta: 'Estado', render: (r) => UCLA.utils.badgeEstado(r.estado) },
            {
                clave: 'acciones', etiqueta: 'Acciones',
                render: (r) => r.estado === 'Pendiente' ? `<div class="flex gap-2">
                    <button data-confirmar="${r.id}" class="text-xs font-medium hover:underline" style="color: var(--color-success);">Confirmar</button>
                    <button data-cancelar="${r.id}" class="text-xs font-medium hover:underline" style="color: var(--color-danger);">Cancelar</button>
                </div>` : '-',
            },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nueva reserva',
            camposIzquierda: [
                { clave: 'recurso', etiqueta: 'Recurso', tipo: 'select', opciones: opcionesRecurso(), obligatorio: true },
                { clave: 'evento', etiqueta: 'Evento asociado (opcional)', tipo: 'select', opciones: ['Sin evento asociado', ...UCLA.data.eventos.map((e) => e.codigo + ' - ' + e.nombre)] },
            ],
            camposDerecha: [
                { clave: 'fecha', etiqueta: 'Fecha', tipo: 'date', obligatorio: true },
                { clave: 'horaInicio', etiqueta: 'Hora de inicio', tipo: 'time' },
                { clave: 'horaFin', etiqueta: 'Hora de fin', tipo: 'time' },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Reservas de Recursos',
                columnas: columnas(),
                filas: UCLA.data.reservasRecursos,
                filaId: (r) => r.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fecha',
                exportName: 'reservas-recursos',
                botonPrincipal: {
                    etiqueta: 'Nueva reserva',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva reserva de recurso',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            const [tipoId, ...resto] = (datos.recurso || '').split(' - ');
                            const [recursoTipo, recursoId] = (tipoId || '').split(':');
                            const eventoCodigo = datos.evento && datos.evento !== 'Sin evento asociado' ? datos.evento.split(' - ')[0] : null;
                            UCLA.data.reservasRecursos.unshift({
                                id: 'res-' + Date.now(), recursoTipo: recursoTipo || 'salon', recursoId: recursoId || '', eventoCodigo,
                                fecha: datos.fecha || new Date().toISOString().slice(0, 10), horaInicio: datos.horaInicio || '08:00', horaFin: datos.horaFin || '09:00', estado: 'Pendiente',
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const confirmar = e.target.closest('[data-confirmar]');
            const cancelar = e.target.closest('[data-cancelar]');
            if (confirmar) {
                const r = UCLA.data.reservasRecursos.find((x) => x.id === confirmar.getAttribute('data-confirmar'));
                if (r) { r.estado = 'Confirmada'; UCLA.components.toast.show('Reserva confirmada', 'success'); pintar(); }
            } else if (cancelar) {
                const r = UCLA.data.reservasRecursos.find((x) => x.id === cancelar.getAttribute('data-cancelar'));
                if (r) { r.estado = 'Cancelada'; UCLA.components.toast.show('Reserva cancelada', 'info'); pintar(); }
            }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['inventario/reservas'] = { render };
})();

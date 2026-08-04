// Certificados · Historial de Emitidos — listShell sobre
// UCLA.data.certificadosEmitidos (misma fuente que certificados/verificacion).
(function () {
    const CAMPOS_MODULO = ['Estado'];
    let clickHandler = null;

    function eventoDe(codigo) { return UCLA.data.eventos.find((e) => e.codigo === codigo); }

    function columnas() {
        return [
            { clave: 'destinatario', etiqueta: 'Destinatario', render: (c) => `<span class="font-medium" style="color: var(--color-text);">${c.destinatario}</span>` },
            { clave: 'eventoCodigo', etiqueta: 'Evento', render: (c) => { const e = eventoDe(c.eventoCodigo); return e ? e.nombre : c.eventoCodigo; } },
            { clave: 'codigoVerificacion', etiqueta: 'Código de verificación' },
            { clave: 'fechaEmision', etiqueta: 'Fecha de emisión', render: (c) => UCLA.utils.formatoFecha(c.fechaEmision) },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => UCLA.utils.badgeEstado(c.estado) },
            {
                clave: 'acciones', etiqueta: 'Acciones',
                render: (c) => `<div class="flex gap-2">
                    <button data-reenviar="${c.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Reenviar</button>
                    ${c.estado === 'Emitido' ? `<button data-revocar="${c.id}" class="text-xs font-medium hover:underline" style="color: var(--color-danger);">Revocar</button>` : ''}
                </div>`,
            },
        ];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Historial de Emitidos',
                columnas: columnas(),
                filas: UCLA.data.certificadosEmitidos,
                filaId: (c) => c.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaEmision',
                exportName: 'certificados-emitidos',
                botonPrincipal: { etiqueta: 'Emitir certificados', onClick: () => UCLA.router.navigate('certificados/emision') },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const revocar = e.target.closest('[data-revocar]');
            const reenviar = e.target.closest('[data-reenviar]');
            if (revocar) {
                const c = UCLA.data.certificadosEmitidos.find((x) => x.id === revocar.getAttribute('data-revocar'));
                if (c) { c.estado = 'Revocado'; UCLA.components.toast.show('Certificado revocado', 'info'); pintar(); }
            } else if (reenviar) {
                const c = UCLA.data.certificadosEmitidos.find((x) => x.id === reenviar.getAttribute('data-reenviar'));
                if (c) UCLA.components.toast.show(`Certificado reenviado a ${c.destinatario} (simulado)`, 'success');
            }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['certificados/historial'] = { render };
})();

// Admin · Auditoría — listShell de solo lectura sobre
// UCLA.data.registrosAuditoria, que los flujos de aprobación reales
// (solicitudes/admision, solicitudes/becas, usuarios, configuración...)
// alimentan en vivo vía UCLA.utils.registrarAuditoria().
(function () {
    const CAMPOS_MODULO = ['Módulo'];

    function columnas() {
        return [
            { clave: 'fecha', etiqueta: 'Fecha y hora', render: (a) => a.fecha.replace('T', ' ') },
            { clave: 'usuario', etiqueta: 'Usuario' },
            { clave: 'accion', etiqueta: 'Acción', render: (a) => `<span class="font-medium" style="color: var(--color-text);">${a.accion}</span>` },
            { clave: 'modulo', etiqueta: 'Módulo' },
            { clave: 'detalle', etiqueta: 'Detalle', render: (a) => `<span style="color: var(--color-text-muted);">${a.detalle}</span>` },
        ];
    }

    function render(container) {
        UCLA.components.listShell.render(container, {
            titulo: 'Auditoría y Registros de Actividad',
            columnas: columnas(),
            filas: UCLA.data.registrosAuditoria,
            filaId: (a) => a.id,
            camposModulo: CAMPOS_MODULO,
            campoOrden: 'fecha',
            exportName: 'auditoria',
            botonPrincipal: { etiqueta: 'Actualizar', onClick: () => render(container) },
        });
    }

    UCLA.views['admin/auditoria'] = { render };
})();

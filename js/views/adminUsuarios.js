// Admin · Usuarios — listShell sobre UCLA.data.usuariosSistema.
(function () {
    const CAMPOS_MODULO = ['Rol', 'Sede', 'Estado'];
    let clickHandler = null;

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Nombre', render: (u) => `<span class="font-medium" style="color: var(--color-text);">${u.nombre}</span>` },
            { clave: 'correo', etiqueta: 'Correo' },
            { clave: 'rol', etiqueta: 'Rol' },
            { clave: 'sedeId', etiqueta: 'Sede' },
            { clave: 'ultimoAcceso', etiqueta: 'Último acceso', render: (u) => UCLA.utils.formatoFecha(u.ultimoAcceso) },
            { clave: 'estado', etiqueta: 'Estado', render: (u) => UCLA.utils.badgeEstado(u.estado) },
            { clave: 'acciones', etiqueta: 'Acciones', render: (u) => `<button data-toggle="${u.id}" class="text-xs font-medium hover:underline" style="color: ${u.estado === 'Activo' ? 'var(--color-danger)' : 'var(--color-success)'};">${u.estado === 'Activo' ? 'Desactivar' : 'Activar'}</button>` },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Invitar usuario',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', obligatorio: true },
                { clave: 'correo', etiqueta: 'Correo institucional', tipo: 'email', obligatorio: true },
            ],
            camposDerecha: [
                { clave: 'rol', etiqueta: 'Rol', tipo: 'select', opciones: ['Administrador', 'Coordinador', 'Asesor', 'Auxiliar'] },
                { clave: 'sedeId', etiqueta: 'Sede', tipo: 'select', opciones: ['MDE', 'MZL', 'BOG', 'APD', 'MTR'] },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Usuarios',
                columnas: columnas(),
                filas: UCLA.data.usuariosSistema,
                filaId: (u) => u.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'usuarios',
                botonPrincipal: {
                    etiqueta: 'Invitar usuario',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Invitar usuario',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.data.usuariosSistema.unshift({ id: 'usr-' + Date.now(), nombre: datos.nombre || 'Sin nombre', correo: datos.correo || '', rol: datos.rol || 'Asesor', sedeId: datos.sedeId || 'MDE', estado: 'Activo', ultimoAcceso: null });
                            UCLA.utils.registrarAuditoria({ accion: 'Invitó nuevo usuario', modulo: 'Administración', detalle: `${datos.correo || ''} — rol ${datos.rol || 'Asesor'}` });
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-toggle]');
            if (!btn) return;
            const u = UCLA.data.usuariosSistema.find((x) => x.id === btn.getAttribute('data-toggle'));
            if (u) {
                u.estado = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
                UCLA.utils.registrarAuditoria({ accion: u.estado === 'Activo' ? 'Activó usuario' : 'Desactivó usuario', modulo: 'Administración', detalle: u.correo });
                UCLA.components.toast.show(`Usuario ${u.estado === 'Activo' ? 'activado' : 'desactivado'}`, 'info');
                pintar();
            }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['admin/usuarios'] = { render };
})();

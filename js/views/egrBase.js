// Egresados · Base de datos — listShell; el nombre enlaza al perfil de egreso.
(function () {
    const CAMPOS_MODULO = ['Programa', 'Cohorte', 'Sede', 'Situación laboral', 'Año de grado', 'Sector de la empresa', 'Antigüedad de la última actualización'];

    let clickHandler = null;
    const DOCE_MESES_MS = 365 * 24 * 60 * 60 * 1000;
    const HOY = new Date('2026-08-03');

    function desactualizado(fecha) {
        if (!fecha) return true;
        return (HOY - new Date(fecha)) > DOCE_MESES_MS;
    }

    function columnas() {
        return [
            {
                clave: 'nombre', etiqueta: 'Nombre',
                render: (f) => `<a href="#/egresados/perfil/${f.id}" class="font-medium hover:underline" style="color: var(--color-primary);">${f.nombre}</a>${desactualizado(f.ultimaActualizacion) ? ' <i class="fas fa-triangle-exclamation text-xs" style="color: var(--color-danger);" title="Datos desactualizados"></i>' : ''}`,
            },
            { clave: 'programa', etiqueta: 'Programa' },
            { clave: 'cohorte', etiqueta: 'Cohorte' },
            { clave: 'fechaGrado', etiqueta: 'Fecha de grado', render: (f) => UCLA.utils.formatoFecha(f.fechaGrado) },
            { clave: 'sedeId', etiqueta: 'Sede' },
            { clave: 'situacionLaboral', etiqueta: 'Situación laboral', render: (f) => UCLA.utils.badgeEstado(f.situacionLaboral) },
            { clave: 'empresaActual', etiqueta: 'Empresa actual', render: (f) => f.empresaActual || '-' },
            { clave: 'correo', etiqueta: 'Correo' },
            {
                clave: 'ultimaActualizacion', etiqueta: 'Última actualización',
                render: (f) => `<span style="${desactualizado(f.ultimaActualizacion) ? 'color: var(--color-danger); font-weight: 600;' : ''}">${UCLA.utils.formatoFecha(f.ultimaActualizacion)}</span>`,
            },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `
                <button data-editar-egresado="${f.id}" class="mr-2" style="color: var(--color-primary);" title="Editar"><i class="fas fa-pen text-xs"></i></button>
                <button data-eliminar-egresado="${f.id}" style="color: var(--color-danger);" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>` },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Información del egresado',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', obligatorio: true },
                { clave: 'documento', etiqueta: 'Documento', tipo: 'text' },
                { clave: 'programa', etiqueta: 'Programa', tipo: 'text', obligatorio: true },
                { clave: 'cohorte', etiqueta: 'Cohorte', tipo: 'text', placeholder: '2026-1' },
                { clave: 'fechaGrado', etiqueta: 'Fecha de grado', tipo: 'date' },
            ],
            camposDerecha: [
                { clave: 'sedeId', etiqueta: 'Sede', tipo: 'select', opciones: UCLA.state.SEDES.map((s) => s.codigo) },
                { clave: 'correo', etiqueta: 'Correo', tipo: 'email' },
                { clave: 'telefono', etiqueta: 'Teléfono', tipo: 'tel' },
                { clave: 'ciudad', etiqueta: 'Ciudad', tipo: 'text' },
                { clave: 'situacionLaboral', etiqueta: 'Situación laboral', tipo: 'select', opciones: ['Empleado', 'Independiente', 'Desempleado', 'Estudiando', 'Sin dato'] },
            ],
        }];
    }

    function datosDesdeFormulario(datos) {
        return {
            nombre: datos.nombre || 'Sin nombre',
            documento: datos.documento || '', programa: datos.programa || '', cohorte: datos.cohorte || '',
            fechaGrado: datos.fechaGrado || '', sedeId: datos.sedeId || 'MDE',
            situacionLaboral: datos.situacionLaboral || 'Sin dato',
            ultimaActualizacion: new Date().toISOString().slice(0, 10), correo: datos.correo || '',
            telefono: datos.telefono || '', ciudad: datos.ciudad || '',
        };
    }

    function render(container) {
        function abrirEditar(id) {
            const egresado = UCLA.store.obtener('egresados', id);
            if (!egresado) return;
            UCLA.components.recordForm.abrir({
                titulo: 'Editar egresado',
                secciones: secciones(),
                datosIniciales: egresado,
                esEdicion: true,
                onGuardar: (datos) => {
                    UCLA.store.actualizar('egresados', id, datosDesdeFormulario(datos));
                    pintar();
                },
            });
        }

        function confirmarEliminar(id) {
            const egresado = UCLA.store.obtener('egresados', id);
            if (!egresado) return;
            UCLA.components.confirmModal.abrir({
                titulo: 'Eliminar egresado',
                mensaje: `¿Eliminar a "${egresado.nombre}"? Esta acción no se puede deshacer.`,
                onConfirmar: () => {
                    UCLA.store.eliminar('egresados', id);
                    UCLA.components.toast.show('Egresado eliminado', 'success');
                    pintar();
                },
            });
        }

        function pintar() {
            const filas = UCLA.data.egresados;
            UCLA.components.listShell.render(container, {
                titulo: 'Base de Datos de Egresados',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'egresados',
                botonPrincipal: {
                    etiqueta: 'Crear egresado',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nuevo egresado',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.store.crear('egresados', Object.assign(datosDesdeFormulario(datos), {
                                contactoId: null, promedio: null, empresaActual: '', cargo: '', sector: '',
                                fechaVinculacion: '', rangoSalarial: '', empleoAfin: false, mesesHastaVinculacion: null,
                            }));
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btnEditar = e.target.closest('[data-editar-egresado]');
            if (btnEditar) { abrirEditar(btnEditar.getAttribute('data-editar-egresado')); return; }
            const btnEliminar = e.target.closest('[data-eliminar-egresado]');
            if (btnEliminar) { confirmarEliminar(btnEliminar.getAttribute('data-eliminar-egresado')); return; }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['egresados/base'] = { render };
})();

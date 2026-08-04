// CRM · Oportunidades de matrícula — Kanban por defecto (kanbanBoard.js)
// sobre listShell, con vista de lista disponible desde el selector de tipos
// de vista. Reemplaza al antiguo js/views/crm.js.
(function () {
    const ETAPAS = [
        { id: 'contacto-inicial', etiqueta: 'Contacto Inicial', pct: 10 },
        { id: 'interesado', etiqueta: 'Interesado, Requiere Información', pct: 20 },
        { id: 'propuesta-enviada', etiqueta: 'Propuesta de Programa Enviada', pct: 40 },
        { id: 'documentacion-revision', etiqueta: 'Documentación en Revisión', pct: 60 },
        { id: 'matricula-confirmada', etiqueta: 'Matrícula Confirmada', pct: 100 },
    ];

    const CAMPOS_MODULO = ['Duración del proceso', 'Etiqueta', 'Fase', 'Fecha de cierre estimada', 'Sede'];

    function tarjetaHtml(f) {
        return `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: var(--color-primary-50); color: var(--color-primary);">${f.sedeId}</span>
                ${f.etiqueta ? `<span class="text-xs font-bold animate-pulse" style="color: var(--color-danger);">${f.etiqueta}</span>` : ''}
            </div>
            <h5 class="font-bold text-gray-800 mb-1">${f.nombre}</h5>
            <p class="text-sm text-gray-600 mb-2">${f.descripcion}</p>
            <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-gray-700">${UCLA.utils.formatoCOP(f.valor)}</span>
                <span class="text-gray-500"><i class="far fa-calendar"></i> ${f.fecha}</span>
            </div>
            <div class="mt-3 flex items-center gap-2">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(f.propietario)}&background=random" class="w-6 h-6 rounded-full">
                <span class="text-xs text-gray-500">${f.propietario}</span>
            </div>`;
    }

    function columnasLista() {
        return [
            { clave: 'nombre', etiqueta: 'Nombre', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.nombre}</span>` },
            { clave: 'descripcion', etiqueta: 'Descripción' },
            { clave: 'etapa', etiqueta: 'Etapa', render: (f) => ETAPAS.find((e) => e.id === f.etapa)?.etiqueta || f.etapa },
            { clave: 'valor', etiqueta: 'Valor', render: (f) => UCLA.utils.formatoCOP(f.valor) },
            { clave: 'propietario', etiqueta: 'Propietario' },
        ];
    }

    function render(container) {
        const filas = UCLA.data.oportunidades.slice();

        UCLA.components.listShell.render(container, {
            titulo: 'Oportunidades de Matrícula',
            vistaInicial: 'kanban',
            columnas: columnasLista(),
            filas,
            filaId: (f) => f.id,
            camposModulo: CAMPOS_MODULO,
            campoOrden: 'nombre',
            exportName: 'oportunidades',
            extraToolbarHtml: `
                <div class="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">
                    <span class="font-semibold uppercase text-xs" style="color: var(--color-text-muted);">STAGEVIEW</span>
                    <button id="oppEditarFlujo" title="Editar flujo de etapas" class="ml-2" style="color: var(--color-primary);"><i class="fas fa-pen text-xs"></i></button>
                </div>`,
            onExtraToolbarBind: (root) => {
                root.querySelector('#oppEditarFlujo')?.addEventListener('click', () => {
                    UCLA.components.toast.show('Edición del flujo de etapas - función simulada', 'info');
                });
            },
            renderKanban: (cuerpo) => {
                UCLA.components.kanbanBoard.render(cuerpo, {
                    columnas: ETAPAS,
                    filas,
                    filaId: (f) => f.id,
                    renderTarjeta: tarjetaHtml,
                    onMover: (id, nuevaEtapa) => {
                        const opp = filas.find((f) => f.id === id);
                        if (opp) opp.etapa = nuevaEtapa;
                        UCLA.components.toast.show('Oportunidad actualizada exitosamente', 'success');
                    },
                });
            },
            botonPrincipal: {
                etiqueta: 'Crear Oportunidad',
                onClick: () => UCLA.components.modal.open('nuevaOportunidadModal'),
            },
        });
    }

    UCLA.views['crm/oportunidades'] = { render };

    // 'crm/actividades' ya no es un alias del shell de tabs (fase anterior):
    // redirige al nuevo submódulo de Actividades.
    UCLA.views['crm/actividades'] = { render: () => UCLA.router.navigate('actividades/tareas') };
})();

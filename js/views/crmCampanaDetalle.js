// CRM · Detalle de Campaña (#/crm/campanas/:id) — usa detailPanel.js. Las
// pestañas de Leads/Oportunidades/Actividades filtran en vivo por
// campana.id sobre UCLA.data.leads/oportunidades/tareas/reuniones/llamadas
// (mismo criterio de reutilización que egresados/perfil/:id).
(function () {
    function roi(c) {
        if (!c.costos) return null;
        return (c.ingresos - c.costos) / c.costos;
    }

    function filaDato(etiqueta, valor) {
        return `<div><p class="text-xs font-medium" style="color: var(--color-text-muted);">${etiqueta}</p><p style="color: var(--color-text);">${valor}</p></div>`;
    }

    function render(container, params) {
        const campana = UCLA.data.campanas.find((c) => c.id === params.id);

        if (!campana) {
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p style="color: var(--color-text-muted);">Campaña no encontrada.</p>
                    <button id="volverCampanas" class="btn-primary mt-4">Volver a Campañas</button>
                </div>`;
            container.querySelector('#volverCampanas').addEventListener('click', () => UCLA.router.navigate('crm/campanas'));
            return;
        }

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = campana.nombre;
        document.title = campana.nombre + ' · UCLA Extensión CRM';

        const leadsRelacionados = () => UCLA.data.leads.filter((l) => l.campanaId === campana.id);
        const oportunidadesRelacionadas = () => UCLA.data.oportunidades.filter((o) => o.campanaId === campana.id);
        const actividadesRelacionadas = () => ({
            tareas: UCLA.data.tareas.filter((t) => t.campanaId === campana.id),
            reuniones: UCLA.data.reuniones.filter((r) => r.campanaId === campana.id),
            llamadas: UCLA.data.llamadas.filter((l) => l.campanaId === campana.id),
        });
        const valorRoi = roi(campana);

        UCLA.components.detailPanel.render(container, {
            encabezado: {
                icono: 'fa-bullhorn',
                titulo: campana.nombre,
                subtitulo: `${campana.tipo} · Responsable: ${campana.responsable}`,
                badges: [
                    { texto: campana.estado, color: UCLA.utils.colorEstado(campana.estado) },
                    { texto: valorRoi === null ? 'ROI: -' : `ROI: ${(valorRoi * 100).toFixed(0)}%`, color: valorRoi === null ? 'var(--color-neutral-dark, #6B6F72)' : valorRoi >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
                ],
                acciones: [
                    { etiqueta: 'Editar', onClick: () => UCLA.components.toast.show('Edición de campaña - función simulada', 'info') },
                ],
            },
            pestanas: [
                {
                    id: 'resumen', etiqueta: 'Resumen',
                    render: (c) => {
                        c.innerHTML = `
                            <div class="space-y-4">
                                <div class="bg-white rounded-xl shadow-lg p-6">
                                    <h4 class="text-sm font-bold uppercase tracking-wide mb-3" style="color: var(--color-primary);">Planeación</h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        ${filaDato('Objetivo', campana.objetivo || '-')}
                                        ${filaDato('Público objetivo', campana.publicoObjetivo || '-')}
                                        ${filaDato('Segmentación', campana.segmentacion.join(', ') || '-')}
                                        ${filaDato('Fecha inicio', campana.fechaInicio ? UCLA.utils.formatoFecha(campana.fechaInicio) : '-')}
                                        ${filaDato('Fecha fin', campana.fechaFin ? UCLA.utils.formatoFecha(campana.fechaFin) : '-')}
                                        ${filaDato('Presupuesto', UCLA.utils.formatoCOP(campana.presupuesto))}
                                    </div>
                                </div>
                                <div class="bg-white rounded-xl shadow-lg p-6">
                                    <h4 class="text-sm font-bold uppercase tracking-wide mb-3" style="color: var(--color-primary);">Ejecución</h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        ${filaDato('Canales', campana.canales.join(', ') || '-')}
                                        ${filaDato('Frecuencia', campana.frecuencia || '-')}
                                        ${filaDato('CTA', campana.cta || '-')}
                                        ${filaDato('Landing page', campana.landingPage || '-')}
                                        ${filaDato('Contenido', campana.contenido || '-')}
                                        ${filaDato('Contenidos asociados', campana.contenidos.join(', ') || '-')}
                                        ${filaDato('Productos/Servicios', campana.productos.join(', ') || '-')}
                                    </div>
                                </div>
                                <div class="bg-white rounded-xl shadow-lg p-6">
                                    <h4 class="text-sm font-bold uppercase tracking-wide mb-3" style="color: var(--color-primary);">Resultados</h4>
                                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                        ${filaDato('Alcance', campana.alcance.toLocaleString('es-CO'))}
                                        ${filaDato('Interacciones', campana.interacciones.toLocaleString('es-CO'))}
                                        ${filaDato('Leads', campana.leads.toLocaleString('es-CO'))}
                                        ${filaDato('Leads calificados', campana.leadsCalificados.toLocaleString('es-CO'))}
                                        ${filaDato('Oportunidades', campana.oportunidades.toLocaleString('es-CO'))}
                                        ${filaDato('Ventas', campana.ventas.toLocaleString('es-CO'))}
                                        ${filaDato('Ingresos', UCLA.utils.formatoCOP(campana.ingresos))}
                                        ${filaDato('Costos', UCLA.utils.formatoCOP(campana.costos))}
                                    </div>
                                </div>
                                <div class="bg-white rounded-xl shadow-lg p-6">
                                    <h4 class="text-sm font-bold uppercase tracking-wide mb-3" style="color: var(--color-primary);">Auditoría</h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        ${filaDato('Creada por', `${campana.usuarioCreador} · ${UCLA.utils.formatoFecha(campana.fechaCreacion)}`)}
                                        ${filaDato('Última modificación', `${campana.usuarioModificador} · ${UCLA.utils.formatoFecha(campana.fechaModificacion)}`)}
                                    </div>
                                </div>
                            </div>`;
                    },
                },
                {
                    id: 'leads', etiqueta: `Leads relacionados (${leadsRelacionados().length})`,
                    render: (c) => {
                        const lista = leadsRelacionados();
                        c.innerHTML = lista.length ? `
                            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                                <table class="w-full text-sm">
                                    <thead class="table-head-branded"><tr>
                                        <th class="px-4 py-3 text-left">Nombre</th><th class="px-4 py-3 text-left">Programa de interés</th><th class="px-4 py-3 text-left">Estado</th><th class="px-4 py-3 text-left">Propietario</th>
                                    </tr></thead>
                                    <tbody class="divide-y divide-gray-200">
                                        ${lista.map((l) => `<tr><td class="px-4 py-3"><a href="#/crm/leads" class="hover:underline" style="color: var(--color-primary);">${l.nombre} ${l.apellidos}</a></td><td class="px-4 py-3">${l.programaInteres}</td><td class="px-4 py-3">${UCLA.utils.badgeEstado(l.estado)}</td><td class="px-4 py-3">${l.propietario}</td></tr>`).join('')}
                                    </tbody>
                                </table>
                            </div>` : `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Sin leads asociados a esta campaña todavía.</div>`;
                    },
                },
                {
                    id: 'oportunidades', etiqueta: `Oportunidades relacionadas (${oportunidadesRelacionadas().length})`,
                    render: (c) => {
                        const lista = oportunidadesRelacionadas();
                        c.innerHTML = lista.length ? `
                            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                                <table class="w-full text-sm">
                                    <thead class="table-head-branded"><tr>
                                        <th class="px-4 py-3 text-left">Nombre</th><th class="px-4 py-3 text-left">Etapa</th><th class="px-4 py-3 text-left">Valor</th><th class="px-4 py-3 text-left">Propietario</th>
                                    </tr></thead>
                                    <tbody class="divide-y divide-gray-200">
                                        ${lista.map((o) => `<tr><td class="px-4 py-3"><a href="#/crm/oportunidades" class="hover:underline" style="color: var(--color-primary);">${o.nombre}</a></td><td class="px-4 py-3">${o.etapa}</td><td class="px-4 py-3">${UCLA.utils.formatoCOP(o.valor)}</td><td class="px-4 py-3">${o.propietario}</td></tr>`).join('')}
                                    </tbody>
                                </table>
                            </div>` : `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Sin oportunidades asociadas a esta campaña todavía.</div>`;
                    },
                },
                {
                    id: 'actividades', etiqueta: 'Actividades relacionadas',
                    render: (c) => {
                        const { tareas, reuniones, llamadas } = actividadesRelacionadas();
                        const total = tareas.length + reuniones.length + llamadas.length;
                        if (!total) {
                            c.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Sin actividades asociadas a esta campaña todavía.</div>`;
                            return;
                        }
                        const grupo = (titulo, icono, items, render) => !items.length ? '' : `
                            <div class="bg-white rounded-xl shadow-lg p-6">
                                <h4 class="text-sm font-bold uppercase tracking-wide mb-3" style="color: var(--color-primary);"><i class="fas ${icono} mr-2"></i>${titulo}</h4>
                                <div class="space-y-2 text-sm">${items.map(render).join('')}</div>
                            </div>`;
                        c.innerHTML = `
                            <div class="space-y-4">
                                ${grupo('Tareas', 'fa-list-check', tareas, (t) => `<div class="flex justify-between border-b py-2" style="border-color: var(--color-border);"><span>${t.asunto}</span><span style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(t.fechaVencimiento)}</span></div>`)}
                                ${grupo('Reuniones', 'fa-users', reuniones, (r) => `<div class="flex justify-between border-b py-2" style="border-color: var(--color-border);"><span>${r.titulo}</span><span style="color: var(--color-text-muted);">${r.inicio.replace('T', ' ')}</span></div>`)}
                                ${grupo('Llamadas', 'fa-phone', llamadas, (l) => `<div class="flex justify-between border-b py-2" style="border-color: var(--color-border);"><span>${l.asunto}</span><span style="color: var(--color-text-muted);">${l.inicio.replace('T', ' ')}</span></div>`)}
                            </div>`;
                    },
                },
            ],
        });
    }

    UCLA.views['crm/campanas/:id'] = { render };
})();

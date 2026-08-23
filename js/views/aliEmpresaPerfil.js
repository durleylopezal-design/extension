// Alianzas · Perfil de empresa aliada (#/alianzas/empresas/:id) — detailPanel
// sobre el mismo registro de UCLA.data.cuentas, con sus convenios, programas e
// interacciones asociadas.
(function () {
    function render(container, params) {
        const cuenta = UCLA.data.cuentas.find((c) => c.id === params.id);

        if (!cuenta) {
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p style="color: var(--color-text-muted);">Empresa aliada no encontrada.</p>
                    <button id="volverEmpresas" class="btn-primary mt-4">Volver a Empresas Aliadas</button>
                </div>`;
            container.querySelector('#volverEmpresas').addEventListener('click', () => UCLA.router.navigate('alianzas/empresas'));
            return;
        }

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = cuenta.razonSocial;
        document.title = cuenta.razonSocial + ' · UCLA Extensión CRM';

        const convenios = () => UCLA.data.convenios.filter((c) => c.cuentaId === cuenta.id);
        const programas = () => UCLA.data.programasAlianza.filter((p) => p.cuentaId === cuenta.id);
        const interacciones = () => UCLA.data.interaccionesAlianza.filter((i) => i.cuentaId === cuenta.id);

        UCLA.components.detailPanel.render(container, {
            encabezado: {
                icono: 'fa-building',
                titulo: cuenta.razonSocial,
                subtitulo: `${cuenta.tipo || '-'} · ${cuenta.sector || '-'} · Sede ${cuenta.sedeId || '-'}`,
                badges: [
                    ...(cuenta.calificacionConvenio ? [{ texto: 'Calificación ' + cuenta.calificacionConvenio, color: UCLA.utils.colorEstado(cuenta.calificacionConvenio) }] : []),
                    ...(convenios().length ? [{ texto: convenios().length + ' convenio(s)', color: 'var(--color-primary)' }] : []),
                ],
                acciones: [
                    { etiqueta: 'Editar', onClick: () => UCLA.components.toast.show('Edición de perfil: función simulada', 'info') },
                    { etiqueta: 'Registrar interacción', principal: true, onClick: () => abrirRegistrarInteraccion(cuenta, () => UCLA.router.navigate('alianzas/empresas/' + cuenta.id)) },
                ],
            },
            pestanas: [
                {
                    id: 'generales', etiqueta: 'Datos generales',
                    render: (c) => {
                        c.innerHTML = `
                            <div class="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                ${filaDato('NIT', cuenta.nit || '-')}
                                ${filaDato('Teléfono', cuenta.telefono || '-')}
                                ${filaDato('Sitio web', cuenta.sitioWeb || '-')}
                                ${filaDato('N.° de convenio', cuenta.numeroConvenio || '-')}
                                ${filaDato('N.° de empleados', cuenta.numeroEmpleados ?? '-')}
                                ${filaDato('Contacto principal', cuenta.contactoPrincipal || '-')}
                                ${filaDato('Propietario', cuenta.propietario || '-')}
                                ${filaDato('Ciudad de facturación', cuenta.dirFacturacion?.ciudad || '-')}
                            </div>`;
                    },
                },
                {
                    id: 'convenios', etiqueta: 'Convenios asociados',
                    render: (c) => {
                        const lista = convenios();
                        c.innerHTML = lista.length ? `
                            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead><tr style="border-bottom: 2px solid var(--color-primary-100);"><th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Convenio</th><th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Tipo</th><th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Vigencia hasta</th></tr></thead>
                                    <tbody>${lista.map((cv) => `<tr style="border-bottom: 1px solid var(--color-border);"><td class="px-4 py-3">${cv.nombre}</td><td class="px-4 py-3">${cv.tipo}</td><td class="px-4 py-3">${UCLA.utils.formatoFecha(cv.fechaFin)}</td></tr>`).join('')}</tbody>
                                </table>
                                </div>
                            </div>` : `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Sin convenios asociados.</div>`;
                    },
                },
                {
                    id: 'programas', etiqueta: 'Programas en alianza',
                    render: (c) => {
                        const lista = programas();
                        c.innerHTML = lista.length ? `
                            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead><tr style="border-bottom: 2px solid var(--color-primary-100);"><th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Programa</th><th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Modalidad</th><th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Inscritos</th><th class="px-4 py-3 text-left text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Estado</th></tr></thead>
                                    <tbody>${lista.map((p) => `<tr style="border-bottom: 1px solid var(--color-border);"><td class="px-4 py-3">${p.nombre}</td><td class="px-4 py-3">${p.modalidad}</td><td class="px-4 py-3">${p.inscritos} / ${p.cupoMaximo}</td><td class="px-4 py-3">${UCLA.utils.badgeEstado(p.estado)}</td></tr>`).join('')}</tbody>
                                </table>
                                </div>
                            </div>` : `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Sin programas en alianza registrados.</div>`;
                    },
                },
                {
                    id: 'historial', etiqueta: 'Historial de interacciones',
                    render: (c) => UCLA.components.detailPanel.renderTimeline(c, interacciones()),
                },
            ],
        });
    }

    function filaDato(etiqueta, valor) {
        return `<div><p class="text-xs font-medium" style="color: var(--color-text-muted);">${etiqueta}</p><p style="color: var(--color-text);">${valor}</p></div>`;
    }

    function abrirRegistrarInteraccion(cuenta, alGuardar) {
        let modal = document.getElementById('modalInteraccionAlianza');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalInteraccionAlianza';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-ia-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 class="text-lg font-bold mb-4" style="color: var(--color-primary-dark);">Registrar interacción</h3>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Tipo</label>
                <select id="iaTipo" class="input-brand w-full px-3 py-2 text-sm mb-3">
                    <option value="correo">Correo</option><option value="llamada">Llamada</option><option value="evento">Evento</option>
                </select>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Título *</label>
                <input id="iaTitulo" type="text" class="input-brand w-full px-3 py-2 text-sm mb-3">
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Detalle</label>
                <textarea id="iaDetalle" rows="3" class="input-brand w-full px-3 py-2 text-sm"></textarea>
                <div class="flex justify-end gap-2 pt-4">
                    <button data-ia-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="iaGuardar" class="btn-primary text-sm">Guardar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-ia-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#iaGuardar').addEventListener('click', () => {
            const titulo = modal.querySelector('#iaTitulo');
            if (!titulo.value.trim()) { titulo.style.borderColor = 'var(--color-danger)'; return; }
            UCLA.data.interaccionesAlianza.unshift({
                id: 'ia-' + Date.now(), cuentaId: cuenta.id, tipo: modal.querySelector('#iaTipo').value,
                fecha: new Date().toISOString().slice(0, 10), titulo: titulo.value.trim(), detalle: modal.querySelector('#iaDetalle').value,
            });
            UCLA.components.toast.show('Interacción registrada', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    UCLA.views['alianzas/empresas/:id'] = { render };
})();

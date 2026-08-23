// Alianzas · Convenios Institucionales — listShell sobre UCLA.data.convenios,
// cruzando cuentaId con UCLA.data.cuentas (misma fuente que CRM · Cuentas).
// El estado (Vigente/Por vencer/Vencido) se calcula a partir de fechaFin.
(function () {
    const HOY = new Date('2026-08-04T12:00:00');
    const CAMPOS_MODULO = ['Tipo', 'Estado', 'Responsable'];
    let clickHandler = null;

    function cuentaDe(id) {
        return UCLA.data.cuentas.find((c) => c.id === id);
    }

    function diasParaVencer(fechaFin) {
        return Math.round((new Date(fechaFin + 'T12:00:00') - HOY) / 86400000);
    }

    function estadoConvenio(convenio) {
        const dias = diasParaVencer(convenio.fechaFin);
        if (dias < 0) return 'Vencido';
        if (dias <= 60) return 'Por vencer';
        return 'Vigente';
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Convenio', render: (c) => `<span class="font-medium" style="color: var(--color-text);">${c.nombre}</span>` },
            { clave: 'cuentaId', etiqueta: 'Empresa / Entidad', render: (c) => { const cta = cuentaDe(c.cuentaId); return cta ? `<a href="#/alianzas/empresas/${cta.id}" class="hover:underline" style="color: var(--color-primary);">${cta.razonSocial}</a>` : '-'; } },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'fechaInicio', etiqueta: 'Inicio', render: (c) => UCLA.utils.formatoFecha(c.fechaInicio) },
            { clave: 'fechaFin', etiqueta: 'Vigencia hasta', render: (c) => UCLA.utils.formatoFecha(c.fechaFin) },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => UCLA.utils.badgeEstado(estadoConvenio(c)) },
            { clave: 'responsable', etiqueta: 'Responsable' },
            {
                clave: 'acciones', etiqueta: 'Acciones',
                render: (c) => `<button data-renovar="${c.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Renovar</button>`,
            },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nuevo convenio',
            camposIzquierda: [
                { clave: 'cuenta', etiqueta: 'Empresa / Entidad', tipo: 'select', opciones: UCLA.data.cuentas.map((c) => c.id + ' - ' + c.razonSocial), obligatorio: true },
                { clave: 'nombre', etiqueta: 'Nombre del convenio', tipo: 'text', obligatorio: true },
                { clave: 'tipo', etiqueta: 'Tipo', tipo: 'select', opciones: ['Prácticas', 'Formación complementaria', 'Descuento matrícula', 'Patrocinio', 'Capacitación', 'Cooperación', 'Articulación', 'Empleabilidad', 'Bienestar'] },
            ],
            camposDerecha: [
                { clave: 'fechaInicio', etiqueta: 'Fecha de inicio', tipo: 'date', obligatorio: true },
                { clave: 'fechaFin', etiqueta: 'Fecha de vencimiento', tipo: 'date', obligatorio: true },
                { clave: 'responsable', etiqueta: 'Responsable', tipo: 'text' },
                { clave: 'beneficio', etiqueta: 'Beneficio', tipo: 'textarea' },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            container.innerHTML = `<div id="acLista"></div>`;
            UCLA.components.listShell.render(container.querySelector('#acLista'), {
                claveEstado: 'alianzas/convenios',
                titulo: 'Convenios Institucionales',
                columnas: columnas(),
                filas: UCLA.data.convenios,
                filaId: (c) => c.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaFin',
                exportName: 'convenios',
                botonPrincipal: {
                    etiqueta: 'Nuevo convenio',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nuevo convenio institucional',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            const cuentaId = (datos.cuenta || '').split(' - ')[0];
                            UCLA.data.convenios.unshift({
                                id: 'conv-' + Date.now(), cuentaId, nombre: datos.nombre || 'Sin nombre', tipo: datos.tipo || 'Cooperación',
                                fechaInicio: datos.fechaInicio || new Date().toISOString().slice(0, 10), fechaFin: datos.fechaFin || new Date().toISOString().slice(0, 10),
                                responsable: datos.responsable || '', beneficio: datos.beneficio || '',
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const renovar = e.target.closest('[data-renovar]');
            if (renovar) abrirRenovar(UCLA.data.convenios.find((c) => c.id === renovar.getAttribute('data-renovar')), pintar);
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirRenovar(convenio, alGuardar) {
        let modal = document.getElementById('modalRenovarConvenio');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalRenovarConvenio';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-rc-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Renovar convenio</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">${convenio.nombre}</p>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Nueva fecha de vencimiento</label>
                <input id="rcFecha" type="date" class="input-brand w-full px-3 py-2 text-sm mb-4" value="${convenio.fechaFin}">
                <div class="flex justify-end gap-2">
                    <button data-rc-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="rcGuardar" class="btn-primary text-sm">Guardar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-rc-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#rcGuardar').addEventListener('click', () => {
            const nuevaFecha = modal.querySelector('#rcFecha').value;
            if (!nuevaFecha) return;
            convenio.fechaFin = nuevaFecha;
            UCLA.data.interaccionesAlianza.unshift({ id: 'ia-' + Date.now(), cuentaId: convenio.cuentaId, tipo: 'correo', fecha: new Date().toISOString().slice(0, 10), titulo: 'Renovación de convenio', detalle: `Convenio "${convenio.nombre}" renovado hasta ${UCLA.utils.formatoFecha(nuevaFecha)}.` });
            UCLA.components.toast.show('Convenio renovado', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    UCLA.views['alianzas/convenios'] = { render, estadoConvenio };
})();

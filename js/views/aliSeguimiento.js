// Alianzas · Seguimiento de Acuerdos y Vigencias — misma fuente que Convenios
// (UCLA.data.convenios), ordenada por vencimiento con foco en gestión.
(function () {
    const CAMPOS_MODULO = ['Estado', 'Responsable'];
    let clickHandler = null;

    function cuentaDe(id) { return UCLA.data.cuentas.find((c) => c.id === id); }
    function estadoConvenio(c) { return UCLA.views['alianzas/convenios'].estadoConvenio(c); }

    function stats() {
        const estados = UCLA.data.convenios.map(estadoConvenio);
        return [
            { etiqueta: 'Convenios vigentes', valor: estados.filter((e) => e === 'Vigente').length, color: 'var(--color-success)' },
            { etiqueta: 'Por vencer (60 días)', valor: estados.filter((e) => e === 'Por vencer').length, color: 'var(--color-accent)' },
            { etiqueta: 'Vencidos', valor: estados.filter((e) => e === 'Vencido').length, color: 'var(--color-danger)' },
            { etiqueta: 'Total de convenios', valor: UCLA.data.convenios.length, color: 'var(--color-primary)' },
        ];
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Convenio', render: (c) => `<span class="font-medium" style="color: var(--color-text);">${c.nombre}</span>` },
            { clave: 'cuentaId', etiqueta: 'Empresa / Entidad', render: (c) => { const cta = cuentaDe(c.cuentaId); return cta ? cta.razonSocial : '-'; } },
            { clave: 'fechaFin', etiqueta: 'Vigencia hasta', render: (c) => UCLA.utils.formatoFecha(c.fechaFin) },
            { clave: 'estado', etiqueta: 'Estado', render: (c) => UCLA.utils.badgeEstado(estadoConvenio(c)) },
            { clave: 'responsable', etiqueta: 'Responsable' },
            { clave: 'acciones', etiqueta: 'Acciones', render: (c) => `<button data-seguir="${c.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Registrar seguimiento</button>` },
        ];
    }

    function render(container) {
        function pintar() {
            const ordenados = UCLA.data.convenios.slice().sort((a, b) => a.fechaFin.localeCompare(b.fechaFin));
            container.innerHTML = `
                <div id="asStats" class="mb-4"></div>
                <div id="asLista"></div>`;
            UCLA.components.statCards.render(container.querySelector('#asStats'), stats());
            UCLA.components.listShell.render(container.querySelector('#asLista'), {
                titulo: 'Seguimiento de Acuerdos y Vigencias',
                columnas: columnas(),
                filas: ordenados,
                filaId: (c) => c.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaFin',
                exportName: 'seguimiento-alianzas',
                botonPrincipal: { etiqueta: 'Ver todos los convenios', onClick: () => UCLA.router.navigate('alianzas/convenios') },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-seguir]');
            if (btn) abrirSeguimiento(UCLA.data.convenios.find((c) => c.id === btn.getAttribute('data-seguir')), pintar);
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirSeguimiento(convenio, alGuardar) {
        let modal = document.getElementById('modalSeguimientoConvenio');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalSeguimientoConvenio';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-sg-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Registrar seguimiento</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">${convenio.nombre}</p>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Nota de seguimiento *</label>
                <textarea id="sgNota" rows="3" class="input-brand w-full px-3 py-2 text-sm mb-4" placeholder="Ej: se contactó al responsable para iniciar la renovación."></textarea>
                <div class="flex justify-end gap-2">
                    <button data-sg-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="sgGuardar" class="btn-primary text-sm">Guardar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-sg-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#sgGuardar').addEventListener('click', () => {
            const nota = modal.querySelector('#sgNota');
            if (!nota.value.trim()) { nota.style.borderColor = 'var(--color-danger)'; return; }
            UCLA.data.interaccionesAlianza.unshift({ id: 'ia-' + Date.now(), cuentaId: convenio.cuentaId, tipo: 'llamada', fecha: new Date().toISOString().slice(0, 10), titulo: 'Seguimiento de convenio', detalle: nota.value.trim() });
            UCLA.components.toast.show('Seguimiento registrado', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    UCLA.views['alianzas/seguimiento'] = { render };
})();

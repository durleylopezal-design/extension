// Financiero · Conciliación de Pagos — cruza UCLA.data.movimientosBancarios
// contra UCLA.data.pagos (pagoId). Completa el módulo Financiero junto con
// Pagos, Cartera y Becas.
(function () {
    const CAMPOS_MODULO = ['Banco', 'Tipo', 'Estado'];
    let clickHandler = null;

    function pagoDe(mov) {
        return mov.pagoId ? UCLA.data.pagos.find((p) => p.id === mov.pagoId) : null;
    }

    function pagosSinConciliar() {
        const usados = new Set(UCLA.data.movimientosBancarios.filter((m) => m.estado === 'Conciliado').map((m) => m.pagoId));
        return UCLA.data.pagos.filter((p) => p.estado === 'Pagado' && !usados.has(p.id));
    }

    function stats(filas) {
        const conciliados = filas.filter((f) => f.estado === 'Conciliado');
        const pendientes = filas.filter((f) => f.estado === 'Pendiente');
        const diferencias = filas.filter((f) => f.estado === 'Diferencia');
        return [
            { etiqueta: 'Movimientos conciliados', valor: conciliados.length, color: 'var(--color-success)' },
            { etiqueta: 'Pendientes por conciliar', valor: pendientes.length, color: 'var(--color-accent)' },
            { etiqueta: 'Con diferencia', valor: diferencias.length, color: 'var(--color-danger)' },
            { etiqueta: 'Total del extracto', valor: UCLA.utils.formatoCOP(filas.reduce((s, f) => s + f.valor, 0)), color: 'var(--color-primary)' },
        ];
    }

    function columnas() {
        return [
            { clave: 'fecha', etiqueta: 'Fecha', render: (m) => UCLA.utils.formatoFecha(m.fecha) },
            { clave: 'banco', etiqueta: 'Banco' },
            { clave: 'referencia', etiqueta: 'Referencia' },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'valor', etiqueta: 'Valor', render: (m) => UCLA.utils.formatoCOP(m.valor) },
            { clave: 'pago', etiqueta: 'Pago asociado', render: (m) => { const p = pagoDe(m); return p ? `${p.recibo} · ${p.estudiante}` : '-'; } },
            { clave: 'estado', etiqueta: 'Estado', render: (m) => UCLA.utils.badgeEstado(m.estado) },
            {
                clave: 'acciones', etiqueta: 'Acciones',
                render: (m) => m.estado === 'Pendiente' ? `<button data-conciliar="${m.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Conciliar</button>`
                    : m.estado === 'Diferencia' ? `<button data-diferencia="${m.id}" class="text-xs font-medium hover:underline" style="color: var(--color-danger);">Ver diferencia</button>` : '-',
            },
        ];
    }

    function render(container) {
        function pintar() {
            container.innerHTML = `
                <div id="fcStats" class="mb-4"></div>
                <div id="fcLista"></div>`;
            UCLA.components.statCards.render(container.querySelector('#fcStats'), stats(UCLA.data.movimientosBancarios));
            UCLA.components.listShell.render(container.querySelector('#fcLista'), {
                claveEstado: 'financiero/conciliacion',
                titulo: 'Conciliación de Pagos',
                columnas: columnas(),
                filas: UCLA.data.movimientosBancarios,
                filaId: (m) => m.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fecha',
                exportName: 'conciliacion-pagos',
                botonPrincipal: { etiqueta: 'Cargar extracto bancario', onClick: () => UCLA.components.toast.show('Carga de extracto bancario: función simulada', 'info') },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const conciliar = e.target.closest('[data-conciliar]');
            const diferencia = e.target.closest('[data-diferencia]');
            if (conciliar) abrirConciliar(UCLA.data.movimientosBancarios.find((m) => m.id === conciliar.getAttribute('data-conciliar')), pintar);
            else if (diferencia) abrirDiferencia(UCLA.data.movimientosBancarios.find((m) => m.id === diferencia.getAttribute('data-diferencia')), pintar);
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirConciliar(mov, alGuardar) {
        let modal = document.getElementById('modalConciliar');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalConciliar';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        const candidatos = pagosSinConciliar();
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-cc-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Conciliar movimiento</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">${mov.referencia} · ${UCLA.utils.formatoCOP(mov.valor)} · ${UCLA.utils.formatoFecha(mov.fecha)}</p>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Pago asociado</label>
                <select id="ccPago" class="input-brand w-full px-3 py-2 text-sm mb-4">
                    ${candidatos.length ? candidatos.map((p) => `<option value="${p.id}">${p.recibo}, ${p.estudiante}, ${UCLA.utils.formatoCOP(p.valor)}</option>`).join('') : '<option value="">No hay pagos pendientes de conciliar</option>'}
                </select>
                <div class="flex justify-end gap-2">
                    <button data-cc-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="ccGuardar" class="btn-primary text-sm" ${candidatos.length ? '' : 'disabled'}>Conciliar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-cc-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#ccGuardar').addEventListener('click', () => {
            const pagoId = modal.querySelector('#ccPago').value;
            if (!pagoId) return;
            mov.pagoId = pagoId;
            mov.estado = 'Conciliado';
            UCLA.components.toast.show('Movimiento conciliado', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    function abrirDiferencia(mov, alGuardar) {
        const pago = pagoDe(mov);
        let modal = document.getElementById('modalDiferencia');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalDiferencia';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        const diferencia = pago ? mov.valor - pago.valor : 0;
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-cd-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 class="text-lg font-bold mb-4" style="color: var(--color-primary-dark);">Diferencia detectada</h3>
                <div class="space-y-2 text-sm mb-4">
                    <div class="flex justify-between"><span style="color: var(--color-text-muted);">Valor en extracto</span><span class="font-medium">${UCLA.utils.formatoCOP(mov.valor)}</span></div>
                    <div class="flex justify-between"><span style="color: var(--color-text-muted);">Valor del pago (${pago ? pago.recibo : '-'})</span><span class="font-medium">${pago ? UCLA.utils.formatoCOP(pago.valor) : '-'}</span></div>
                    <div class="flex justify-between pt-2" style="border-top: 1px solid var(--color-border);"><span style="color: var(--color-danger); font-weight: 600;">Diferencia</span><span style="color: var(--color-danger); font-weight: 600;">${UCLA.utils.formatoCOP(diferencia)}</span></div>
                </div>
                <div class="flex justify-end gap-2">
                    <button data-cd-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cerrar</button>
                    <button id="cdResolver" class="btn-primary text-sm">Marcar como resuelta</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-cd-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#cdResolver').addEventListener('click', () => {
            mov.estado = 'Conciliado';
            UCLA.components.toast.show('Diferencia resuelta y movimiento conciliado', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    UCLA.views['financiero/conciliacion'] = { render };
})();

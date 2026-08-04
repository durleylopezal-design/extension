// Financiero · Pagos y Matrículas — listShell + statCards, con modal a medida
// para registrar el pago (recalcula bruto/descuento/neto en vivo).
(function () {
    const CAMPOS_MODULO = ['Programa', 'Concepto', 'Medio de pago', 'Estado', 'Sede', 'Fecha'];

    function stats(filas) {
        const delMes = filas.filter((p) => p.fecha.startsWith('2026-08') || p.fecha.startsWith('2026-07'));
        const recaudo = filas.filter((p) => p.estado === 'Pagado').reduce((s, p) => s + p.valor, 0);
        const confirmadas = filas.filter((p) => p.concepto === 'Matrícula' && p.estado === 'Pagado').length;
        const promedio = filas.length ? Math.round(recaudo / filas.filter((p) => p.estado === 'Pagado').length) : 0;
        return [
            { etiqueta: 'Recaudo del periodo', valor: UCLA.utils.formatoCOP(recaudo), color: 'var(--color-success)' },
            { etiqueta: 'Pagos registrados', valor: String(filas.length), color: 'var(--color-primary)' },
            { etiqueta: 'Matrículas confirmadas', valor: String(confirmadas), color: 'var(--color-primary)' },
            { etiqueta: 'Ticket promedio', valor: UCLA.utils.formatoCOP(promedio || 0), color: 'var(--color-accent)' },
        ];
    }

    function columnas() {
        return [
            { clave: 'recibo', etiqueta: 'Recibo', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.recibo}</span>` },
            { clave: 'estudiante', etiqueta: 'Estudiante' },
            { clave: 'programa', etiqueta: 'Programa' },
            { clave: 'concepto', etiqueta: 'Concepto' },
            { clave: 'valor', etiqueta: 'Valor', render: (f) => UCLA.utils.formatoCOP(f.valor) },
            { clave: 'medioPago', etiqueta: 'Medio de pago' },
            { clave: 'fecha', etiqueta: 'Fecha', render: (f) => UCLA.utils.formatoFecha(f.fecha) },
            { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
            { clave: 'facturaAsociada', etiqueta: 'Factura' },
            { clave: 'sedeId', etiqueta: 'Sede' },
        ];
    }

    function render(container) {
        const filas = UCLA.data.pagos.slice();

        function pintar() {
            container.innerHTML = `<div id="finPagosStats" class="mb-4"></div><div id="finPagosLista"></div>`;
            UCLA.components.statCards.render(container.querySelector('#finPagosStats'), stats(filas));
            UCLA.components.listShell.render(container.querySelector('#finPagosLista'), {
                titulo: 'Pagos y Matrículas',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fecha',
                exportName: 'pagos',
                botonPrincipal: { etiqueta: 'Registrar pago', onClick: () => abrirModal(filas, pintar) },
            });
        }

        pintar();
    }

    function becasVigentesDe(estudiante) {
        return UCLA.data.solicitudesBecas.filter((b) => b.estado === 'Aprobada' && (!estudiante || b.solicitante.toLowerCase().includes(estudiante.toLowerCase())));
    }

    function abrirModal(filas, alGuardar) {
        let modal = document.getElementById('modalRegistrarPago');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalRegistrarPago';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }

        function pintarModal() {
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-rp-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">Registrar pago</h3>
                        <button data-rp-cerrar class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>
                    <div class="space-y-3">
                        <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Estudiante *</label><input id="rpEstudiante" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Programa</label><input id="rpPrograma" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                            <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Concepto</label>
                                <select id="rpConcepto" class="input-brand w-full px-3 py-2 text-sm">
                                    <option>Matrícula</option><option>Cuota</option><option>Inscripción</option><option>Certificado</option><option>Otro</option>
                                </select>
                            </div>
                        </div>
                        <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Factura asociada</label><input id="rpFactura" type="text" placeholder="FAC-2026-XXXX" class="input-brand w-full px-3 py-2 text-sm"></div>
                        <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Valor bruto *</label><input id="rpValorBruto" type="number" class="input-brand w-full px-3 py-2 text-sm"></div>

                        <label class="flex items-center gap-2 text-sm cursor-pointer" style="color: var(--color-text);">
                            <input type="checkbox" id="rpAplicarBeca"> Aplicar beca o descuento
                        </label>
                        <div id="rpBloqueBeca" class="hidden">
                            <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Descuento vigente del estudiante</label>
                            <select id="rpBeca" class="input-brand w-full px-3 py-2 text-sm"></select>
                        </div>

                        <div class="rounded-lg p-3 text-sm" style="background: var(--color-primary-50);">
                            <div class="flex justify-between"><span style="color: var(--color-text-muted);">Valor bruto</span><span id="rpResBruto">$ 0</span></div>
                            <div class="flex justify-between"><span style="color: var(--color-text-muted);">Descuento aplicado</span><span id="rpResDescuento" style="color: var(--color-accent-dark);">$ 0</span></div>
                            <div class="flex justify-between font-bold text-base mt-1 pt-1" style="border-top: 1px solid var(--color-border); color: var(--color-primary);"><span>Neto a pagar</span><span id="rpResNeto">$ 0</span></div>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Medio de pago</label>
                                <select id="rpMedio" class="input-brand w-full px-3 py-2 text-sm">
                                    <option>Efectivo</option><option>Transferencia</option><option>PSE</option><option>Tarjeta</option><option>Convenio</option>
                                </select>
                            </div>
                            <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Fecha</label><input id="rpFecha" type="date" class="input-brand w-full px-3 py-2 text-sm"></div>
                        </div>
                        <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Referencia de transacción</label><input id="rpReferencia" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                        <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Observaciones</label><textarea id="rpObservaciones" rows="2" class="input-brand w-full px-3 py-2 text-sm"></textarea></div>
                    </div>
                    <div class="flex justify-end gap-2 pt-5">
                        <button data-rp-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="rpGuardar" class="btn-primary text-sm">Registrar pago</button>
                    </div>
                </div>`;

            modal.querySelectorAll('[data-rp-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));

            function recalcular() {
                const bruto = Number(modal.querySelector('#rpValorBruto').value) || 0;
                let descuento = 0;
                if (modal.querySelector('#rpAplicarBeca').checked) {
                    const becaId = modal.querySelector('#rpBeca').value;
                    const beca = UCLA.data.solicitudesBecas.find((b) => b.id === becaId);
                    if (beca) descuento = Math.round(bruto * (beca.porcentajeAprobado / 100));
                }
                modal.querySelector('#rpResBruto').textContent = UCLA.utils.formatoCOP(bruto);
                modal.querySelector('#rpResDescuento').textContent = UCLA.utils.formatoCOP(descuento);
                modal.querySelector('#rpResNeto').textContent = UCLA.utils.formatoCOP(bruto - descuento);
            }

            function pintarSelectBecas() {
                const estudiante = modal.querySelector('#rpEstudiante').value;
                const becas = becasVigentesDe(estudiante);
                modal.querySelector('#rpBeca').innerHTML = becas.length
                    ? becas.map((b) => `<option value="${b.id}">${b.solicitante} - ${b.modalidadBeca} (${b.porcentajeAprobado}%)</option>`).join('')
                    : `<option value="">Sin descuentos vigentes para este estudiante</option>`;
                recalcular();
            }

            modal.querySelector('#rpValorBruto').addEventListener('input', recalcular);
            modal.querySelector('#rpEstudiante').addEventListener('input', pintarSelectBecas);
            modal.querySelector('#rpBeca').addEventListener('change', recalcular);
            modal.querySelector('#rpAplicarBeca').addEventListener('change', (e) => {
                modal.querySelector('#rpBloqueBeca').classList.toggle('hidden', !e.target.checked);
                if (e.target.checked) pintarSelectBecas(); else recalcular();
            });

            modal.querySelector('#rpGuardar').addEventListener('click', () => {
                const estudiante = modal.querySelector('#rpEstudiante');
                const bruto = modal.querySelector('#rpValorBruto');
                let valido = true;
                [estudiante, bruto].forEach((el) => { if (!el.value.trim()) { el.style.borderColor = 'var(--color-danger)'; valido = false; } });
                if (!valido) return;

                const valorBruto = Number(bruto.value) || 0;
                let descuento = 0;
                if (modal.querySelector('#rpAplicarBeca').checked) {
                    const beca = UCLA.data.solicitudesBecas.find((b) => b.id === modal.querySelector('#rpBeca').value);
                    if (beca) descuento = Math.round(valorBruto * (beca.porcentajeAprobado / 100));
                }
                filas.unshift({
                    id: 'pag-' + Date.now(), recibo: 'REC-2026-' + Math.floor(3400 + Math.random() * 500),
                    estudiante: estudiante.value.trim(), programa: modal.querySelector('#rpPrograma').value,
                    concepto: modal.querySelector('#rpConcepto').value, valorBruto, descuento, valor: valorBruto - descuento,
                    medioPago: modal.querySelector('#rpMedio').value, fecha: modal.querySelector('#rpFecha').value || new Date().toISOString().slice(0, 10),
                    estado: 'Pagado', facturaAsociada: modal.querySelector('#rpFactura').value, sedeId: 'MDE',
                });
                UCLA.components.toast.show('Pago registrado exitosamente', 'success');
                modal.classList.add('hidden');
                alGuardar();
            });

            recalcular();
        }

        pintarModal();
        modal.classList.remove('hidden');
    }

    UCLA.views['financiero/pagos'] = { render };
})();

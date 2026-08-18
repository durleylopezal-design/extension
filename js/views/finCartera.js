// Financiero · Cartera y Cuentas por Cobrar — listShell + statCards + gráfico
// de edades de cartera + acciones de fila (gestión de cobro / acuerdo de pago).
(function () {
    const CAMPOS_MODULO = ['Programa', 'Estado', 'Gestor asignado', 'Fecha de vencimiento', 'Días de mora'];
    let clickHandler = null;

    function stats(filas) {
        const total = filas.reduce((s, f) => s + f.saldo, 0);
        const vencida = filas.filter((f) => f.diasMora > 0).reduce((s, f) => s + f.saldo, 0);
        const alDia = total - vencida;
        const conMora = filas.filter((f) => f.diasMora > 0);
        const promedioMora = conMora.length ? Math.round(conMora.reduce((s, f) => s + f.diasMora, 0) / conMora.length) : 0;
        return [
            { etiqueta: 'Cartera total', valor: UCLA.utils.formatoCOP(total), color: 'var(--color-primary)' },
            { etiqueta: 'Cartera vencida', valor: UCLA.utils.formatoCOP(vencida), color: 'var(--color-danger)' },
            { etiqueta: 'Cartera al día', valor: UCLA.utils.formatoCOP(alDia), color: 'var(--color-success)' },
            { etiqueta: 'Días promedio de mora', valor: `${promedioMora} días`, color: 'var(--color-accent)' },
        ];
    }

    function columnas() {
        return [
            { clave: 'estudiante', etiqueta: 'Estudiante', render: (f) => `<span class="font-medium" style="color: var(--color-text);">${f.estudiante}</span>` },
            { clave: 'programa', etiqueta: 'Programa' },
            { clave: 'factura', etiqueta: 'Factura' },
            { clave: 'valorTotal', etiqueta: 'Valor total', render: (f) => UCLA.utils.formatoCOP(f.valorTotal) },
            { clave: 'abonado', etiqueta: 'Abonado', render: (f) => UCLA.utils.formatoCOP(f.abonado) },
            { clave: 'saldo', etiqueta: 'Saldo', render: (f) => `<span style="${f.diasMora > 0 ? 'color: var(--color-danger); font-weight: 600;' : ''}">${UCLA.utils.formatoCOP(f.saldo)}</span>` },
            { clave: 'fechaVencimiento', etiqueta: 'Vencimiento', render: (f) => UCLA.utils.formatoFecha(f.fechaVencimiento) },
            { clave: 'diasMora', etiqueta: 'Días de mora', render: (f) => f.diasMora > 0 ? `<span style="color: var(--color-danger); font-weight: 600;">${f.diasMora}</span>` : '-' },
            { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
            { clave: 'gestor', etiqueta: 'Gestor' },
            {
                clave: 'acciones', etiqueta: 'Acciones',
                render: (f) => `<div class="flex gap-2">
                    <button data-gestion="${f.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Gestión de cobro</button>
                    <button data-acuerdo="${f.id}" class="text-xs font-medium hover:underline" style="color: var(--color-accent-dark);">Acuerdo de pago</button>
                </div>`,
            },
        ];
    }

    function edadesCartera(filas) {
        const buckets = { corriente: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90mas: 0 };
        filas.forEach((f) => {
            if (f.diasMora <= 0) buckets.corriente += f.saldo;
            else if (f.diasMora <= 30) buckets.d1_30 += f.saldo;
            else if (f.diasMora <= 60) buckets.d31_60 += f.saldo;
            else if (f.diasMora <= 90) buckets.d61_90 += f.saldo;
            else buckets.d90mas += f.saldo;
        });
        return buckets;
    }

    function render(container) {
        function pintar() {
            const filas = UCLA.data.cuentasPorCobrar;
            container.innerHTML = `
                <div id="finCarteraStats" class="mb-4"></div>
                <div id="finCarteraLista" class="mb-4"></div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="section-title text-base mb-4">Edades de Cartera</h3>
                    <div class="chart-container" style="height: 260px;"><canvas id="chartEdadesCartera"></canvas></div>
                </div>`;
            UCLA.components.statCards.render(container.querySelector('#finCarteraStats'), stats(filas));
            UCLA.components.listShell.render(container.querySelector('#finCarteraLista'), {
                titulo: 'Cartera y Cuentas por Cobrar',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'diasMora',
                exportName: 'cartera',
                botonPrincipal: { etiqueta: 'Registrar factura', onClick: () => UCLA.components.toast.show('La generación de facturas se hace desde Pagos y Matrículas', 'info') },
            });

            const b = edadesCartera(filas);
            UCLA.components.charts.initBar('chartEdadesCartera', {
                labels: ['Corriente', '1-30 días', '31-60 días', '61-90 días', 'Más de 90 días'],
                datasets: [{
                    label: 'Saldo por antigüedad',
                    data: [b.corriente, b.d1_30, b.d31_60, b.d61_90, b.d90mas],
                    backgroundColor: ['rgba(46, 204, 113, 0.75)', 'rgba(28, 127, 168, 0.75)', 'rgba(245, 130, 31, 0.75)', 'rgba(233, 107, 90, 0.75)', 'rgba(233, 107, 90, 0.95)'],
                    borderRadius: 6,
                }],
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const gestion = e.target.closest('[data-gestion]');
            const acuerdo = e.target.closest('[data-acuerdo]');
            if (gestion) abrirGestionCobro(UCLA.store.obtener('cuentasPorCobrar', gestion.getAttribute('data-gestion')));
            else if (acuerdo) abrirAcuerdoPago(UCLA.store.obtener('cuentasPorCobrar', acuerdo.getAttribute('data-acuerdo')), pintar);
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirGestionCobro(cuenta) {
        let modal = document.getElementById('modalGestionCobro');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalGestionCobro';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-gc-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Registrar gestión de cobro</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">${cuenta.estudiante} · ${UCLA.utils.formatoCOP(cuenta.saldo)}</p>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Tipo de gestión</label>
                <select id="gcTipo" class="input-brand w-full px-3 py-2 text-sm mb-3">
                    <option>Llamada</option><option>Correo</option><option>WhatsApp</option><option>Visita</option>
                </select>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Resultado</label>
                <select id="gcResultado" class="input-brand w-full px-3 py-2 text-sm mb-3">
                    <option>Contactado, promete pago</option><option>No contactado</option><option>Rechaza pago</option><option>Solicita acuerdo de pago</option>
                </select>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Compromiso de pago</label>
                <input id="gcCompromiso" type="date" class="input-brand w-full px-3 py-2 text-sm">
                <div class="flex justify-end gap-2 pt-4">
                    <button data-gc-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="gcGuardar" class="btn-primary text-sm">Guardar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-gc-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#gcGuardar').addEventListener('click', () => {
            const tipo = modal.querySelector('#gcTipo').value;
            const resultado = modal.querySelector('#gcResultado').value;
            if (tipo === 'Llamada') {
                UCLA.store.crear('llamadas', {
                    direccion: 'Saliente', estadoSaliente: 'Completado',
                    inicio: new Date().toISOString().slice(0, 16), duracionMin: 3, duracionSeg: 0,
                    propietario: UCLA.state.usuarioActual.nombre, asunto: `Gestión de cobro: ${cuenta.estudiante}`,
                    relacionadoCon: `Cartera · ${cuenta.factura}`, contactoNombre: cuenta.estudiante, proposito: 'Seguimiento de matrícula',
                });
            } else {
                UCLA.store.crear('tareas', {
                    asunto: `Seguimiento de cobro: ${cuenta.estudiante}`, prioridad: 'Alta', estado: 'No iniciada',
                    fechaVencimiento: modal.querySelector('#gcCompromiso').value || '', relacionadoCon: `Cartera · ${cuenta.factura}`,
                    contactoNombre: cuenta.estudiante, propietario: UCLA.state.usuarioActual.nombre, etiqueta: 'Cartera',
                });
            }
            UCLA.components.toast.show(`Gestión registrada: ${resultado}`, 'success');
            modal.classList.add('hidden');
        });
        modal.classList.remove('hidden');
    }

    function abrirAcuerdoPago(cuenta, alGuardar) {
        let modal = document.getElementById('modalAcuerdoPago');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalAcuerdoPago';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }

        function pintar() {
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-ap-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                    <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Crear acuerdo de pago</h3>
                    <p class="text-sm mb-4" style="color: var(--color-text-muted);">${cuenta.estudiante} · Saldo ${UCLA.utils.formatoCOP(cuenta.saldo)}</p>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Número de cuotas</label><input id="apCuotas" type="number" min="1" max="12" value="3" class="input-brand w-full px-3 py-2 text-sm"></div>
                        <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Fecha primera cuota</label><input id="apFecha" type="date" class="input-brand w-full px-3 py-2 text-sm"></div>
                    </div>
                    <button type="button" id="apGenerar" class="text-xs font-medium hover:underline mb-3" style="color: var(--color-primary);">Generar plan de cuotas</button>
                    <div id="apPlan"></div>
                    <div class="flex justify-end gap-2 pt-4">
                        <button data-ap-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="apGuardar" class="btn-primary text-sm" disabled>Guardar acuerdo</button>
                    </div>
                </div>`;
            modal.querySelectorAll('[data-ap-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));

            let cuotasGeneradas = [];
            modal.querySelector('#apGenerar').addEventListener('click', () => {
                const n = Math.max(1, Number(modal.querySelector('#apCuotas').value) || 1);
                const fechaBase = modal.querySelector('#apFecha').value ? new Date(modal.querySelector('#apFecha').value) : new Date();
                const valorCuota = Math.round(cuenta.saldo / n);
                cuotasGeneradas = Array.from({ length: n }, (_, i) => {
                    const f = new Date(fechaBase); f.setMonth(f.getMonth() + i);
                    return { numero: i + 1, valor: i === n - 1 ? cuenta.saldo - valorCuota * (n - 1) : valorCuota, fecha: f.toISOString().slice(0, 10), estado: 'Pendiente' };
                });
                modal.querySelector('#apPlan').innerHTML = `
                    <table class="w-full text-xs mb-2">
                        <thead><tr style="color: var(--color-text-muted);"><th class="text-left">Cuota</th><th class="text-left">Valor</th><th class="text-left">Fecha</th></tr></thead>
                        <tbody>${cuotasGeneradas.map((c) => `<tr><td>${c.numero}</td><td>${UCLA.utils.formatoCOP(c.valor)}</td><td>${UCLA.utils.formatoFecha(c.fecha)}</td></tr>`).join('')}</tbody>
                    </table>`;
                modal.querySelector('#apGuardar').disabled = false;
                modal.querySelector('#apGuardar').classList.remove('opacity-50');
            });

            modal.querySelector('#apGuardar').addEventListener('click', () => {
                UCLA.store.actualizar('cuentasPorCobrar', cuenta.id, {
                    estado: 'En acuerdo de pago',
                    acuerdoPago: { activo: true, cuotas: cuotasGeneradas },
                });
                UCLA.components.toast.show('Acuerdo de pago creado', 'success');
                modal.classList.add('hidden');
                alGuardar();
            });
        }

        pintar();
        modal.classList.remove('hidden');
    }

    UCLA.views['financiero/cartera'] = { render };
})();

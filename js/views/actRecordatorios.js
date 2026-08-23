// Actividades · Recordatorios — dos pestañas internas (Recordatorios activos /
// Reglas automáticas), cada una sobre listShell.
(function () {
    const CAMPOS_RECORDATORIOS = ['Tipo de origen', 'Canal', 'Estado', 'Destinatario', 'Relacionado con'];
    let clickHandler = null;

    function vencido(r) {
        return r.estado === 'Programado' && new Date(r.fechaDisparo) < new Date('2026-08-03T12:00');
    }

    function columnasRecordatorios() {
        return [
            { clave: 'asunto', etiqueta: 'Asunto', render: (r) => `<span class="font-medium" style="color: var(--color-text);">${r.asunto}</span>` },
            { clave: 'origenTipo', etiqueta: 'Tipo de origen' },
            { clave: 'relacionadoCon', etiqueta: 'Relacionado con' },
            { clave: 'destinatario', etiqueta: 'Destinatario' },
            { clave: 'fechaDisparo', etiqueta: 'Fecha y hora de disparo', render: (r) => `<span style="${vencido(r) ? 'color: var(--color-danger); font-weight: 600;' : ''}">${r.fechaDisparo.replace('T', ' ')}</span>` },
            { clave: 'canal', etiqueta: 'Canal' },
            { clave: 'estado', etiqueta: 'Estado', render: (r) => UCLA.utils.badgeEstado(r.estado) },
            {
                clave: 'acciones', etiqueta: 'Acciones',
                render: (r) => r.estado === 'Programado' ? `
                    <div class="flex gap-2">
                        <button data-disparar="${r.id}" class="text-xs font-medium hover:underline" style="color: var(--color-success);">Disparar ahora</button>
                        <button data-posponer="${r.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Posponer</button>
                        <button data-descartar="${r.id}" class="text-xs font-medium hover:underline" style="color: var(--color-danger);">Descartar</button>
                    </div>` : '-',
            },
        ];
    }

    function columnasReglas() {
        return [
            { clave: 'nombre', etiqueta: 'Nombre', render: (r) => `<span class="font-medium" style="color: var(--color-text);">${r.nombre}</span>` },
            { clave: 'modulo', etiqueta: 'Módulo' },
            { clave: 'disparador', etiqueta: 'Evento disparador' },
            { clave: 'condicion', etiqueta: 'Condición' },
            { clave: 'accion', etiqueta: 'Acción' },
            { clave: 'canal', etiqueta: 'Canal', render: (r) => r.accion.toLowerCase().includes('correo') ? 'Correo' : 'Sistema' },
            {
                clave: 'activa', etiqueta: 'Estado',
                render: (r) => `<label class="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" data-toggle-regla="${r.id}" ${r.activa ? 'checked' : ''}>
                    <span style="color: ${r.activa ? 'var(--color-success)' : 'var(--color-text-muted)'};">${r.activa ? 'Activa' : 'Inactiva'}</span>
                </label>`,
            },
        ];
    }

    function reglaSecciones() {
        return [{
            titulo: 'Nueva regla automática',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre', tipo: 'text', obligatorio: true },
                { clave: 'modulo', etiqueta: 'Módulo', tipo: 'select', opciones: ['Solicitudes', 'Eventos', 'Financiero', 'Alianzas', 'Egresados', 'CRM'] },
                { clave: 'disparador', etiqueta: 'Evento disparador', tipo: 'select', opciones: ['Creación de registro', 'Cambio de estado', 'Proximidad de fecha'] },
            ],
            camposDerecha: [
                { clave: 'condicion', etiqueta: 'Condición', tipo: 'text' },
                { clave: 'momento', etiqueta: 'Momento (X días/horas antes o después)', tipo: 'text', placeholder: 'Ej: 3 días antes' },
                { clave: 'accion', etiqueta: 'Acción', tipo: 'select', opciones: ['Crear recordatorio', 'Enviar correo', 'Crear tarea'] },
            ],
        }];
    }

    function render(container) {
        let tabActiva = 'activos';

        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex gap-2">
                    <button data-tab-rec="activos" class="px-4 py-2 rounded-lg text-sm font-medium"></button>
                    <button data-tab-rec="reglas" class="px-4 py-2 rounded-lg text-sm font-medium"></button>
                </div>
                <div id="recCuerpo"></div>
            </div>`;

        function pintarTabs() {
            container.querySelectorAll('[data-tab-rec]').forEach((btn) => {
                const id = btn.getAttribute('data-tab-rec');
                btn.textContent = id === 'activos' ? 'Recordatorios activos' : 'Reglas automáticas';
                btn.className = id === tabActiva ? 'tab-active px-4 py-2 rounded-lg text-sm font-semibold' : 'tab-inactive px-4 py-2 rounded-lg text-sm font-medium';
            });
        }

        function pintarCuerpo() {
            const cuerpo = container.querySelector('#recCuerpo');
            if (tabActiva === 'activos') {
                UCLA.components.listShell.render(cuerpo, {
                    titulo: 'Recordatorios activos',
                    columnas: columnasRecordatorios(),
                    filas: UCLA.data.recordatorios,
                    filaId: (r) => r.id,
                    camposModulo: CAMPOS_RECORDATORIOS,
                    campoOrden: 'fechaDisparo',
                    exportName: 'recordatorios',
                    botonPrincipal: { etiqueta: 'Crear recordatorio', onClick: () => UCLA.components.toast.show('Los recordatorios se generan automáticamente desde Tareas, Reuniones y Llamadas', 'info') },
                });
            } else {
                UCLA.components.listShell.render(cuerpo, {
                    titulo: 'Reglas automáticas',
                    columnas: columnasReglas(),
                    filas: UCLA.data.reglasAutomaticas,
                    filaId: (r) => r.id,
                    camposModulo: ['Módulo', 'Evento disparador', 'Acción', 'Estado'],
                    campoOrden: 'nombre',
                    exportName: 'reglas-automaticas',
                    botonPrincipal: {
                        etiqueta: 'Crear regla',
                        onClick: () => UCLA.components.recordForm.abrir({
                            titulo: 'Nueva regla automática',
                            secciones: reglaSecciones(),
                            onGuardar: (datos) => {
                                UCLA.store.crear('reglasAutomaticas', { nombre: datos.nombre || 'Sin nombre', modulo: datos.modulo || 'CRM', disparador: datos.disparador || 'Creación de registro', condicion: datos.condicion || '', momento: datos.momento || '', accion: datos.accion || 'Crear recordatorio', plantillaId: null, activa: true });
                                pintarCuerpo();
                            },
                        }),
                    },
                });
            }
        }

        container.querySelectorAll('[data-tab-rec]').forEach((btn) => {
            btn.addEventListener('click', () => { tabActiva = btn.getAttribute('data-tab-rec'); pintarTabs(); pintarCuerpo(); });
        });

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const disparar = e.target.closest('[data-disparar]');
            const descartar = e.target.closest('[data-descartar]');
            const posponer = e.target.closest('[data-posponer]');
            const toggle = e.target.closest('[data-toggle-regla]');
            if (disparar) {
                const r = UCLA.store.obtener('recordatorios', disparar.getAttribute('data-disparar'));
                if (r) {
                    UCLA.store.actualizar('recordatorios', r.id, { estado: 'Enviado' });
                    UCLA.components.topbar.agregarNotificacion({ titulo: r.asunto, detalle: `${r.relacionadoCon} · ${r.destinatario}` });
                    pintarCuerpo();
                }
            } else if (descartar) {
                const r = UCLA.store.obtener('recordatorios', descartar.getAttribute('data-descartar'));
                if (r) { UCLA.store.actualizar('recordatorios', r.id, { estado: 'Descartado' }); UCLA.components.toast.show('Recordatorio descartado', 'info'); pintarCuerpo(); }
            } else if (posponer) {
                const r = UCLA.store.obtener('recordatorios', posponer.getAttribute('data-posponer'));
                if (r) abrirPosponer(r, pintarCuerpo);
            } else if (toggle) {
                const r = UCLA.store.obtener('reglasAutomaticas', toggle.getAttribute('data-toggle-regla'));
                if (r) { UCLA.store.actualizar('reglasAutomaticas', r.id, { activa: toggle.checked }); UCLA.components.toast.show(`Regla "${r.nombre}" ${toggle.checked ? 'activada' : 'desactivada'}`, 'info'); }
            }
        };
        container.addEventListener('click', clickHandler);

        pintarTabs();
        pintarCuerpo();
    }

    function abrirPosponer(recordatorio, alGuardar) {
        let modal = document.getElementById('modalPosponerRecordatorio');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalPosponerRecordatorio';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        const opciones = [
            { etiqueta: '15 minutos', minutos: 15 },
            { etiqueta: '1 hora', minutos: 60 },
            { etiqueta: '1 día', minutos: 1440 },
        ];
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-pp-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 class="text-lg font-bold mb-4" style="color: var(--color-primary-dark);">Posponer recordatorio</h3>
                <div class="space-y-2">
                    ${opciones.map((o) => `<button data-pp-opcion="${o.minutos}" class="w-full text-left px-4 py-2 rounded-lg border text-sm hover:bg-gray-50" style="border-color: var(--color-border);">${o.etiqueta}</button>`).join('')}
                    <div>
                        <label class="block text-xs font-medium mt-2 mb-1" style="color: var(--color-text-muted);">Fecha personalizada</label>
                        <input id="ppFecha" type="datetime-local" class="input-brand w-full px-3 py-2 text-sm">
                    </div>
                </div>
                <div class="flex justify-end gap-2 pt-4">
                    <button data-pp-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="ppGuardar" class="btn-primary text-sm">Posponer</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-pp-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        let minutosSeleccionados = null;
        modal.querySelectorAll('[data-pp-opcion]').forEach((btn) => {
            btn.addEventListener('click', () => {
                minutosSeleccionados = Number(btn.getAttribute('data-pp-opcion'));
                modal.querySelectorAll('[data-pp-opcion]').forEach((b) => { b.style.borderColor = b === btn ? 'var(--color-primary)' : 'var(--color-border)'; });
            });
        });
        modal.querySelector('#ppGuardar').addEventListener('click', () => {
            const fechaPersonalizada = modal.querySelector('#ppFecha').value;
            let nuevaFecha;
            if (fechaPersonalizada) {
                nuevaFecha = fechaPersonalizada;
            } else if (minutosSeleccionados) {
                const nueva = new Date(recordatorio.fechaDisparo);
                nueva.setMinutes(nueva.getMinutes() + minutosSeleccionados);
                nuevaFecha = nueva.toISOString().slice(0, 16);
            } else {
                return;
            }
            UCLA.store.actualizar('recordatorios', recordatorio.id, { fechaDisparo: nuevaFecha });
            UCLA.components.toast.show('Recordatorio pospuesto', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    UCLA.views['actividades/recordatorios'] = { render };
})();

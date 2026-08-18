// Panel deslizante desde la derecha para los formularios de creación de
// registro de CRM (mismo patrón visual que #notificationsPanel en index.html,
// más ancho). Se crea una única vez y se reutiliza para cada módulo.
(function () {
    let panelEl = null;

    function asegurarPanel() {
        if (panelEl) return panelEl;
        panelEl = document.createElement('div');
        panelEl.id = 'recordFormOverlay';
        panelEl.className = 'fixed inset-0 z-50 hidden modal';
        panelEl.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-rf-cerrar></div>
            <div id="recordFormPanel" class="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col">
                <div class="flex items-center justify-between px-6 py-4" style="border-bottom: 1px solid var(--color-border);">
                    <h3 id="rfTitulo" class="text-lg font-bold" style="color: var(--color-primary-dark);"></h3>
                    <div class="flex items-center gap-4">
                        <a href="#" data-rf-editar-diseno class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Editar diseño de la página</a>
                        <button data-rf-cerrar class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>
                </div>
                <div id="rfCuerpo" class="flex-1 overflow-y-auto p-6"></div>
                <div class="flex justify-end gap-2 px-6 py-4" style="border-top: 1px solid var(--color-border);">
                    <button data-rf-cancelar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button data-rf-guardar-nuevo class="px-4 py-2 text-sm rounded-lg border" style="border-color: var(--color-primary); color: var(--color-primary);">Guardar y nuevo</button>
                    <button data-rf-guardar class="btn-primary text-sm">Guardar</button>
                </div>
            </div>`;
        document.body.appendChild(panelEl);

        panelEl.querySelectorAll('[data-rf-cerrar], [data-rf-cancelar]').forEach((el) => el.addEventListener('click', cerrar));
        panelEl.querySelector('[data-rf-editar-diseno]').addEventListener('click', (e) => {
            e.preventDefault();
            UCLA.components.toast.show('Editor de diseño de página: función simulada', 'info');
        });
        return panelEl;
    }

    function escapeAttr(valor) {
        return String(valor ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function campoHtml(campo, datosIniciales) {
        const valor = datosIniciales ? datosIniciales[campo.clave] : undefined;
        const base = `class="input-brand w-full px-3 py-2 text-sm mt-1" data-campo="${campo.clave}"`;
        let control;
        if (campo.tipo === 'select') {
            control = `<select ${base}>${(campo.opciones || []).map((o) => `<option ${o === valor ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
        } else if (campo.tipo === 'textarea') {
            control = `<textarea ${base} rows="3" placeholder="${campo.placeholder || ''}">${escapeAttr(valor)}</textarea>`;
        } else if (campo.tipo === 'checkbox') {
            return `
                <label class="flex items-center gap-2 text-sm mb-4 cursor-pointer" style="color: var(--color-text);">
                    <input type="checkbox" data-campo="${campo.clave}" ${valor ? 'checked' : ''}> ${campo.etiqueta}
                </label>`;
        } else {
            control = `<input type="${campo.tipo || 'text'}" ${base} placeholder="${campo.placeholder || ''}" value="${escapeAttr(valor)}">`;
        }
        return `
            <div class="mb-4">
                <label class="block text-xs font-medium" style="color: var(--color-text-muted);">${campo.etiqueta}${campo.obligatorio ? ' *' : ''}</label>
                ${control}
            </div>`;
    }

    function columnaHtml(campos, datosIniciales) {
        return `<div>${(campos || []).map((c) => campoHtml(c, datosIniciales)).join('')}</div>`;
    }

    function recolectarDatos(panel) {
        const datos = {};
        panel.querySelectorAll('[data-campo]').forEach((el) => {
            datos[el.getAttribute('data-campo')] = el.type === 'checkbox' ? el.checked : el.value;
        });
        return datos;
    }

    function abrir({ titulo, secciones, onGuardar, validar, datosIniciales, esEdicion }) {
        const overlay = asegurarPanel();
        overlay.querySelector('#rfTitulo').textContent = titulo;
        overlay.querySelector('#rfCuerpo').innerHTML = secciones.map((s) => `
            <div class="mb-6">
                <h4 class="text-sm font-bold uppercase tracking-wide mb-3" style="color: var(--color-primary);">${s.titulo}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    ${columnaHtml(s.camposIzquierda, datosIniciales)}
                    ${columnaHtml(s.camposDerecha, datosIniciales)}
                </div>
            </div>`).join('');

        const panel = overlay.querySelector('#recordFormPanel');
        const guardarYcerrar = () => {
            const datos = recolectarDatos(overlay);
            const error = validar && validar(datos);
            if (error) { UCLA.components.toast.show(error, 'error'); return; }
            if (onGuardar) onGuardar(datos);
            UCLA.components.toast.show(esEdicion ? 'Registro actualizado exitosamente' : 'Registro guardado exitosamente', 'success');
            cerrar();
        };
        const guardarYnuevo = () => {
            const datos = recolectarDatos(overlay);
            const error = validar && validar(datos);
            if (error) { UCLA.components.toast.show(error, 'error'); return; }
            if (onGuardar) onGuardar(datos);
            UCLA.components.toast.show('Registro guardado: formulario listo para uno nuevo', 'success');
            overlay.querySelectorAll('[data-campo]').forEach((el) => { el.type === 'checkbox' ? (el.checked = false) : (el.value = ''); });
        };

        const btnGuardar = overlay.querySelector('[data-rf-guardar]');
        const btnGuardarNuevo = overlay.querySelector('[data-rf-guardar-nuevo]');
        btnGuardar.replaceWith(btnGuardar.cloneNode(true));
        btnGuardarNuevo.replaceWith(btnGuardarNuevo.cloneNode(true));
        overlay.querySelector('[data-rf-guardar]').addEventListener('click', guardarYcerrar);
        overlay.querySelector('[data-rf-guardar-nuevo]').addEventListener('click', guardarYnuevo);
        overlay.querySelector('[data-rf-guardar-nuevo]').classList.toggle('hidden', !!esEdicion);

        overlay.classList.remove('hidden');
        requestAnimationFrame(() => panel.classList.remove('translate-x-full'));
    }

    function cerrar() {
        if (!panelEl) return;
        panelEl.querySelector('#recordFormPanel').classList.add('translate-x-full');
        setTimeout(() => panelEl.classList.add('hidden'), 300);
    }

    UCLA.components.recordForm = { abrir, cerrar };
})();

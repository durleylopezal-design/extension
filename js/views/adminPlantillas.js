// Admin · Plantillas de Correo — listShell sobre UCLA.data.plantillasCorreo,
// cruzando con UCLA.data.reglasAutomaticas (Actividades › Recordatorios) por
// plantillaId para mostrar cuántas reglas automáticas usan cada plantilla.
(function () {
    const CAMPOS_MODULO = ['Módulo'];
    let clickHandler = null;

    function usosDe(plantillaId) {
        return UCLA.data.reglasAutomaticas.filter((r) => r.plantillaId === plantillaId).length;
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Plantilla', render: (p) => `<span class="font-medium" style="color: var(--color-text);">${p.nombre}</span>` },
            { clave: 'asunto', etiqueta: 'Asunto' },
            { clave: 'modulo', etiqueta: 'Módulo' },
            { clave: 'ultimaModificacion', etiqueta: 'Última modificación', render: (p) => UCLA.utils.formatoFecha(p.ultimaModificacion) },
            { clave: 'usos', etiqueta: 'Reglas automáticas que la usan', render: (p) => { const n = usosDe(p.id); return n > 0 ? `<span style="color: var(--color-primary); font-weight: 600;">${n}</span>` : '-'; } },
            { clave: 'acciones', etiqueta: 'Acciones', render: (p) => `<button data-preview="${p.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Vista previa</button>` },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nueva plantilla de correo',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre', tipo: 'text', obligatorio: true },
                { clave: 'asunto', etiqueta: 'Asunto', tipo: 'text', obligatorio: true },
            ],
            camposDerecha: [
                { clave: 'modulo', etiqueta: 'Módulo', tipo: 'select', opciones: ['Solicitudes', 'Financiero', 'Eventos', 'Egresados', 'Alianzas', 'CRM'] },
                { clave: 'cuerpo', etiqueta: 'Cuerpo del mensaje', tipo: 'textarea' },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Plantillas de Correo y Comunicaciones',
                columnas: columnas(),
                filas: UCLA.data.plantillasCorreo,
                filaId: (p) => p.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'plantillas-correo',
                botonPrincipal: {
                    etiqueta: 'Nueva plantilla',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva plantilla de correo',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.data.plantillasCorreo.unshift({ id: 'pl-' + Date.now(), nombre: datos.nombre || 'Sin nombre', asunto: datos.asunto || '', cuerpo: datos.cuerpo || '', modulo: datos.modulo || 'CRM', ultimaModificacion: new Date().toISOString().slice(0, 10) });
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-preview]');
            if (btn) abrirPreview(UCLA.data.plantillasCorreo.find((p) => p.id === btn.getAttribute('data-preview')));
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirPreview(plantilla) {
        let modal = document.getElementById('modalPreviewPlantilla');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalPreviewPlantilla';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-pv-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">${plantilla.nombre}</h3>
                <p class="text-xs mb-4" style="color: var(--color-text-muted);">Módulo: ${plantilla.modulo}</p>
                <div class="rounded-lg p-4" style="border: 1px solid var(--color-border);">
                    <p class="text-xs font-medium" style="color: var(--color-text-muted);">Asunto</p>
                    <p class="text-sm font-semibold mb-3" style="color: var(--color-text);">${plantilla.asunto}</p>
                    <p class="text-xs font-medium" style="color: var(--color-text-muted);">Cuerpo</p>
                    <p class="text-sm" style="color: var(--color-text);">${plantilla.cuerpo || 'Sin contenido definido.'}</p>
                </div>
                <div class="flex justify-end pt-4">
                    <button data-pv-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cerrar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-pv-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.classList.remove('hidden');
    }

    UCLA.views['admin/plantillas'] = { render };
})();

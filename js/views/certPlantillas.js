// Certificados · Plantillas — galería de diseños reutilizables para la
// emisión (UCLA.data.plantillasCertificado). No usa listShell: es una
// cuadrícula visual de tarjetas, no un listado tabular.
(function () {
    let clickHandler = null;

    function tarjeta(p) {
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="p-6 flex items-center justify-center" style="background: color-mix(in srgb, ${p.colorPrincipal} 12%, white); min-height: 140px;">
                    <div class="w-full rounded-lg p-4 text-center bg-white shadow" style="border: 3px solid ${p.colorPrincipal};">
                        <i class="fas fa-award text-2xl mb-1" style="color: ${p.colorPrincipal};"></i>
                        <p class="text-xs font-semibold uppercase tracking-wide" style="color: ${p.colorPrincipal};">Certificado</p>
                        <p class="text-[10px]" style="color: var(--color-text-muted);">${p.tipo}</p>
                    </div>
                </div>
                <div class="p-4">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-semibold" style="color: var(--color-text);">${p.nombre}</p>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: color-mix(in srgb, ${p.activa ? 'var(--color-success)' : 'var(--color-neutral-dark, #6B6F72)'} 18%, white); color: ${p.activa ? 'var(--color-success)' : 'var(--color-text-muted)'};">${p.activa ? 'Activa' : 'Inactiva'}</span>
                    </div>
                    <p class="text-xs mt-1" style="color: var(--color-text-muted);">${p.usosEsteAnio} uso(s) este año</p>
                    <button data-toggle="${p.id}" class="text-xs font-medium mt-3 hover:underline" style="color: var(--color-primary);">${p.activa ? 'Desactivar' : 'Activar'}</button>
                </div>
            </div>`;
    }

    function secciones() {
        return [{
            titulo: 'Nueva plantilla',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre de la plantilla', tipo: 'text', obligatorio: true },
                { clave: 'tipo', etiqueta: 'Tipo de evento', tipo: 'select', opciones: ['Diplomado', 'Semillero', 'Taller', 'Curso', 'Seminario', 'Conversatorio'] },
            ],
            camposDerecha: [
                { clave: 'colorPrincipal', etiqueta: 'Color principal', tipo: 'text', placeholder: '#1C7FA8' },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            container.innerHTML = `
                <div class="flex items-center justify-end mb-4">
                    <button id="cpNueva" class="btn-accent"><i class="fas fa-plus"></i> Nueva plantilla</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${UCLA.data.plantillasCertificado.map(tarjeta).join('')}
                </div>`;

            container.querySelector('#cpNueva').addEventListener('click', () => UCLA.components.recordForm.abrir({
                titulo: 'Nueva plantilla de certificado',
                secciones: secciones(),
                onGuardar: (datos) => {
                    UCLA.data.plantillasCertificado.push({
                        id: 'pc-' + Date.now(), nombre: datos.nombre || 'Sin nombre', tipo: datos.tipo || 'Diplomado',
                        colorPrincipal: /^#[0-9a-fA-F]{6}$/.test(datos.colorPrincipal || '') ? datos.colorPrincipal : '#1C7FA8', activa: true, usosEsteAnio: 0,
                    });
                    pintar();
                },
            }));
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-toggle]');
            if (!btn) return;
            const p = UCLA.data.plantillasCertificado.find((x) => x.id === btn.getAttribute('data-toggle'));
            if (p) { p.activa = !p.activa; pintar(); }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['certificados/plantillas'] = { render };
})();

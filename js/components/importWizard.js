// Asistente de importación masiva, parametrizado por módulo. Se abre desde
// el menú "Importar" de listShell.js en cualquier vista de listado. Solo el
// primer paso (Cargar) es interactivo; los siguientes se simulan al pulsar
// "Siguiente", coherente con el resto del prototipo (sin backend real).
(function () {
    const PASOS = ['Cargar', 'Acciones', 'Módulo', 'Asignación de archivos', 'Asignación de campos', 'Asignar'];
    let overlayEl = null;
    let archivoCargado = null;

    function asegurarOverlay() {
        if (overlayEl) return overlayEl;
        overlayEl = document.createElement('div');
        overlayEl.id = 'importWizardOverlay';
        overlayEl.className = 'fixed inset-0 z-50 hidden flex items-center justify-center modal';
        overlayEl.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-iw-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between px-6 py-4" style="border-bottom: 1px solid var(--color-border);">
                    <h3 id="iwTitulo" class="text-lg font-bold" style="color: var(--color-primary-dark);"></h3>
                    <div class="flex items-center gap-4">
                        <a href="#" id="iwClasica" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Cambiar a importación clásica</a>
                        <button data-iw-cerrar style="color: var(--color-text-muted);"><i class="fas fa-circle-question"></i></button>
                        <button data-iw-cerrar class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                    </div>
                </div>

                <div class="flex items-center justify-between px-6 py-4 overflow-x-auto" style="border-bottom: 1px solid var(--color-border);">
                    ${PASOS.map((p, i) => `
                        <div class="flex items-center flex-shrink-0">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style="background: ${i === 0 ? 'var(--color-accent)' : 'var(--color-neutral-100, #F0F2F3)'}; color: ${i === 0 ? '#fff' : 'var(--color-text-muted)'};">${i + 1}</span>
                                <span class="text-xs font-medium whitespace-nowrap" style="color: ${i === 0 ? 'var(--color-accent-dark)' : 'var(--color-text-muted)'};">${p}</span>
                            </div>
                            ${i < PASOS.length - 1 ? '<span class="w-8 h-px mx-2" style="background: var(--color-border);"></span>' : ''}
                        </div>`).join('')}
                </div>

                <div class="p-6">
                    <div id="iwZonaCarga" class="rounded-xl p-10 text-center" style="border: 2px dashed var(--color-border);">
                        <i class="fas fa-file-arrow-up text-3xl mb-3" style="color: var(--color-primary);"></i>
                        <p class="text-sm font-medium" style="color: var(--color-text);">Arrastre y suelte los archivos aquí</p>
                        <p class="text-xs my-2" style="color: var(--color-text-muted);">o</p>
                        <button type="button" id="iwBuscarArchivos" class="btn-primary text-sm">Buscar archivos</button>
                        <input type="file" id="iwInputArchivo" class="hidden" accept=".csv,.xls,.xlsx">
                        <p id="iwNombreArchivo" class="text-sm font-medium mt-3 hidden" style="color: var(--color-success);"></p>
                    </div>

                    <p class="text-xs mt-3" style="color: var(--color-text-muted);">
                        Los formatos de archivo compatibles son XLSX, CSV y XLS.
                        <a href="#" data-iw-toast="Descarga de archivo de muestra CSV simulada" class="hover:underline" style="color: var(--color-primary);">Descargar archivo de muestra (CSV)</a> ·
                        <a href="#" data-iw-toast="Descarga de archivo de muestra XLSX simulada" class="hover:underline" style="color: var(--color-primary);">Descargar archivo de muestra (XLSX)</a>
                    </p>

                    <div class="rounded-lg p-4 mt-4 text-xs" style="background: var(--color-neutral-100, #F0F2F3); color: var(--color-text-muted);">
                        <p>• El archivo puede tener un máximo de 25 MB. Puede importar un máximo de 100.000 registros al módulo <strong id="iwModuloTexto"></strong>.</p>
                        <p class="mt-1">• No puede cargar más de un archivo.</p>
                    </div>

                    <div class="rounded-lg p-4 mt-4" style="background: var(--color-primary-50);">
                        <p class="text-xs font-semibold uppercase mb-2" style="color: var(--color-primary);">Novedades</p>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs" style="color: var(--color-text);">
                            <div class="flex items-center gap-2"><i class="fas fa-gauge-high" style="color: var(--color-primary);"></i> Límites más altos</div>
                            <div class="flex items-center gap-2"><i class="fas fa-diagram-project" style="color: var(--color-primary);"></i> Compatibilidad con módulos dependientes</div>
                            <div class="flex items-center gap-2"><i class="fas fa-boxes-stacked" style="color: var(--color-primary);"></i> Importación al módulo Inventario</div>
                        </div>
                        <div class="mt-2 text-xs">
                            <a href="#" data-iw-toast="Video explicativo: función simulada" class="hover:underline" style="color: var(--color-primary);">Ver video</a> ·
                            <a href="#" data-iw-toast="Más información: función simulada" class="hover:underline" style="color: var(--color-primary);">Saber más</a>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between px-6 py-4" style="border-top: 1px solid var(--color-border);">
                    <a href="#" data-iw-toast="Migración desde otro sistema: función simulada" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Migrar datos desde otro sistema</a>
                    <div class="flex gap-2">
                        <button data-iw-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="iwSiguiente" class="btn-primary text-sm opacity-50 cursor-not-allowed" disabled>Siguiente</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(overlayEl);

        overlayEl.querySelectorAll('[data-iw-cerrar]').forEach((el) => el.addEventListener('click', cerrar));
        overlayEl.querySelectorAll('[data-iw-toast]').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                UCLA.components.toast.show(el.getAttribute('data-iw-toast'), 'info');
            });
        });
        overlayEl.querySelector('#iwClasica').addEventListener('click', (e) => {
            e.preventDefault();
            UCLA.components.toast.show('Importación clásica: función simulada', 'info');
        });

        overlayEl.querySelector('#iwBuscarArchivos').addEventListener('click', () => overlayEl.querySelector('#iwInputArchivo').click());
        overlayEl.querySelector('#iwInputArchivo').addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;
            archivoCargado = archivo.name;
            const nombreEl = overlayEl.querySelector('#iwNombreArchivo');
            nombreEl.textContent = `✓ ${archivo.name}`;
            nombreEl.classList.remove('hidden');
            const btnSiguiente = overlayEl.querySelector('#iwSiguiente');
            btnSiguiente.disabled = false;
            btnSiguiente.classList.remove('opacity-50', 'cursor-not-allowed');
        });

        overlayEl.querySelector('#iwSiguiente').addEventListener('click', () => {
            if (!archivoCargado) return;
            UCLA.components.toast.show('Procesando Acciones → Módulo → Asignación de archivos → Asignación de campos → Asignar (simulado)...', 'info');
            setTimeout(() => {
                UCLA.components.toast.show(`Importación de "${archivoCargado}" completada exitosamente (simulada)`, 'success');
                cerrar();
            }, 1400);
        });

        return overlayEl;
    }

    function abrir({ modulo }) {
        const overlay = asegurarOverlay();
        overlay.querySelector('#iwTitulo').textContent = `Importar ${modulo}`;
        overlay.querySelector('#iwModuloTexto').textContent = modulo;
        archivoCargado = null;
        overlay.querySelector('#iwNombreArchivo').classList.add('hidden');
        overlay.querySelector('#iwInputArchivo').value = '';
        const btnSiguiente = overlay.querySelector('#iwSiguiente');
        btnSiguiente.disabled = true;
        btnSiguiente.classList.add('opacity-50', 'cursor-not-allowed');
        overlay.classList.remove('hidden');
    }

    function cerrar() {
        overlayEl?.classList.add('hidden');
    }

    UCLA.components.importWizard = { abrir, cerrar };
})();

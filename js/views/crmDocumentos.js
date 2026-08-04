// CRM · Documentos — explorador de carpetas (Mis carpetas + Carpetas de
// equipo) y panel de archivos de la carpeta seleccionada.
(function () {
    const ICONO_TIPO = { pdf: 'fa-file-pdf', docx: 'fa-file-word', xlsx: 'fa-file-excel', pptx: 'fa-file-powerpoint' };
    const COLOR_TIPO = { pdf: '#E96B5A', docx: '#1C7FA8', xlsx: '#2ECC71', pptx: '#F5821F' };

    function render(container) {
        let carpetaActivaId = 'mis-carpetas';

        container.innerHTML = `
            <div class="space-y-4">
                <h2 class="text-2xl font-bold" style="color: var(--color-primary-dark);">Documentos</h2>
                <div class="flex items-start gap-4">
                    <div class="bg-white rounded-xl shadow-lg p-4 w-64 flex-shrink-0">
                        <div id="listaCarpetasDoc"></div>
                        <div class="mt-4 pt-3" style="border-top: 1px solid var(--color-border);">
                            <a href="#" id="abrirWorkdrive" class="text-xs font-medium hover:underline flex items-center gap-1" style="color: var(--color-primary);">
                                <i class="fas fa-arrow-up-right-from-square"></i> Abrir WorkDrive institucional
                            </a>
                        </div>
                    </div>
                    <div id="panelArchivos" class="flex-1 min-w-0 bg-white rounded-xl shadow-lg p-6"></div>
                </div>
            </div>`;

        function pintarCarpetas() {
            const principales = UCLA.data.carpetasDocumentos.filter((c) => c.grupo === 'principal');
            const equipo = UCLA.data.carpetasDocumentos.filter((c) => c.grupo === 'equipo');
            container.querySelector('#listaCarpetasDoc').innerHTML = `
                ${principales.map((c) => carpetaBtn(c)).join('')}
                <div class="flex items-center justify-between mt-4 mb-1">
                    <p class="text-xs font-semibold uppercase" style="color: var(--color-text-muted);">Carpetas de equipo</p>
                    <button title="Agregar carpeta" style="color: var(--color-primary);"><i class="fas fa-plus text-xs"></i></button>
                </div>
                ${equipo.map((c) => carpetaBtn(c)).join('')}
            `;
            container.querySelectorAll('[data-carpeta-doc]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    carpetaActivaId = btn.getAttribute('data-carpeta-doc');
                    pintarCarpetas();
                    pintarArchivos();
                });
            });
        }

        function carpetaBtn(c) {
            const activo = c.id === carpetaActivaId;
            return `
                <button type="button" data-carpeta-doc="${c.id}"
                    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left mb-1"
                    style="background: ${activo ? 'var(--color-primary-50)' : 'transparent'}; color: ${activo ? 'var(--color-primary)' : 'var(--color-text)'}; font-weight: ${activo ? '600' : '400'};">
                    <i class="fas ${c.grupo === 'principal' ? 'fa-folder-tree' : 'fa-folder'}"></i>
                    <span class="flex-1 truncate">${c.nombre}</span>
                    ${c.bloqueada ? `<i class="fas fa-lock text-xs" style="color: var(--color-text-muted);" title="Solo lectura"></i>` : ''}
                </button>`;
        }

        function pintarArchivos() {
            const panel = container.querySelector('#panelArchivos');
            const carpeta = UCLA.data.carpetasDocumentos.find((c) => c.id === carpetaActivaId);
            panel.innerHTML = `
                <div class="flex items-center justify-center py-16">
                    <i class="fas fa-circle-notch fa-spin text-2xl" style="color: var(--color-primary);"></i>
                    <span class="ml-3 text-sm" style="color: var(--color-text-muted);">Sincronizando carpeta...</span>
                </div>`;
            setTimeout(() => {
                if (carpetaActivaId !== carpeta.id) return;
                const archivos = UCLA.data.documentos.filter((d) => d.carpetaId === carpeta.id);
                panel.innerHTML = `
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold" style="color: var(--color-text);">${carpeta.nombre}</h3>
                        ${carpeta.bloqueada ? `<span class="text-xs px-2 py-1 rounded-full" style="background: var(--color-neutral-100, #F0F2F3); color: var(--color-text-muted);"><i class="fas fa-lock"></i> Solo lectura</span>` : ''}
                    </div>
                    ${archivos.length ? `
                        <div class="space-y-1">
                            ${archivos.map((d) => `
                                <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                                    <i class="fas ${ICONO_TIPO[d.tipo] || 'fa-file'}" style="color: ${COLOR_TIPO[d.tipo] || 'var(--color-text-muted)'};"></i>
                                    <span class="flex-1 text-sm" style="color: var(--color-text);">${d.nombre}</span>
                                    <span class="text-xs" style="color: var(--color-text-muted);">${d.propietario}</span>
                                    <span class="text-xs w-16 text-right" style="color: var(--color-text-muted);">${d.tamano}</span>
                                    <span class="text-xs w-24 text-right" style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(d.fechaModificacion)}</span>
                                </div>`).join('')}
                        </div>` : `<p class="text-sm text-center py-10" style="color: var(--color-text-muted);">Esta carpeta no tiene archivos todavía.</p>`}
                `;
            }, 400);
        }

        pintarCarpetas();
        pintarArchivos();

        container.querySelector('#abrirWorkdrive').addEventListener('click', (e) => {
            e.preventDefault();
            UCLA.components.toast.show('WorkDrive institucional — integración simulada', 'info');
        });
    }

    UCLA.views['crm/documentos'] = { render };
})();

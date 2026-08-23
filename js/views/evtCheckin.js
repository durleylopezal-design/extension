// Eventos · Check-in de Asistencia — selector de evento + búsqueda + tabla de
// asistentes confirmados con toggle de presente/ausente. No usa listShell:
// es una herramienta operativa de un solo propósito, no un listado CRUD genérico.
(function () {
    function eventoInicial() {
        const activo = UCLA.data.eventos.find((e) => e.estado === 'ACTIVO');
        return activo ? activo.codigo : (UCLA.data.eventos[0] && UCLA.data.eventos[0].codigo);
    }

    function render(container) {
        let eventoCodigo = eventoInicial();
        let busqueda = '';

        function confirmados() {
            return UCLA.data.eventosAsistentes.filter((a) => a.eventoCodigo === eventoCodigo && a.estadoInscripcion === 'Confirmado');
        }

        function filtrados() {
            const base = confirmados();
            if (!busqueda.trim()) return base;
            const t = busqueda.trim().toLowerCase();
            return base.filter((a) => a.nombre.toLowerCase().includes(t) || a.documento.includes(t));
        }

        function pintar() {
            const total = confirmados();
            const presentes = total.filter((a) => a.asistio).length;
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-6 mb-4">
                    <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <div>
                            <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">Check-in de Asistencia</h3>
                            <p id="ciContador" class="text-sm mt-1" style="color: var(--color-text-muted);">${presentes} de ${total.length} confirmados registrados como presentes</p>
                        </div>
                        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                            <select id="ciEvento" class="px-3 py-2 text-sm rounded-lg border w-full sm:w-auto" style="border-color: var(--color-border);">
                                ${UCLA.data.eventos.map((e) => `<option value="${e.codigo}" ${e.codigo === eventoCodigo ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                            </select>
                            <input id="ciBuscar" type="text" placeholder="Buscar por nombre o documento..." value="${busqueda}" class="px-3 py-2 text-sm rounded-lg border w-full sm:w-64" style="border-color: var(--color-border);">
                        </div>
                    </div>
                    <div id="ciTabla"></div>
                </div>`;

            UCLA.components.dataTable.render(container.querySelector('#ciTabla'), {
                columnas: [
                    { clave: 'nombre', etiqueta: 'Nombre', render: (a) => `<span class="font-medium" style="color: var(--color-text);">${a.nombre}</span>` },
                    { clave: 'documento', etiqueta: 'Documento' },
                    { clave: 'tipoPublico', etiqueta: 'Tipo de público' },
                    { clave: 'estado', etiqueta: 'Asistencia', render: (a) => a.asistio ? `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: color-mix(in srgb, var(--color-success) 18%, white); color: var(--color-success);"><i class="fas fa-check"></i> Presente</span>` : `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: var(--color-neutral-light, #EEF0F1); color: var(--color-text-muted);">Ausente</span>` },
                    { clave: 'acciones', etiqueta: 'Acciones', render: (a) => `<button data-toggle-asistio="${a.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">${a.asistio ? 'Marcar ausente' : 'Marcar presente'}</button>` },
                ],
                filas: filtrados(),
                filaId: (a) => a.id,
            });

            container.querySelector('#ciEvento').addEventListener('change', (e) => { eventoCodigo = e.target.value; busqueda = ''; pintar(); });
            container.querySelector('#ciBuscar').addEventListener('input', UCLA.utils.debounce((e) => { busqueda = e.target.value; pintar(); }, 250));
            container.querySelectorAll('[data-toggle-asistio]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const a = UCLA.data.eventosAsistentes.find((x) => x.id === btn.getAttribute('data-toggle-asistio'));
                    a.asistio = !a.asistio;
                    pintar();
                });
            });
        }

        pintar();
    }

    UCLA.views['eventos/checkin'] = { render };
})();

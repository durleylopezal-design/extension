// Reportes BI · Exportación — listShell sobre UCLA.data.informes (misma
// fuente que el módulo Informes) con acciones de exportación y programación
// de envío automático (simulado).
(function () {
    const CAMPOS_MODULO = ['Carpeta', 'Módulo'];
    let clickHandler = null;

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Informe', render: (i) => `<span class="font-medium" style="color: var(--color-text);">${i.nombre}</span>` },
            { clave: 'carpeta', etiqueta: 'Carpeta' },
            { clave: 'modulo', etiqueta: 'Módulo' },
            { clave: 'ultimaModificacion', etiqueta: 'Última modificación', render: (i) => UCLA.utils.formatoFecha(i.ultimaModificacion) },
            { clave: 'programado', etiqueta: 'Envío automático', render: (i) => i.programado ? `<span style="color: var(--color-success); font-weight: 600;"><i class="fas fa-check-circle"></i> ${i.programado}</span>` : '-' },
            {
                clave: 'acciones', etiqueta: 'Acciones',
                render: (i) => `<div class="flex gap-2">
                    <button data-csv="${i.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Excel</button>
                    <button data-pdf="${i.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">PDF</button>
                    <button data-programar="${i.id}" class="text-xs font-medium hover:underline" style="color: var(--color-accent-dark);">Programar</button>
                </div>`,
            },
        ];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Exportación de Reportes',
                columnas: columnas(),
                filas: UCLA.data.informes,
                filaId: (i) => i.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'nombre',
                exportName: 'catalogo-informes',
                botonPrincipal: { etiqueta: 'Ir a Informes', onClick: () => UCLA.router.navigate('informes') },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const csv = e.target.closest('[data-csv]');
            const pdf = e.target.closest('[data-pdf]');
            const programar = e.target.closest('[data-programar]');
            if (csv) {
                const i = UCLA.data.informes.find((x) => x.id === csv.getAttribute('data-csv'));
                UCLA.utils.exportCSV(i.nombre, [i]);
            } else if (pdf) {
                UCLA.utils.exportPDF();
            } else if (programar) {
                abrirProgramar(UCLA.data.informes.find((x) => x.id === programar.getAttribute('data-programar')), pintar);
            }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirProgramar(informe, alGuardar) {
        let modal = document.getElementById('modalProgramarEnvio');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalProgramarEnvio';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-pr-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Programar envío automático</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">${informe.nombre}</p>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Frecuencia</label>
                <select id="prFrecuencia" class="input-brand w-full px-3 py-2 text-sm mb-4">
                    <option>Diario</option><option>Semanal</option><option selected>Mensual</option>
                </select>
                <div class="flex justify-end gap-2">
                    <button data-pr-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="prGuardar" class="btn-primary text-sm">Programar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-pr-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#prGuardar').addEventListener('click', () => {
            informe.programado = modal.querySelector('#prFrecuencia').value;
            UCLA.components.toast.show('Envío automático programado', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    UCLA.views['reportes/exportacion'] = { render };
})();

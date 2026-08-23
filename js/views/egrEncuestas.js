// Egresados · Encuestas de Seguimiento — listShell de campañas sobre
// UCLA.data.encuestasEgresados, con resultados agregados (mismo patrón visual
// que eventos/encuestas, pero enfocado en empleabilidad por cohorte).
(function () {
    const CAMPOS_MODULO = ['Cohorte'];

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Encuesta', render: (e) => `<span class="font-medium" style="color: var(--color-text);">${e.nombre}</span>` },
            { clave: 'cohorte', etiqueta: 'Cohorte' },
            { clave: 'fechaEnvio', etiqueta: 'Fecha de envío', render: (e) => UCLA.utils.formatoFecha(e.fechaEnvio) },
            { clave: 'respondidas', etiqueta: 'Respondidas', render: (e) => `${e.respondidas} <span style="color: var(--color-text-muted);">de ${e.enviadas} (${Math.round((e.respondidas / e.enviadas) * 100)}%)</span>` },
            { clave: 'tasaEmpleoReportada', etiqueta: 'Empleo reportado', render: (e) => `${e.tasaEmpleoReportada}%` },
            { clave: 'satisfaccionPrograma', etiqueta: 'Satisfacción', render: (e) => `<i class="fas fa-star text-xs" style="color: var(--color-primary);"></i> ${e.satisfaccionPrograma.toFixed(1)}` },
            { clave: 'acciones', etiqueta: 'Acciones', render: (e) => `<button data-ver="${e.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Ver resultados</button>` },
        ];
    }

    function render(container) {
        container.innerHTML = `<div id="eeLista"></div>`;
        UCLA.components.listShell.render(container.querySelector('#eeLista'), {
            titulo: 'Encuestas de Seguimiento',
            columnas: columnas(),
            filas: UCLA.data.encuestasEgresados,
            filaId: (e) => e.id,
            camposModulo: CAMPOS_MODULO,
            campoOrden: 'fechaEnvio',
            exportName: 'encuestas-egresados',
            botonPrincipal: { etiqueta: 'Enviar encuesta', onClick: () => UCLA.components.toast.show('Encuesta de seguimiento enviada a la cohorte seleccionada (simulado)', 'success') },
        });

        container.querySelectorAll('[data-ver]').forEach((btn) => {
            btn.addEventListener('click', () => abrirResultados(UCLA.data.encuestasEgresados.find((e) => e.id === btn.getAttribute('data-ver'))));
        });
    }

    function abrirResultados(encuesta) {
        let modal = document.getElementById('modalResultadosEncuestaEgresados');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalResultadosEncuestaEgresados';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-re-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">${encuesta.nombre}</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">Cohorte ${encuesta.cohorte} · ${encuesta.respondidas} de ${encuesta.enviadas} respuestas</p>
                <div class="chart-container" style="height: 200px;"><canvas id="chartResultadosEgresados"></canvas></div>
                <div class="flex justify-end pt-4">
                    <button data-re-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cerrar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-re-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.classList.remove('hidden');
        UCLA.components.charts.initDoughnut('chartResultadosEgresados', {
            labels: ['Empleados', 'No empleados'],
            data: [encuesta.tasaEmpleoReportada, 100 - encuesta.tasaEmpleoReportada],
            colors: ['rgba(46, 204, 113, 0.85)', 'rgba(233, 107, 90, 0.75)'],
        });
    }

    UCLA.views['egresados/encuestas'] = { render };
})();

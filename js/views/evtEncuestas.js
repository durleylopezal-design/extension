// Eventos · Encuestas de Satisfacción — listShell de resultados agregados
// sobre UCLA.data.eventosEncuestas. El diseño de preguntas (surveyBuilder) se
// deja para una iteración futura; aquí solo se visualizan resultados y se
// simula el envío de una nueva encuesta.
(function () {
    const CAMPOS_MODULO = ['Evento'];

    function nombreEvento(codigo) {
        const e = UCLA.data.eventos.find((x) => x.codigo === codigo);
        return e ? e.nombre : codigo;
    }

    function columnas() {
        return [
            { clave: 'nombre', etiqueta: 'Encuesta', render: (enc) => `<span class="font-medium" style="color: var(--color-text);">${enc.nombre}</span>` },
            { clave: 'eventoCodigo', etiqueta: 'Evento', render: (enc) => nombreEvento(enc.eventoCodigo) },
            { clave: 'enviadas', etiqueta: 'Enviadas' },
            { clave: 'respondidas', etiqueta: 'Respondidas', render: (enc) => `${enc.respondidas} <span style="color: var(--color-text-muted);">(${Math.round((enc.respondidas / enc.enviadas) * 100)}%)</span>` },
            { clave: 'promedioGeneral', etiqueta: 'Promedio general', render: (enc) => `<span class="font-semibold" style="color: var(--color-primary);"><i class="fas fa-star text-xs"></i> ${enc.promedioGeneral.toFixed(1)}</span>` },
            { clave: 'acciones', etiqueta: 'Acciones', render: (enc) => `<button data-ver="${enc.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Ver resultados</button>` },
        ];
    }

    function render(container) {
        container.innerHTML = `<div id="eeLista"></div>`;
        UCLA.components.listShell.render(container.querySelector('#eeLista'), {
            titulo: 'Encuestas de Satisfacción',
            columnas: columnas(),
            filas: UCLA.data.eventosEncuestas,
            filaId: (enc) => enc.id,
            camposModulo: CAMPOS_MODULO,
            campoOrden: 'nombre',
            exportName: 'encuestas-eventos',
            botonPrincipal: { etiqueta: 'Enviar encuesta', onClick: () => UCLA.components.toast.show('Encuesta enviada a los asistentes confirmados (simulado)', 'success') },
        });

        container.querySelectorAll('[data-ver]').forEach((btn) => {
            btn.addEventListener('click', () => abrirResultados(UCLA.data.eventosEncuestas.find((enc) => enc.id === btn.getAttribute('data-ver'))));
        });
    }

    function abrirResultados(encuesta) {
        let modal = document.getElementById('modalResultadosEncuesta');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalResultadosEncuesta';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-re-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">${encuesta.nombre}</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">${encuesta.respondidas} respuestas de ${encuesta.enviadas} envíos · Promedio general ${encuesta.promedioGeneral.toFixed(1)}</p>
                <div class="chart-container" style="height: 220px;"><canvas id="chartResultadosEncuesta"></canvas></div>
                <div class="flex justify-end pt-4">
                    <button data-re-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cerrar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-re-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.classList.remove('hidden');
        UCLA.components.charts.initBar('chartResultadosEncuesta', {
            labels: encuesta.preguntas.map((p) => p.texto),
            datasets: [{ label: 'Promedio (1-5)', data: encuesta.preguntas.map((p) => p.promedio), backgroundColor: 'rgba(28, 127, 168, 0.82)', borderRadius: 6 }],
        });
    }

    UCLA.views['eventos/encuestas'] = { render };
})();

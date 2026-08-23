// Asistente Virtual (#/asistente) — chat de preguntas frecuentes con
// respuestas basadas en datos reales de UCLA.data (no un LLM real: reglas por
// palabra clave), para dar una idea del asistente conversacional planeado.
(function () {
    const SUGERENCIAS = ['¿Cuál es la cartera vencida?', '¿Cuántas solicitudes de admisión están pendientes?', '¿Qué eventos tienen cupos disponibles?', '¿Cuál es la tasa de empleabilidad de egresados?'];
    let mensajes = [{ autor: 'asistente', texto: 'Hola, soy el asistente virtual de UCLA Extensión. Puedo responder preguntas rápidas sobre cartera, solicitudes, becas, eventos, alianzas, certificados y egresados. ¿En qué te ayudo?' }];

    function estadoConvenio(c) {
        return UCLA.views['alianzas/convenios'].estadoConvenio(c);
    }

    function responder(pregunta) {
        const p = pregunta.toLowerCase();

        if (/cartera|mora|vencid/.test(p) && !/convenio/.test(p)) {
            const vencida = UCLA.data.cuentasPorCobrar.filter((c) => c.diasMora > 0).reduce((s, c) => s + c.saldo, 0);
            const cuentas = UCLA.data.cuentasPorCobrar.filter((c) => c.diasMora > 0).length;
            return `La cartera vencida actual es de ${UCLA.utils.formatoCOP(vencida)} en ${cuentas} cuenta(s) por cobrar. Puedes verlas en Financiero › Cartera por Cobrar.`;
        }
        if (/admisi.*pendient|solicitudes.*admisi/.test(p)) {
            const pendientes = UCLA.data.solicitudesAdmision.filter((s) => s.estado === 'En revisión' || s.estado === 'Recibida').length;
            return `Hay ${pendientes} solicitud(es) de admisión pendientes de revisión. Puedes gestionarlas en Solicitudes › Solicitudes de Admisión.`;
        }
        if (/beca/.test(p)) {
            const aprobadas = UCLA.data.solicitudesBecas.filter((b) => b.estado === 'Aprobada');
            const promedio = aprobadas.length ? Math.round(aprobadas.reduce((s, b) => s + b.porcentajeAprobado, 0) / aprobadas.length) : 0;
            return `Hay ${aprobadas.length} beca(s) aprobada(s), con un porcentaje promedio de ${promedio}%. Están disponibles en Financiero › Becas y Descuentos.`;
        }
        if (/cupo|evento.*disponib/.test(p)) {
            const conCupo = UCLA.data.eventos.filter((e) => e.estado !== 'CANCELADO' && e.cupoOcupado < e.cupoMaximo);
            if (!conCupo.length) return 'Por ahora no hay eventos con cupos disponibles.';
            return `Eventos con cupos disponibles: ${conCupo.map((e) => `${e.nombre} (${e.cupoMaximo - e.cupoOcupado} cupos)`).join(', ')}.`;
        }
        if (/egresad.*emple|empleabilidad/.test(p)) {
            const empleados = UCLA.data.egresados.filter((e) => e.situacionLaboral === 'Empleado' || e.situacionLaboral === 'Independiente');
            const tasa = Math.round((empleados.length / UCLA.data.egresados.length) * 100);
            return `La tasa de empleabilidad reportada es del ${tasa}% (${empleados.length} de ${UCLA.data.egresados.length} egresados registrados). Más detalle en Seguimiento a Egresados › Indicadores de Empleabilidad.`;
        }
        if (/convenio.*vencer|alianza/.test(p)) {
            const porVencer = UCLA.data.convenios.filter((c) => estadoConvenio(c) === 'Por vencer').length;
            return `Hay ${porVencer} convenio(s) próximos a vencer en los siguientes 60 días. Puedes revisarlos en Alianzas › Seguimiento de Acuerdos y Vigencias.`;
        }
        if (/certificad/.test(p)) {
            const emitidos = UCLA.data.certificadosEmitidos.filter((c) => c.estado === 'Emitido').length;
            return `Se han emitido ${emitidos} certificado(s) válidos hasta el momento. Puedes verificarlos en Certificados › Historial de Emitidos.`;
        }
        if (/hola|buenas|ayuda|gracias/.test(p)) {
            return 'Con gusto. Puedes preguntarme por cartera vencida, solicitudes pendientes, becas aprobadas, cupos disponibles, convenios por vencer, certificados emitidos o empleabilidad de egresados.';
        }
        return 'Todavía no tengo información sobre eso. Puedes preguntarme por cartera vencida, solicitudes pendientes, becas aprobadas, cupos de eventos disponibles, convenios por vencer, certificados emitidos o empleabilidad de egresados.';
    }

    function render(container) {
        function pintar() {
            container.innerHTML = `
                <div class="max-w-2xl mx-auto flex flex-col h-[calc(100vh-260px)] sm:h-[calc(100vh-220px)] lg:h-[calc(100vh-180px)]">
                    <div class="bg-white rounded-t-xl shadow-lg p-4 flex items-center gap-3" style="border-bottom: 1px solid var(--color-border);">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--color-primary-50);"><i class="fas fa-robot" style="color: var(--color-primary);"></i></div>
                        <div>
                            <p class="text-sm font-bold" style="color: var(--color-primary-dark);">Asistente Virtual UCLA</p>
                            <p class="text-xs" style="color: var(--color-text-muted);">Respuestas basadas en los datos actuales del CRM</p>
                        </div>
                    </div>
                    <div id="asMensajes" class="flex-1 bg-white overflow-y-auto p-4 space-y-3"></div>
                    <div class="bg-white rounded-b-xl shadow-lg p-3" style="border-top: 1px solid var(--color-border);">
                        <div class="flex flex-wrap gap-2 mb-2">
                            ${SUGERENCIAS.map((s) => `<button data-sugerencia="${s}" class="text-xs px-3 py-1 rounded-full border hover:bg-gray-50" style="border-color: var(--color-border); color: var(--color-text-muted);">${s}</button>`).join('')}
                        </div>
                        <div class="flex gap-2">
                            <input id="asInput" type="text" placeholder="Escribe tu pregunta..." class="input-brand flex-1 px-3 py-2 text-sm">
                            <button id="asEnviar" class="btn-primary text-sm"><i class="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>`;

            const cuerpo = container.querySelector('#asMensajes');
            cuerpo.innerHTML = mensajes.map((m) => `
                <div class="flex ${m.autor === 'usuario' ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[80%] rounded-xl px-4 py-2 text-sm" style="${m.autor === 'usuario' ? 'background: var(--color-primary); color: #fff;' : 'background: var(--color-primary-50); color: var(--color-text);'}">${m.texto}</div>
                </div>`).join('');
            cuerpo.scrollTop = cuerpo.scrollHeight;

            const enviar = () => {
                const input = container.querySelector('#asInput');
                const texto = input.value.trim();
                if (!texto) return;
                mensajes.push({ autor: 'usuario', texto });
                mensajes.push({ autor: 'asistente', texto: responder(texto) });
                input.value = '';
                pintar();
                container.querySelector('#asInput').focus();
            };

            container.querySelector('#asEnviar').addEventListener('click', enviar);
            container.querySelector('#asInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') enviar(); });
            container.querySelectorAll('[data-sugerencia]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    mensajes.push({ autor: 'usuario', texto: btn.getAttribute('data-sugerencia') });
                    mensajes.push({ autor: 'asistente', texto: responder(btn.getAttribute('data-sugerencia')) });
                    pintar();
                });
            });
        }

        pintar();
    }

    UCLA.views['asistente'] = { render };
})();

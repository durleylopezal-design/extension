// Financiero · Becas y Descuentos Aplicados — lee UCLA.data.solicitudesBecas
// filtrado por estado 'Aprobada' (misma fuente que Solicitudes › Becas).
// El valor condonado se estima sobre un valor de matrícula promedio de
// referencia, ya que el prototipo no liga facturas reales a cada beca.
(function () {
    const CAMPOS_MODULO = ['Programa', 'Tipo', 'Modalidad', 'Periodo académico', 'Estado'];
    const MATRICULA_PROMEDIO = 2900000;

    function columnas() {
        return [
            { clave: 'solicitante', etiqueta: 'Beneficiario', render: (f) => `<span class="font-medium" style="color: var(--color-text);">${f.solicitante}</span>` },
            { clave: 'programa', etiqueta: 'Programa' },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'modalidadBeca', etiqueta: 'Modalidad' },
            { clave: 'porcentajeAprobado', etiqueta: 'Porcentaje', render: (f) => `${f.porcentajeAprobado}%` },
            { clave: 'valorCondonado', etiqueta: 'Valor condonado', render: (f) => UCLA.utils.formatoCOP(MATRICULA_PROMEDIO * (f.porcentajeAprobado / 100)) },
            { clave: 'periodo', etiqueta: 'Periodo académico' },
            { clave: 'estadoBeca', etiqueta: 'Estado', render: () => UCLA.utils.badgeEstado('Activa') },
            { clave: 'revisor', etiqueta: 'Aprobado por' },
            { clave: 'fecha', etiqueta: 'Fecha de aprobación', render: (f) => UCLA.utils.formatoFecha(f.fecha) },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Beca o descuento otorgado directamente',
            camposIzquierda: [
                { clave: 'solicitante', etiqueta: 'Beneficiario', tipo: 'text', obligatorio: true },
                { clave: 'programa', etiqueta: 'Programa', tipo: 'text' },
                { clave: 'tipo', etiqueta: 'Tipo', tipo: 'select', opciones: ['Beca', 'Descuento'] },
            ],
            camposDerecha: [
                { clave: 'modalidadBeca', etiqueta: 'Modalidad', tipo: 'select', opciones: ['Excelencia académica', 'Socioeconómica', 'Convenio empresarial', 'Egresado', 'Grupo familiar'] },
                { clave: 'porcentajeAprobado', etiqueta: 'Porcentaje otorgado', tipo: 'text' },
                { clave: 'revisor', etiqueta: 'Aprobado por', tipo: 'text' },
            ],
        }];
    }

    function render(container) {
        function filasAprobadas() {
            return UCLA.data.solicitudesBecas.filter((b) => b.estado === 'Aprobada');
        }

        function pintar() {
            const filas = filasAprobadas();
            const montoTotal = filas.reduce((s, f) => s + MATRICULA_PROMEDIO * (f.porcentajeAprobado / 100), 0);
            const porcentajePromedio = filas.length ? Math.round(filas.reduce((s, f) => s + f.porcentajeAprobado, 0) / filas.length) : 0;

            container.innerHTML = `
                <div id="finBecasStats" class="mb-4"></div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div id="finBecasLista" class="lg:col-span-2"></div>
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <h3 class="section-title text-base mb-4">Monto Condonado por Modalidad</h3>
                        <div class="chart-container" style="height: 220px;"><canvas id="chartBecasModalidad"></canvas></div>
                    </div>
                </div>`;

            UCLA.components.statCards.render(container.querySelector('#finBecasStats'), [
                { etiqueta: 'Monto condonado en el periodo', valor: UCLA.utils.formatoCOP(montoTotal), color: 'var(--color-success)' },
                { etiqueta: 'Becas activas', valor: String(filas.length), color: 'var(--color-primary)' },
                { etiqueta: 'Porcentaje promedio', valor: `${porcentajePromedio}%`, color: 'var(--color-primary)' },
                { etiqueta: 'Beneficiarios', valor: String(new Set(filas.map((f) => f.solicitante)).size), color: 'var(--color-accent)' },
            ]);

            UCLA.components.listShell.render(container.querySelector('#finBecasLista'), {
                titulo: 'Becas y Descuentos Aplicados',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fecha',
                exportName: 'becas-aplicadas',
                botonPrincipal: {
                    etiqueta: 'Aplicar beca o descuento',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Aplicar beca o descuento',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.data.solicitudesBecas.unshift({
                                id: 'sb-' + Date.now(), radicado: 'BEC-2026-' + Math.floor(1000 + Math.random() * 8999),
                                solicitante: datos.solicitante || 'Sin nombre', tipo: datos.tipo || 'Beca',
                                modalidadBeca: datos.modalidadBeca || '', programa: datos.programa || '',
                                porcentajeSolicitado: Number(datos.porcentajeAprobado) || 0, porcentajeAprobado: Number(datos.porcentajeAprobado) || 0,
                                justificacion: 'Otorgada directamente sin solicitud previa', ingresos: 0, estrato: null,
                                estado: 'Aprobada', revisor: datos.revisor || UCLA.state.usuarioActual.nombre, periodo: '2026-2',
                                fecha: new Date().toISOString().slice(0, 10), comentario: '',
                            });
                            pintar();
                        },
                    }),
                },
            });

            const porModalidad = {};
            filas.forEach((f) => { porModalidad[f.modalidadBeca] = (porModalidad[f.modalidadBeca] || 0) + MATRICULA_PROMEDIO * (f.porcentajeAprobado / 100); });
            UCLA.components.charts.initDoughnut('chartBecasModalidad', {
                labels: Object.keys(porModalidad),
                data: Object.values(porModalidad),
            });
        }

        pintar();
    }

    UCLA.views['financiero/becas'] = { render };
})();

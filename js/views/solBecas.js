// Solicitudes · Becas o descuentos — listShell + recordForm. Al aprobar,
// el registro queda disponible tal cual en Financiero › Becas (misma fuente
// de datos, UCLA.data.solicitudesBecas).
(function () {
    const CAMPOS_MODULO = ['Solicitante', 'Tipo', 'Modalidad', 'Programa', 'Estado', 'Revisor', 'Periodo'];
    let clickHandler = null;

    function columnas() {
        return [
            { clave: 'radicado', etiqueta: 'Radicado', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.radicado}</span>` },
            { clave: 'solicitante', etiqueta: 'Solicitante' },
            { clave: 'tipo', etiqueta: 'Tipo' },
            { clave: 'programa', etiqueta: 'Programa' },
            { clave: 'porcentajeSolicitado', etiqueta: '% Solicitado', render: (f) => `${f.porcentajeSolicitado}%` },
            { clave: 'porcentajeAprobado', etiqueta: '% Aprobado', render: (f) => f.porcentajeAprobado != null ? `${f.porcentajeAprobado}%` : '—' },
            { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
            { clave: 'fecha', etiqueta: 'Fecha', render: (f) => UCLA.utils.formatoFecha(f.fecha) },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `<button data-resolver-beca="${f.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Resolver</button>` },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Información de la solicitud',
            camposIzquierda: [
                { clave: 'solicitante', etiqueta: 'Solicitante', tipo: 'text', obligatorio: true },
                { clave: 'programa', etiqueta: 'Programa', tipo: 'text', obligatorio: true },
                { clave: 'tipo', etiqueta: 'Tipo', tipo: 'select', opciones: ['Beca', 'Descuento'] },
                { clave: 'modalidadBeca', etiqueta: 'Modalidad de beca', tipo: 'select', opciones: ['Excelencia académica', 'Socioeconómica', 'Convenio empresarial', 'Egresado', 'Grupo familiar'] },
                { clave: 'porcentajeSolicitado', etiqueta: 'Porcentaje solicitado', tipo: 'text', placeholder: '%' },
            ],
            camposDerecha: [
                { clave: 'justificacion', etiqueta: 'Justificación', tipo: 'textarea' },
                { clave: 'ingresos', etiqueta: 'Ingresos declarados', tipo: 'text' },
                { clave: 'estrato', etiqueta: 'Estrato', tipo: 'select', opciones: ['1', '2', '3', '4', '5', '6'] },
                { clave: 'documentosSoporte', etiqueta: 'Documentos de soporte adjuntos', tipo: 'checkbox' },
                { clave: 'revisor', etiqueta: 'Revisor', tipo: 'text', placeholder: 'Comité de Becas' },
            ],
        }];
    }

    function render(container) {
        const filas = UCLA.data.solicitudesBecas.slice();

        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Solicitudes de Becas o Descuentos',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fecha',
                exportName: 'solicitudes-becas',
                botonPrincipal: {
                    etiqueta: 'Crear solicitud de beca',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva solicitud de beca',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            filas.unshift({
                                id: 'sb-' + Date.now(), radicado: 'BEC-2026-' + Math.floor(1000 + Math.random() * 8999),
                                solicitante: datos.solicitante || 'Sin nombre', tipo: datos.tipo || 'Beca',
                                modalidadBeca: datos.modalidadBeca || '', programa: datos.programa || '',
                                porcentajeSolicitado: Number(datos.porcentajeSolicitado) || 0, porcentajeAprobado: null,
                                justificacion: datos.justificacion || '', ingresos: Number(datos.ingresos) || 0,
                                estrato: Number(datos.estrato) || 3, estado: 'Recibida',
                                revisor: datos.revisor || 'Comité de Becas', periodo: '2026-2',
                                fecha: new Date().toISOString().slice(0, 10), comentario: '',
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        function abrirResolver(id) {
            const beca = filas.find((f) => f.id === id);
            if (!beca) return;
            let modal = document.getElementById('modalResolverBeca');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'modalResolverBeca';
                modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
                document.body.appendChild(modal);
            }
            modal.innerHTML = `
                <div class="fixed inset-0 bg-black opacity-40" data-rb-cerrar></div>
                <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                    <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Resolver solicitud</h3>
                    <p class="text-sm mb-4" style="color: var(--color-text-muted);">${beca.radicado} · ${beca.solicitante} — ${beca.porcentajeSolicitado}% solicitado</p>
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Decisión</label>
                    <select id="rbEstado" class="input-brand w-full px-3 py-2 text-sm mb-3">
                        <option>Aprobada</option><option>Rechazada</option>
                    </select>
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Porcentaje aprobado</label>
                    <input id="rbPorcentaje" type="text" value="${beca.porcentajeSolicitado}" class="input-brand w-full px-3 py-2 text-sm mb-3">
                    <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Comentario del comité</label>
                    <textarea id="rbComentario" rows="2" class="input-brand w-full px-3 py-2 text-sm"></textarea>
                    <div class="flex justify-end gap-2 pt-4">
                        <button data-rb-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                        <button id="rbGuardar" class="btn-primary text-sm">Guardar</button>
                    </div>
                </div>`;
            modal.querySelectorAll('[data-rb-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
            modal.querySelector('#rbGuardar').addEventListener('click', () => {
                const estado = modal.querySelector('#rbEstado').value;
                beca.estado = estado;
                beca.porcentajeAprobado = estado === 'Aprobada' ? Number(modal.querySelector('#rbPorcentaje').value) || 0 : 0;
                beca.comentario = modal.querySelector('#rbComentario').value;
                UCLA.components.toast.show(
                    estado === 'Aprobada' ? 'Beca aprobada — ya está disponible en Financiero › Becas' : 'Solicitud rechazada',
                    estado === 'Aprobada' ? 'success' : 'info'
                );
                modal.classList.add('hidden');
                pintar();
            });
            modal.classList.remove('hidden');
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-resolver-beca]');
            if (btn) abrirResolver(btn.getAttribute('data-resolver-beca'));
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['solicitudes/becas'] = { render };
})();

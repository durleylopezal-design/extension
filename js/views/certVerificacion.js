// Certificados · Verificación Pública — buscador por código de verificación
// sobre UCLA.data.certificadosEmitidos (misma fuente que certificados/historial).
// No usa listShell: es una herramienta de búsqueda de un solo resultado.
(function () {
    function eventoDe(codigo) { return UCLA.data.eventos.find((e) => e.codigo === codigo); }

    function render(container) {
        container.innerHTML = `
            <div class="max-w-xl mx-auto">
                <div class="bg-white rounded-xl shadow-lg p-8 text-center">
                    <i class="fas fa-shield-halved text-3xl mb-3" style="color: var(--color-primary);"></i>
                    <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Verificación Pública de Certificados</h3>
                    <p class="text-sm mb-4" style="color: var(--color-text-muted);">Ingresa el código de verificación impreso en el certificado (ej. UCLA-DIP0392-0001).</p>
                    <div class="flex gap-2">
                        <input id="cvCodigo" type="text" placeholder="UCLA-XXXX0000-0000" class="input-brand flex-1 px-3 py-2 text-sm">
                        <button id="cvBuscar" class="btn-primary text-sm">Verificar</button>
                    </div>
                </div>
                <div id="cvResultado" class="mt-4"></div>
            </div>`;

        const buscar = () => {
            const codigo = container.querySelector('#cvCodigo').value.trim().toUpperCase();
            const resultado = container.querySelector('#cvResultado');
            if (!codigo) { resultado.innerHTML = ''; return; }
            const certificado = UCLA.data.certificadosEmitidos.find((c) => c.codigoVerificacion.toUpperCase() === codigo);
            if (!certificado) {
                resultado.innerHTML = `
                    <div class="bg-white rounded-xl shadow-lg p-6 text-center" style="border-left: 4px solid var(--color-danger);">
                        <i class="fas fa-circle-xmark text-2xl mb-2" style="color: var(--color-danger);"></i>
                        <p class="text-sm font-semibold" style="color: var(--color-danger);">Código no encontrado</p>
                        <p class="text-xs mt-1" style="color: var(--color-text-muted);">Verifica que el código esté escrito correctamente.</p>
                    </div>`;
                return;
            }
            const evento = eventoDe(certificado.eventoCodigo);
            const valido = certificado.estado === 'Emitido';
            resultado.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-6" style="border-left: 4px solid ${valido ? 'var(--color-success)' : 'var(--color-danger)'};">
                    <div class="flex items-center gap-2 mb-3">
                        <i class="fas ${valido ? 'fa-circle-check' : 'fa-circle-exclamation'} text-2xl" style="color: ${valido ? 'var(--color-success)' : 'var(--color-danger)'};"></i>
                        <p class="text-sm font-semibold" style="color: ${valido ? 'var(--color-success)' : 'var(--color-danger)'};">${valido ? 'Certificado válido' : 'Certificado revocado'}</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Destinatario</p><p>${certificado.destinatario}</p></div>
                        <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Evento</p><p>${evento ? evento.nombre : certificado.eventoCodigo}</p></div>
                        <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Fecha de emisión</p><p>${UCLA.utils.formatoFecha(certificado.fechaEmision)}</p></div>
                        <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Código</p><p>${certificado.codigoVerificacion}</p></div>
                    </div>
                </div>`;
        };

        container.querySelector('#cvBuscar').addEventListener('click', buscar);
        container.querySelector('#cvCodigo').addEventListener('keydown', (e) => { if (e.key === 'Enter') buscar(); });
    }

    UCLA.views['certificados/verificacion'] = { render };
})();

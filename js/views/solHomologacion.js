// Solicitudes · Homologación — listShell + modal a medida (no recordForm)
// por la sección repetible "Asignaturas a homologar".
(function () {
    const CAMPOS_MODULO = ['Solicitante', 'Programa destino', 'Institución de origen', 'Estado', 'Evaluador', 'Fecha de radicado'];

    function creditos(solicitud, filtro) {
        return solicitud.asignaturas.filter((a) => (filtro ? a.resultado === filtro : true)).reduce((sum, a) => sum + Number(a.creditos || 0), 0);
    }

    function columnas() {
        return [
            { clave: 'radicado', etiqueta: 'Radicado', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.radicado}</span>` },
            { clave: 'solicitante', etiqueta: 'Solicitante' },
            { clave: 'programaDestino', etiqueta: 'Programa destino' },
            { clave: 'institucionOrigen', etiqueta: 'Institución de origen' },
            { clave: 'creditosSolicitados', etiqueta: 'Créditos solicitados', render: (f) => creditos(f) },
            { clave: 'creditosHomologados', etiqueta: 'Créditos homologados', render: (f) => creditos(f, 'Homologada') },
            { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
            { clave: 'evaluador', etiqueta: 'Evaluador' },
        ];
    }

    function render(container) {
        const filas = UCLA.data.solicitudesHomologacion.slice();

        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Solicitudes de Homologación',
                columnas: columnas(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaRadicado',
                exportName: 'solicitudes-homologacion',
                botonPrincipal: { etiqueta: 'Crear solicitud de homologación', onClick: () => abrirModal(filas, pintar) },
            });
        }

        pintar();
    }

    function abrirModal(filas, alGuardar) {
        let modal = document.getElementById('modalHomologacion');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalHomologacion';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        let asignaturas = [];

        function pintarAsignaturas() {
            const tbody = modal.querySelector('#homAsignaturas');
            tbody.innerHTML = asignaturas.map((a, i) => `
                <tr>
                    <td class="py-1 pr-2"><input data-a-campo="origen" data-a-idx="${i}" type="text" value="${a.origen}" class="input-brand w-full px-2 py-1 text-xs"></td>
                    <td class="py-1 pr-2 w-16"><input data-a-campo="creditos" data-a-idx="${i}" type="number" value="${a.creditos}" class="input-brand w-full px-2 py-1 text-xs"></td>
                    <td class="py-1 pr-2 w-16"><input data-a-campo="nota" data-a-idx="${i}" type="text" value="${a.nota}" class="input-brand w-full px-2 py-1 text-xs"></td>
                    <td class="py-1 pr-2"><input data-a-campo="equivalente" data-a-idx="${i}" type="text" value="${a.equivalente}" class="input-brand w-full px-2 py-1 text-xs"></td>
                    <td class="py-1 pr-2 w-32">
                        <select data-a-campo="resultado" data-a-idx="${i}" class="input-brand w-full px-2 py-1 text-xs">
                            ${['Pendiente', 'Homologada', 'No homologada'].map((r) => `<option ${r === a.resultado ? 'selected' : ''}>${r}</option>`).join('')}
                        </select>
                    </td>
                    <td class="py-1"><button type="button" data-quitar-asignatura="${i}" style="color: var(--color-danger);"><i class="fas fa-trash text-xs"></i></button></td>
                </tr>`).join('');

            tbody.querySelectorAll('[data-a-campo]').forEach((el) => {
                el.addEventListener('input', (e) => {
                    asignaturas[Number(e.target.getAttribute('data-a-idx'))][e.target.getAttribute('data-a-campo')] = e.target.value;
                    pintarContadores();
                });
            });
            tbody.querySelectorAll('[data-quitar-asignatura]').forEach((btn) => {
                btn.addEventListener('click', () => { asignaturas.splice(Number(btn.getAttribute('data-quitar-asignatura')), 1); pintarAsignaturas(); pintarContadores(); });
            });
            pintarContadores();
        }

        function pintarContadores() {
            const solicitados = asignaturas.reduce((s, a) => s + Number(a.creditos || 0), 0);
            const homologados = asignaturas.filter((a) => a.resultado === 'Homologada').reduce((s, a) => s + Number(a.creditos || 0), 0);
            const el = modal.querySelector('#homContadores');
            if (el) el.textContent = `${solicitados} créditos solicitados · ${homologados} créditos homologados`;
        }

        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-hom-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">Nueva solicitud de homologación</h3>
                    <button data-hom-cerrar class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Solicitante *</label><input id="homSolicitante" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                    <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Programa destino *</label><input id="homProgramaDestino" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                    <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Institución de origen</label><input id="homInstitucion" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                    <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Programa de origen</label><input id="homProgramaOrigen" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                    <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Año de cursado</label><input id="homAno" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                    <div><label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Evaluador académico</label><input id="homEvaluador" type="text" class="input-brand w-full px-3 py-2 text-sm"></div>
                </div>

                <div class="flex items-center justify-between mb-2">
                    <p class="text-sm font-bold" style="color: var(--color-primary);">Asignaturas a homologar</p>
                    <span id="homContadores" class="text-xs" style="color: var(--color-text-muted);"></span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead><tr style="color: var(--color-text-muted);">
                            <th class="text-left pb-1">Asignatura de origen</th><th class="text-left pb-1">Créditos</th><th class="text-left pb-1">Nota</th>
                            <th class="text-left pb-1">Equivalente UCLA</th><th class="text-left pb-1">Resultado</th><th></th>
                        </tr></thead>
                        <tbody id="homAsignaturas"></tbody>
                    </table>
                </div>
                <button type="button" id="homAgregarAsignatura" class="text-xs font-medium hover:underline mt-2" style="color: var(--color-primary);"><i class="fas fa-plus mr-1"></i>Agregar asignatura</button>

                <div class="flex justify-end gap-2 pt-6">
                    <button data-hom-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="homGuardar" class="btn-primary text-sm">Guardar</button>
                </div>
            </div>`;

        modal.querySelectorAll('[data-hom-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#homAgregarAsignatura').addEventListener('click', () => {
            asignaturas.push({ origen: '', creditos: 0, nota: '', equivalente: '', resultado: 'Pendiente' });
            pintarAsignaturas();
        });
        modal.querySelector('#homGuardar').addEventListener('click', () => {
            const solicitante = modal.querySelector('#homSolicitante');
            const programaDestino = modal.querySelector('#homProgramaDestino');
            let valido = true;
            [solicitante, programaDestino].forEach((el) => { if (!el.value.trim()) { el.style.borderColor = 'var(--color-danger)'; valido = false; } });
            if (!valido) return;

            filas.unshift({
                id: 'sh-' + Date.now(), radicado: 'HOM-2026-' + Math.floor(1000 + Math.random() * 8999),
                solicitante: solicitante.value.trim(), programaDestino: programaDestino.value.trim(),
                institucionOrigen: modal.querySelector('#homInstitucion').value, programaOrigen: modal.querySelector('#homProgramaOrigen').value,
                anoCursado: modal.querySelector('#homAno').value, evaluador: modal.querySelector('#homEvaluador').value,
                fechaRadicado: new Date().toISOString().slice(0, 10), estado: 'Recibida', asignaturas: asignaturas.slice(),
            });
            UCLA.components.toast.show('Solicitud de homologación radicada', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });

        asignaturas = [{ origen: '', creditos: 0, nota: '', equivalente: '', resultado: 'Pendiente' }];
        pintarAsignaturas();
        modal.classList.remove('hidden');
    }

    UCLA.views['solicitudes/homologacion'] = { render };
})();

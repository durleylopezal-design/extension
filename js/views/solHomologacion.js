// Solicitudes · Homologación — listShell + modal a medida (no recordForm)
// por la sección repetible "Asignaturas a homologar".
(function () {
    // Estados reales observados en UCLA.data.solicitudesHomologacion; cada
    // casilla filtra de verdad (activos.includes(f.estado)).
    const ESTADOS_FILTRO = ['Recibida', 'En revisión', 'Aprobada', 'Rechazada'];
    const CAMPOS_MODULO = ESTADOS_FILTRO;

    function filtrarPorCampos(f, activos) {
        return activos.includes(f.estado);
    }

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
        let seleccionadaDividida = null;

        // --- Dinámica: agrupa la tabla por estado o institución de origen ---
        function vistaDinamica(cuerpo, filas) {
            const opciones = [
                { id: 'ninguno', etiqueta: 'Ninguno' },
                { id: 'estado', etiqueta: 'Estado' },
                { id: 'institucionOrigen', etiqueta: 'Institución de origen' },
                { id: 'evaluador', etiqueta: 'Evaluador' },
            ];
            let agruparPor = 'estado';
            function pintarDinamica() {
                cuerpo.innerHTML = `
                    <div class="flex items-center gap-2 mb-4">
                        <label class="text-sm font-medium" style="color: var(--color-text-muted);">Agrupar por</label>
                        <select id="homAgruparPor" class="input-brand px-3 py-1.5 text-sm">
                            ${opciones.map((o) => `<option value="${o.id}" ${agruparPor === o.id ? 'selected' : ''}>${o.etiqueta}</option>`).join('')}
                        </select>
                    </div>
                    <div id="homGruposDinamica" class="space-y-6"></div>`;
                cuerpo.querySelector('#homAgruparPor').addEventListener('change', (e) => { agruparPor = e.target.value; pintarDinamica(); });

                const contenedor = cuerpo.querySelector('#homGruposDinamica');
                if (agruparPor === 'ninguno') {
                    const div = document.createElement('div');
                    contenedor.appendChild(div);
                    UCLA.components.dataTable.render(div, { columnas: columnas(), filas, filaId: (f) => f.id });
                    return;
                }
                const grupos = {};
                filas.forEach((f) => { const clave = f[agruparPor] || 'Sin definir'; (grupos[clave] = grupos[clave] || []).push(f); });
                contenedor.innerHTML = '';
                Object.keys(grupos).forEach((clave) => {
                    const seccion = document.createElement('div');
                    seccion.innerHTML = `<h4 class="text-sm font-bold uppercase tracking-wide mb-2" style="color: var(--color-primary);">${clave} <span style="color: var(--color-text-muted); font-weight: 400;">(${grupos[clave].length})</span></h4><div class="homTablaGrupo mb-4"></div>`;
                    contenedor.appendChild(seccion);
                    UCLA.components.dataTable.render(seccion.querySelector('.homTablaGrupo'), { columnas: columnas(), filas: grupos[clave], filaId: (f) => f.id });
                });
            }
            pintarDinamica();
        }

        // --- Línea de tiempo: ordenada por fecha de radicado ---
        function vistaLineaTiempo(cuerpo, filas) {
            const ordenadas = filas.slice().sort((a, b) => (b.fechaRadicado || '').localeCompare(a.fechaRadicado || ''));
            cuerpo.innerHTML = !ordenadas.length ? `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">No hay solicitudes para mostrar.</div>` : `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="space-y-5">
                        ${ordenadas.map((f) => `
                            <div class="flex gap-3">
                                <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--color-primary-50);">
                                    <i class="fas fa-right-left text-sm" style="color: var(--color-primary);"></i>
                                </div>
                                <div class="flex-1 pb-4" style="border-bottom: 1px solid var(--color-border);">
                                    <div class="flex items-center justify-between flex-wrap gap-1">
                                        <p class="text-sm font-semibold" style="color: var(--color-text);">${f.solicitante} <span class="font-normal" style="color: var(--color-text-muted);">· ${f.radicado}</span></p>
                                        <span class="text-xs" style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(f.fechaRadicado)}</span>
                                    </div>
                                    <p class="text-sm mt-0.5" style="color: var(--color-text-muted);">${f.institucionOrigen || 'Institución no registrada'} → ${f.programaDestino}</p>
                                    <div class="mt-1">${UCLA.utils.badgeEstado(f.estado)}</div>
                                </div>
                            </div>`).join('')}
                    </div>
                </div>`;
        }

        // --- Vista dividida: lista + detalle sincronizados sin navegar ---
        function vistaDividida(cuerpo, filas) {
            if (!seleccionadaDividida || !filas.some((f) => f.id === seleccionadaDividida)) {
                seleccionadaDividida = filas[0]?.id || null;
            }
            cuerpo.innerHTML = `
                <div class="flex flex-col lg:flex-row gap-4 items-start">
                    <div class="w-full lg:w-80 lg:flex-shrink-0" id="homListaDividida"></div>
                    <div class="flex-1 min-w-0 w-full" id="homDetalleDividida"></div>
                </div>`;

            function pintarLista() {
                UCLA.components.dataTable.render(cuerpo.querySelector('#homListaDividida'), {
                    columnas: [
                        { clave: 'solicitante', etiqueta: 'Solicitante', render: (f) => `<span class="font-medium" style="color: ${f.id === seleccionadaDividida ? 'var(--color-primary)' : 'var(--color-text)'};">${f.solicitante}</span>` },
                        { clave: 'estado', etiqueta: 'Estado', render: (f) => UCLA.utils.badgeEstado(f.estado) },
                    ],
                    filas,
                    filaId: (f) => f.id,
                    onFilaClick: (f) => { seleccionadaDividida = f.id; pintarLista(); pintarDetalle(); },
                });
            }

            function pintarDetalle() {
                const detalle = cuerpo.querySelector('#homDetalleDividida');
                const f = filas.find((x) => x.id === seleccionadaDividida);
                if (!f) { detalle.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Seleccione una solicitud de la lista.</div>`; return; }
                detalle.innerHTML = `
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-start justify-between flex-wrap gap-2 mb-4">
                            <div>
                                <h3 class="text-xl font-bold" style="color: var(--color-primary-dark);">${f.solicitante}</h3>
                                <p class="text-sm" style="color: var(--color-text-muted);">${f.radicado}</p>
                            </div>
                            ${UCLA.utils.badgeEstado(f.estado)}
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Programa destino</p><p style="color: var(--color-text);">${f.programaDestino}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Institución de origen</p><p style="color: var(--color-text);">${f.institucionOrigen || '-'}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Programa de origen</p><p style="color: var(--color-text);">${f.programaOrigen || '-'}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Evaluador</p><p style="color: var(--color-text);">${f.evaluador || '-'}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Créditos solicitados</p><p style="color: var(--color-text);">${creditos(f)}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Créditos homologados</p><p style="color: var(--color-text);">${creditos(f, 'Homologada')}</p></div>
                        </div>
                        <p class="text-xs font-semibold uppercase mb-2" style="color: var(--color-text-muted);">Asignaturas</p>
                        <div class="overflow-x-auto">
                            <table class="w-full text-xs">
                                <thead><tr style="color: var(--color-text-muted);"><th class="text-left pb-1">Origen</th><th class="text-left pb-1">Créditos</th><th class="text-left pb-1">Resultado</th></tr></thead>
                                <tbody>${f.asignaturas.map((a) => `<tr style="border-top: 1px solid var(--color-border);"><td class="py-1">${a.origen || '-'}</td><td class="py-1">${a.creditos || 0}</td><td class="py-1">${a.resultado}</td></tr>`).join('') || '<tr><td class="py-2" colspan="3" style="color: var(--color-text-muted);">Sin asignaturas registradas.</td></tr>'}</tbody>
                            </table>
                        </div>
                    </div>`;
            }

            pintarLista();
            pintarDetalle();
        }

        function pintar(idEnfocar) {
            UCLA.components.listShell.render(container, {
                titulo: 'Solicitudes de Homologación',
                columnas: columnas(),
                filas: UCLA.data.solicitudesHomologacion,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaRadicado',
                exportName: 'solicitudes-homologacion',
                enfocarId: idEnfocar,
                filtrarPorCampos,
                nombrePlural: 'solicitudes de homologación',
                vistas: {
                    dinamica: vistaDinamica,
                    'linea-tiempo': vistaLineaTiempo,
                    dividida: vistaDividida,
                },
                botonPrincipal: { etiqueta: 'Crear solicitud de homologación', onClick: () => abrirModal(pintar) },
            });
        }

        pintar();
    }

    function abrirModal(alGuardar) {
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
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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

            const nueva = UCLA.store.crear('solicitudesHomologacion', {
                radicado: 'HOM-2026-' + Math.floor(1000 + Math.random() * 8999),
                solicitante: solicitante.value.trim(), programaDestino: programaDestino.value.trim(),
                institucionOrigen: modal.querySelector('#homInstitucion').value, programaOrigen: modal.querySelector('#homProgramaOrigen').value,
                anoCursado: modal.querySelector('#homAno').value, evaluador: modal.querySelector('#homEvaluador').value,
                fechaRadicado: new Date().toISOString().slice(0, 10), estado: 'Recibida', asignaturas: asignaturas.slice(),
            });
            UCLA.components.toast.show('Solicitud de homologación radicada', 'success');
            modal.classList.add('hidden');
            alGuardar(nueva.id);
        });

        asignaturas = [{ origen: '', creditos: 0, nota: '', equivalente: '', resultado: 'Pendiente' }];
        pintarAsignaturas();
        modal.classList.remove('hidden');
    }

    UCLA.views['solicitudes/homologacion'] = { render };
})();

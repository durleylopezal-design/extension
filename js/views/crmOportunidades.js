// CRM · Oportunidades de matrícula — Kanban por defecto (kanbanBoard.js)
// sobre listShell, con edición/eliminación reales (UCLA.store), filtros por
// campos reales, STAGEVIEW funcional y 4 vistas adicionales (dinámica, línea
// de tiempo, mapa, dividida) vía config.vistas de listShell.js.
(function () {
    const ETAPAS = [
        { id: 'contacto-inicial', etiqueta: 'Contacto Inicial', pct: 10 },
        { id: 'interesado', etiqueta: 'Interesado, Requiere Información', pct: 20 },
        { id: 'propuesta-enviada', etiqueta: 'Propuesta de Programa Enviada', pct: 40 },
        { id: 'documentacion-revision', etiqueta: 'Documentación en Revisión', pct: 60 },
        { id: 'matricula-confirmada', etiqueta: 'Matrícula Confirmada', pct: 100 },
    ];

    // Condiciones reales (no etiquetas decorativas): cada casilla filtra de
    // verdad sobre UCLA.data.oportunidades vía filtrarPorCampos().
    const CAMPOS_MODULO = ETAPAS.map((e) => e.etiqueta).concat(['Con alerta de vencimiento']);

    let clickHandler = null;
    let stageviewActivo = 'todas';
    let agruparPorDinamica = 'ninguno';
    let seleccionadaDividida = null;

    function filtrarPorCampos(f, activos) {
        return activos.some((c) => {
            if (c === 'Con alerta de vencimiento') return !!f.etiqueta;
            const etapa = ETAPAS.find((e) => e.etiqueta === c);
            return etapa && f.etapa === etapa.id;
        });
    }

    function tarjetaHtml(f) {
        return `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: var(--color-primary-50); color: var(--color-primary);">${f.sedeId}</span>
                <div class="flex items-center gap-2">
                    ${f.etiqueta ? `<span class="text-xs font-bold animate-pulse" style="color: var(--color-danger);">${f.etiqueta}</span>` : ''}
                    <button data-editar-opp="${f.id}" draggable="false" title="Editar" style="color: var(--color-text-muted);"><i class="fas fa-pen text-xs"></i></button>
                    <button data-eliminar-opp="${f.id}" draggable="false" title="Eliminar" style="color: var(--color-danger);"><i class="fas fa-trash text-xs"></i></button>
                </div>
            </div>
            <h5 class="font-bold text-gray-800 mb-1">${f.nombre}</h5>
            <p class="text-sm text-gray-600 mb-2">${f.descripcion}</p>
            <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-gray-700">${UCLA.utils.formatoCOP(f.valor)}</span>
                <span class="text-gray-500"><i class="far fa-calendar"></i> ${f.fecha}</span>
            </div>
            <div class="mt-3 flex items-center gap-2">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(f.propietario)}&background=random" class="w-6 h-6 rounded-full">
                <span class="text-xs text-gray-500">${f.propietario}</span>
            </div>`;
    }

    function columnasLista() {
        return [
            { clave: 'nombre', etiqueta: 'Nombre', render: (f) => `<span class="font-medium" style="color: var(--color-primary);">${f.nombre}</span>` },
            { clave: 'descripcion', etiqueta: 'Descripción' },
            { clave: 'etapa', etiqueta: 'Etapa', render: (f) => ETAPAS.find((e) => e.id === f.etapa)?.etiqueta || f.etapa },
            { clave: 'valor', etiqueta: 'Valor', render: (f) => UCLA.utils.formatoCOP(f.valor) },
            { clave: 'propietario', etiqueta: 'Propietario' },
            { clave: 'acciones', etiqueta: 'Acciones', render: (f) => `
                <button data-editar-opp="${f.id}" class="mr-2" style="color: var(--color-primary);" title="Editar"><i class="fas fa-pen text-xs"></i></button>
                <button data-eliminar-opp="${f.id}" style="color: var(--color-danger);" title="Eliminar"><i class="fas fa-trash text-xs"></i></button>` },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Información de la oportunidad',
            camposIzquierda: [
                { clave: 'nombre', etiqueta: 'Nombre', tipo: 'text', obligatorio: true },
                { clave: 'valor', etiqueta: 'Valor', tipo: 'number' },
                { clave: 'etapa', etiqueta: 'Etapa', tipo: 'select', opciones: ETAPAS.map((e) => e.id + ' - ' + e.etiqueta) },
                { clave: 'sedeId', etiqueta: 'Sede', tipo: 'select', opciones: UCLA.state.SEDES.map((s) => s.codigo + ' - ' + s.nombre) },
            ],
            camposDerecha: [
                { clave: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea' },
                { clave: 'fecha', etiqueta: 'Fecha de cierre estimada', tipo: 'date' },
                { clave: 'propietario', etiqueta: 'Propietario', tipo: 'text' },
            ],
        }];
    }

    function datosParaEditar(opp) {
        return {
            nombre: opp.nombre,
            valor: opp.valor,
            etapa: opp.etapa + ' - ' + (ETAPAS.find((e) => e.id === opp.etapa)?.etiqueta || ''),
            sedeId: opp.sedeId + ' - ' + (UCLA.state.SEDES.find((s) => s.codigo === opp.sedeId)?.nombre || ''),
            descripcion: opp.descripcion,
            fecha: opp.fecha,
            propietario: opp.propietario,
        };
    }

    function render(container) {
        function abrirEditar(id) {
            const opp = UCLA.store.obtener('oportunidades', id);
            if (!opp) return;
            UCLA.components.recordForm.abrir({
                titulo: 'Editar Oportunidad',
                secciones: secciones(),
                datosIniciales: datosParaEditar(opp),
                esEdicion: true,
                onGuardar: (datos) => {
                    UCLA.store.actualizar('oportunidades', id, {
                        nombre: datos.nombre || opp.nombre,
                        descripcion: datos.descripcion || '',
                        valor: Number(datos.valor) || 0,
                        etapa: (datos.etapa || '').split(' - ')[0] || opp.etapa,
                        fecha: datos.fecha || '',
                        propietario: datos.propietario || opp.propietario,
                        sedeId: (datos.sedeId || '').split(' - ')[0] || opp.sedeId,
                    });
                    pintar();
                },
            });
        }

        function confirmarEliminar(id) {
            const opp = UCLA.store.obtener('oportunidades', id);
            if (!opp) return;
            UCLA.components.confirmModal.abrir({
                titulo: 'Eliminar oportunidad',
                mensaje: `¿Eliminar "${opp.nombre}"? Esta acción no se puede deshacer.`,
                textoConfirmar: 'Eliminar',
                onConfirmar: () => {
                    UCLA.store.eliminar('oportunidades', id);
                    UCLA.components.toast.show('Oportunidad eliminada', 'success');
                    pintar();
                },
            });
        }

        // --- Vista dinámica: agrupar/ordenar por el campo que elija el usuario ---
        function vistaDinamica(cuerpo, filas) {
            const opciones = [
                { id: 'ninguno', etiqueta: 'Ninguno' },
                { id: 'etapa', etiqueta: 'Etapa' },
                { id: 'sedeId', etiqueta: 'Sede' },
                { id: 'propietario', etiqueta: 'Propietario' },
            ];
            cuerpo.innerHTML = `
                <div class="flex items-center gap-2 mb-4">
                    <label class="text-sm font-medium" style="color: var(--color-text-muted);">Agrupar por</label>
                    <select id="oppAgruparPor" class="input-brand px-3 py-1.5 text-sm">
                        ${opciones.map((o) => `<option value="${o.id}" ${agruparPorDinamica === o.id ? 'selected' : ''}>${o.etiqueta}</option>`).join('')}
                    </select>
                </div>
                <div id="oppGruposDinamica" class="space-y-6"></div>`;

            cuerpo.querySelector('#oppAgruparPor').addEventListener('change', (e) => {
                agruparPorDinamica = e.target.value;
                vistaDinamica(cuerpo, filas);
            });

            const contenedorGrupos = cuerpo.querySelector('#oppGruposDinamica');
            if (agruparPorDinamica === 'ninguno') {
                const div = document.createElement('div');
                contenedorGrupos.appendChild(div);
                UCLA.components.dataTable.render(div, { columnas: columnasLista(), filas, filaId: (f) => f.id });
                return;
            }

            const etiquetaGrupo = (valor) => {
                if (valor === 'sin-asignar') return 'Sin asignar';
                if (agruparPorDinamica === 'etapa') return ETAPAS.find((e) => e.id === valor)?.etiqueta || valor;
                if (agruparPorDinamica === 'sedeId') return UCLA.state.SEDES.find((s) => s.codigo === valor)?.nombre || valor;
                return valor;
            };

            const grupos = {};
            filas.forEach((f) => {
                const clave = f[agruparPorDinamica] || 'sin-asignar';
                (grupos[clave] = grupos[clave] || []).push(f);
            });

            contenedorGrupos.innerHTML = '';
            Object.keys(grupos).forEach((clave) => {
                const seccion = document.createElement('div');
                seccion.innerHTML = `<h4 class="text-sm font-bold uppercase tracking-wide mb-2" style="color: var(--color-primary);">${etiquetaGrupo(clave)} <span style="color: var(--color-text-muted); font-weight: 400;">(${grupos[clave].length})</span></h4><div class="oppTablaGrupo mb-4"></div>`;
                contenedorGrupos.appendChild(seccion);
                UCLA.components.dataTable.render(seccion.querySelector('.oppTablaGrupo'), { columnas: columnasLista(), filas: grupos[clave], filaId: (f) => f.id });
            });
        }

        // --- Línea de tiempo: ordena por fecha de creación (fechaCreacion) ---
        function vistaLineaTiempo(cuerpo, filas) {
            const conFecha = filas.filter((f) => f.fechaCreacion).slice().sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
            const sinFecha = filas.filter((f) => !f.fechaCreacion);

            const itemHtml = (f) => `
                <div class="flex gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--color-primary-50);">
                        <i class="fas fa-bullseye text-sm" style="color: var(--color-primary);"></i>
                    </div>
                    <div class="flex-1 pb-4" style="border-bottom: 1px solid var(--color-border);">
                        <div class="flex items-center justify-between">
                            <p class="text-sm font-semibold" style="color: var(--color-text);">${f.nombre}</p>
                            <span class="text-xs" style="color: var(--color-text-muted);">${f.fechaCreacion ? UCLA.utils.formatoFecha(f.fechaCreacion) : ''}</span>
                        </div>
                        <p class="text-sm mt-0.5" style="color: var(--color-text-muted);">${ETAPAS.find((e) => e.id === f.etapa)?.etiqueta || f.etapa} • ${UCLA.utils.formatoCOP(f.valor)} • ${f.propietario}</p>
                    </div>
                </div>`;

            cuerpo.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    ${conFecha.length ? `<div class="space-y-5 mb-6">${conFecha.map(itemHtml).join('')}</div>` : ''}
                    ${sinFecha.length ? `
                        <div style="border-top: 1px solid var(--color-border); padding-top: 16px;">
                            <p class="text-xs font-semibold uppercase mb-3" style="color: var(--color-text-muted);">Sin fecha de creación registrada</p>
                            <div class="space-y-5">${sinFecha.map(itemHtml).join('')}</div>
                        </div>` : ''}
                    ${!conFecha.length && !sinFecha.length ? `<p class="text-sm text-center py-8" style="color: var(--color-text-muted);">No hay oportunidades para mostrar.</p>` : ''}
                </div>`;
        }

        // --- Mapa: agrupado por sede (mapa geográfico simplificado) ---
        function vistaMapa(cuerpo, filas) {
            const grupos = {};
            filas.forEach((f) => {
                const clave = f.sedeId || 'sin-sede';
                (grupos[clave] = grupos[clave] || []).push(f);
            });

            cuerpo.innerHTML = `
                <div class="mb-3 text-xs" style="color: var(--color-text-muted);">
                    <i class="fas fa-circle-info mr-1"></i> Mapa simplificado agrupado por sede (no hay coordenadas geográficas registradas para oportunidades).
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${UCLA.state.SEDES.map((sede) => {
                        const filasSede = grupos[sede.codigo] || [];
                        const total = filasSede.reduce((s, f) => s + (f.valor || 0), 0);
                        return `
                            <div class="bg-white rounded-xl shadow-lg p-5">
                                <div class="flex items-center gap-2 mb-1">
                                    <i class="fas fa-map-marker-alt" style="color: var(--color-accent-dark);"></i>
                                    <h4 class="font-bold" style="color: var(--color-primary-dark);">${sede.nombre}</h4>
                                </div>
                                <p class="text-2xl font-bold" style="color: var(--color-text);">${filasSede.length}</p>
                                <p class="text-xs mb-3" style="color: var(--color-text-muted);">${UCLA.utils.formatoCOP(total)} en oportunidades</p>
                                ${filasSede.length ? `<div class="space-y-1">${filasSede.slice(0, 4).map((f) => `<p class="text-xs truncate" style="color: var(--color-text);">${f.nombre}</p>`).join('')}${filasSede.length > 4 ? `<p class="text-xs" style="color: var(--color-text-muted);">+${filasSede.length - 4} más</p>` : ''}</div>` : `<p class="text-xs" style="color: var(--color-text-muted);">Sin oportunidades</p>`}
                            </div>`;
                    }).join('')}
                </div>`;
        }

        // --- Vista dividida: lista + detalle sincronizados sin navegar ---
        function vistaDividida(cuerpo, filas) {
            if (!seleccionadaDividida || !filas.some((f) => f.id === seleccionadaDividida)) {
                seleccionadaDividida = filas[0]?.id || null;
            }
            cuerpo.innerHTML = `
                <div class="flex flex-col lg:flex-row gap-4 items-start">
                    <div class="w-full lg:w-80 lg:flex-shrink-0" id="oppListaDividida"></div>
                    <div class="flex-1 min-w-0 w-full" id="oppDetalleDividida"></div>
                </div>`;

            function pintarLista() {
                UCLA.components.dataTable.render(cuerpo.querySelector('#oppListaDividida'), {
                    columnas: [
                        { clave: 'nombre', etiqueta: 'Nombre', render: (f) => `<span class="font-medium" style="color: ${f.id === seleccionadaDividida ? 'var(--color-primary)' : 'var(--color-text)'};">${f.nombre}</span>` },
                        { clave: 'valor', etiqueta: 'Valor', render: (f) => UCLA.utils.formatoCOP(f.valor) },
                    ],
                    filas,
                    filaId: (f) => f.id,
                    onFilaClick: (f) => { seleccionadaDividida = f.id; pintarLista(); pintarDetalle(); },
                });
            }

            function pintarDetalle() {
                const detalle = cuerpo.querySelector('#oppDetalleDividida');
                const f = filas.find((x) => x.id === seleccionadaDividida);
                if (!f) { detalle.innerHTML = `<div class="bg-white rounded-xl shadow-lg p-10 text-center text-sm" style="color: var(--color-text-muted);">Seleccione una oportunidad de la lista.</div>`; return; }
                detalle.innerHTML = `
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-xl font-bold" style="color: var(--color-primary-dark);">${f.nombre}</h3>
                                <p class="text-sm" style="color: var(--color-text-muted);">${ETAPAS.find((e) => e.id === f.etapa)?.etiqueta || f.etapa}</p>
                            </div>
                            <div class="flex gap-2">
                                <button data-editar-opp="${f.id}" class="px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">Editar</button>
                                <button data-eliminar-opp="${f.id}" class="px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-danger); color: var(--color-danger);">Eliminar</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Valor</p><p style="color: var(--color-text);">${UCLA.utils.formatoCOP(f.valor)}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Sede</p><p style="color: var(--color-text);">${f.sedeId}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Propietario</p><p style="color: var(--color-text);">${f.propietario}</p></div>
                            <div><p class="text-xs font-medium" style="color: var(--color-text-muted);">Fecha de cierre estimada</p><p style="color: var(--color-text);">${f.fecha || '-'}</p></div>
                        </div>
                        <p class="text-sm mt-4" style="color: var(--color-text-muted);">${f.descripcion || 'Sin descripción.'}</p>
                    </div>`;
            }

            pintarLista();
            pintarDetalle();
        }

        function pintar() {
            const filas = UCLA.data.oportunidades;
            UCLA.components.listShell.render(container, {
                titulo: 'Oportunidades de Matrícula',
                vistaInicial: 'kanban',
                columnas: columnasLista(),
                filas,
                filaId: (f) => f.id,
                camposModulo: CAMPOS_MODULO,
                filtrarPorCampos,
                campoOrden: 'nombre',
                exportName: 'oportunidades',
                vistas: {
                    dinamica: vistaDinamica,
                    'linea-tiempo': vistaLineaTiempo,
                    mapa: vistaMapa,
                    dividida: vistaDividida,
                },
                extraToolbarHtml: `
                    <div class="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border" style="border-color: var(--color-border); color: var(--color-text);">
                        <span class="font-semibold uppercase text-xs" style="color: var(--color-text-muted);">STAGEVIEW</span>
                        <select id="oppStageview" class="ml-2 text-sm border-0 bg-transparent" style="color: var(--color-primary); outline: none;">
                            <option value="todas" ${stageviewActivo === 'todas' ? 'selected' : ''}>Todas las etapas</option>
                            ${ETAPAS.map((e) => `<option value="${e.id}" ${stageviewActivo === e.id ? 'selected' : ''}>${e.etiqueta}</option>`).join('')}
                        </select>
                    </div>`,
                onExtraToolbarBind: (root) => {
                    root.querySelector('#oppStageview')?.addEventListener('change', (e) => {
                        stageviewActivo = e.target.value;
                        pintar();
                    });
                },
                renderKanban: (cuerpo) => {
                    const columnasKanban = stageviewActivo === 'todas' ? ETAPAS : ETAPAS.filter((e) => e.id === stageviewActivo);
                    UCLA.components.kanbanBoard.render(cuerpo, {
                        columnas: columnasKanban,
                        filas,
                        filaId: (f) => f.id,
                        renderTarjeta: tarjetaHtml,
                        sumarPor: 'valor',
                        onMover: (id, nuevaEtapa) => {
                            UCLA.store.actualizar('oportunidades', id, { etapa: nuevaEtapa });
                            UCLA.components.toast.show('Oportunidad actualizada exitosamente', 'success');
                        },
                    });
                },
                botonPrincipal: {
                    etiqueta: 'Crear Oportunidad',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva Oportunidad',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.store.crear('oportunidades', {
                                nombre: datos.nombre || 'Sin nombre',
                                descripcion: datos.descripcion || '',
                                valor: Number(datos.valor) || 0,
                                etapa: (datos.etapa || '').split(' - ')[0] || ETAPAS[0].id,
                                fecha: datos.fecha || '',
                                propietario: datos.propietario || UCLA.state.usuarioActual.nombre,
                                sedeId: (datos.sedeId || '').split(' - ')[0] || UCLA.state.usuarioActual.sedeId,
                                campanaId: null,
                                fechaCreacion: new Date().toISOString().slice(0, 10),
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btnEditar = e.target.closest('[data-editar-opp]');
            if (btnEditar) { abrirEditar(btnEditar.getAttribute('data-editar-opp')); return; }
            const btnEliminar = e.target.closest('[data-eliminar-opp]');
            if (btnEliminar) { confirmarEliminar(btnEliminar.getAttribute('data-eliminar-opp')); return; }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    UCLA.views['crm/oportunidades'] = { render };

    // 'crm/actividades' ya no es un alias del shell de tabs (fase anterior):
    // redirige al nuevo submódulo de Actividades.
    UCLA.views['crm/actividades'] = { render: () => UCLA.router.navigate('actividades/tareas') };
})();

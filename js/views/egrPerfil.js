// Egresados · Perfil de egreso (#/egresados/perfil/:id) — usa detailPanel.js.
(function () {
    function render(container, params) {
        const egresado = UCLA.data.egresados.find((e) => e.id === params.id);

        if (!egresado) {
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p style="color: var(--color-text-muted);">Egresado no encontrado.</p>
                    <button id="volverEgresados" class="btn-primary mt-4">Volver a la base de datos</button>
                </div>`;
            container.querySelector('#volverEgresados').addEventListener('click', () => UCLA.router.navigate('egresados/base'));
            return;
        }

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = egresado.nombre;
        document.title = egresado.nombre + ' · UCLA Extensión CRM';

        const interacciones = () => UCLA.data.interaccionesEgresado.filter((i) => i.egresadoId === egresado.id);

        UCLA.components.detailPanel.render(container, {
            encabezado: {
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(egresado.nombre)}&background=1C7FA8&color=fff`,
                titulo: egresado.nombre,
                subtitulo: `${egresado.programa} · Cohorte ${egresado.cohorte}`,
                badges: [
                    { texto: egresado.situacionLaboral, color: UCLA.utils.colorEstado(egresado.situacionLaboral) },
                    { texto: egresado.sedeId, color: 'var(--color-primary)' },
                ],
                acciones: [
                    { etiqueta: 'Editar', onClick: () => UCLA.components.toast.show('Edición de perfil — función simulada', 'info') },
                    { etiqueta: 'Registrar interacción', onClick: () => abrirRegistrarInteraccion(egresado, () => UCLA.router.navigate('egresados/perfil/' + egresado.id)) },
                    { etiqueta: 'Enviar encuesta', principal: true, onClick: () => UCLA.components.toast.show('Encuesta de seguimiento enviada (simulado)', 'success') },
                ],
            },
            pestanas: [
                {
                    id: 'personales', etiqueta: 'Datos personales y de contacto',
                    render: (c) => {
                        c.innerHTML = `
                            <div class="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                ${filaDato('Documento', egresado.documento)}
                                ${filaDato('Fecha de nacimiento', egresado.fechaNacimiento ? UCLA.utils.formatoFecha(egresado.fechaNacimiento) : '—')}
                                ${filaDato('Correo', egresado.correo)}
                                ${filaDato('Correo alterno', egresado.correoAlterno || '—')}
                                ${filaDato('Teléfono', egresado.telefono)}
                                ${filaDato('Ciudad', egresado.ciudad)}
                                ${filaDato('Redes profesionales', egresado.redProfesional || '—')}
                            </div>`;
                    },
                },
                {
                    id: 'academica', etiqueta: 'Información académica',
                    render: (c) => {
                        c.innerHTML = `
                            <div class="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                ${filaDato('Programa', egresado.programa)}
                                ${filaDato('Cohorte', egresado.cohorte)}
                                ${filaDato('Fecha de grado', UCLA.utils.formatoFecha(egresado.fechaGrado))}
                                ${filaDato('Promedio', egresado.promedio ?? '—')}
                                ${filaDato('Distinciones', egresado.distinciones || '—')}
                                ${filaDato('Otros programas cursados en Extensión', egresado.otrosProgramas || '—')}
                            </div>`;
                    },
                },
                {
                    id: 'laboral', etiqueta: 'Situación laboral',
                    render: (c) => {
                        c.innerHTML = `
                            <div class="bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                ${filaDato('Estado', egresado.situacionLaboral)}
                                ${filaDato('Empresa actual', egresado.empresaActual || '—')}
                                ${filaDato('Cargo', egresado.cargo || '—')}
                                ${filaDato('Sector', egresado.sector || '—')}
                                ${filaDato('Fecha de vinculación', egresado.fechaVinculacion ? UCLA.utils.formatoFecha(egresado.fechaVinculacion) : '—')}
                                ${filaDato('Rango salarial', egresado.rangoSalarial || '—')}
                                ${filaDato('Empleo afín al programa', egresado.empleoAfin ? 'Sí' : 'No')}
                                ${filaDato('Meses entre grado y vinculación', egresado.mesesHastaVinculacion ?? '—')}
                            </div>`;
                    },
                },
                {
                    id: 'historial', etiqueta: 'Historial de interacciones',
                    render: (c) => UCLA.components.detailPanel.renderTimeline(c, interacciones()),
                },
            ],
        });
    }

    function filaDato(etiqueta, valor) {
        return `<div><p class="text-xs font-medium" style="color: var(--color-text-muted);">${etiqueta}</p><p style="color: var(--color-text);">${valor}</p></div>`;
    }

    function abrirRegistrarInteraccion(egresado, alGuardar) {
        let modal = document.getElementById('modalInteraccionEgresado');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalInteraccionEgresado';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-ie-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                <h3 class="text-lg font-bold mb-4" style="color: var(--color-primary-dark);">Registrar interacción</h3>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Tipo</label>
                <select id="ieTipo" class="input-brand w-full px-3 py-2 text-sm mb-3">
                    <option value="correo">Correo</option><option value="llamada">Llamada</option><option value="evento">Evento</option><option value="encuesta">Encuesta</option>
                </select>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Título *</label>
                <input id="ieTitulo" type="text" class="input-brand w-full px-3 py-2 text-sm mb-3">
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Detalle</label>
                <textarea id="ieDetalle" rows="3" class="input-brand w-full px-3 py-2 text-sm"></textarea>
                <div class="flex justify-end gap-2 pt-4">
                    <button data-ie-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="ieGuardar" class="btn-primary text-sm">Guardar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-ie-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#ieGuardar').addEventListener('click', () => {
            const titulo = modal.querySelector('#ieTitulo');
            if (!titulo.value.trim()) { titulo.style.borderColor = 'var(--color-danger)'; return; }
            UCLA.data.interaccionesEgresado.unshift({
                id: 'ie-' + Date.now(), egresadoId: egresado.id, tipo: modal.querySelector('#ieTipo').value,
                fecha: new Date().toISOString().slice(0, 10), titulo: titulo.value.trim(), detalle: modal.querySelector('#ieDetalle').value,
            });
            egresado.ultimaActualizacion = new Date().toISOString().slice(0, 10);
            UCLA.components.toast.show('Interacción registrada', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    UCLA.views['egresados/perfil/:id'] = { render };
})();

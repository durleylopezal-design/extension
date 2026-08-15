// Egresados · Comunidad — muro de publicaciones (no usa listShell: es un feed
// social, no una tabla CRUD). autorEgresadoId referencia UCLA.data.egresados.
(function () {
    const ICONO_TIPO = { oferta: { icono: 'fa-briefcase', color: 'var(--color-accent)' }, testimonio: { icono: 'fa-quote-left', color: 'var(--color-primary)' }, anuncio: { icono: 'fa-bullhorn', color: 'var(--color-success)' } };
    let clickHandler = null;

    function egresadoDe(id) { return UCLA.data.egresados.find((e) => e.id === id); }

    function render(container) {
        function pintar() {
            const publicaciones = UCLA.data.publicacionesComunidad.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
            container.innerHTML = `
                <div class="max-w-2xl mx-auto space-y-4">
                    <div class="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">Comunidad de Egresados</h3>
                            <p class="text-sm" style="color: var(--color-text-muted);">Anuncios, ofertas y testimonios compartidos por la red de egresados.</p>
                        </div>
                        <button id="ecNuevaPublicacion" class="btn-accent whitespace-nowrap"><i class="fas fa-plus"></i> Nueva publicación</button>
                    </div>
                    ${publicaciones.map((p) => {
                        const autor = egresadoDe(p.autorEgresadoId);
                        const meta = ICONO_TIPO[p.tipo] || { icono: 'fa-circle-dot', color: 'var(--color-neutral)' };
                        return `
                            <div class="bg-white rounded-xl shadow-lg p-5">
                                <div class="flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background: color-mix(in srgb, ${meta.color} 18%, white);">
                                        <i class="fas ${meta.icono} text-sm" style="color: ${meta.color};"></i>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <p class="text-sm font-semibold" style="color: var(--color-text);">${autor ? autor.nombre : 'Egresado'}</p>
                                            <span class="text-xs" style="color: var(--color-text-muted);">${UCLA.utils.formatoFecha(p.fecha)}</span>
                                        </div>
                                        <p class="text-xs" style="color: var(--color-text-muted);">${autor ? autor.programa : ''}</p>
                                        <p class="text-sm font-semibold mt-2" style="color: var(--color-text);">${p.titulo}</p>
                                        <p class="text-sm mt-1" style="color: var(--color-text);">${p.contenido}</p>
                                        <button data-like="${p.id}" class="text-xs font-medium mt-3 hover:underline" style="color: var(--color-primary);"><i class="far fa-heart"></i> ${p.likes} me gusta</button>
                                    </div>
                                </div>
                            </div>`;
                    }).join('')}
                </div>`;

            container.querySelector('#ecNuevaPublicacion').addEventListener('click', () => abrirNuevaPublicacion(pintar));
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-like]');
            if (!btn) return;
            const p = UCLA.store.obtener('publicacionesComunidad', btn.getAttribute('data-like'));
            if (p) { UCLA.store.actualizar('publicacionesComunidad', p.id, { likes: p.likes + 1 }); pintar(); }
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirNuevaPublicacion(alGuardar) {
        let modal = document.getElementById('modalNuevaPublicacion');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalNuevaPublicacion';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-np-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                <h3 class="text-lg font-bold mb-4" style="color: var(--color-primary-dark);">Nueva publicación</h3>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Tipo</label>
                <select id="npTipo" class="input-brand w-full px-3 py-2 text-sm mb-3">
                    <option value="anuncio">Anuncio</option><option value="oferta">Oferta</option><option value="testimonio">Testimonio</option>
                </select>
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Título *</label>
                <input id="npTitulo" type="text" class="input-brand w-full px-3 py-2 text-sm mb-3">
                <label class="block text-xs font-medium mb-1" style="color: var(--color-text-muted);">Contenido</label>
                <textarea id="npContenido" rows="3" class="input-brand w-full px-3 py-2 text-sm"></textarea>
                <div class="flex justify-end gap-2 pt-4">
                    <button data-np-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="npGuardar" class="btn-primary text-sm">Publicar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-np-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.querySelector('#npGuardar').addEventListener('click', () => {
            const titulo = modal.querySelector('#npTitulo');
            if (!titulo.value.trim()) { titulo.style.borderColor = 'var(--color-danger)'; return; }
            UCLA.store.crear('publicacionesComunidad', {
                autorEgresadoId: UCLA.data.egresados[0].id, fecha: new Date().toISOString().slice(0, 10),
                tipo: modal.querySelector('#npTipo').value, titulo: titulo.value.trim(), contenido: modal.querySelector('#npContenido').value, likes: 0,
            });
            UCLA.components.toast.show('Publicación creada', 'success');
            modal.classList.add('hidden');
            alGuardar();
        });
        modal.classList.remove('hidden');
    }

    UCLA.views['egresados/comunidad'] = { render };
})();

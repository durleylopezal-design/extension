// Egresados · Bolsa de Empleo — listShell sobre UCLA.data.ofertasEmpleo,
// cruzando cuentaId (empresa aliada, misma fuente que Alianzas/CRM · Cuentas)
// y egresadoIds (postulantes, misma fuente que Base de Datos de Egresados).
(function () {
    const CAMPOS_MODULO = ['Modalidad', 'Estado'];
    let clickHandler = null;

    function cuentaDe(id) { return UCLA.data.cuentas.find((c) => c.id === id); }
    function egresadoDe(id) { return UCLA.data.egresados.find((e) => e.id === id); }

    function columnas() {
        return [
            { clave: 'cargo', etiqueta: 'Cargo', render: (o) => `<span class="font-medium" style="color: var(--color-text);">${o.cargo}</span>` },
            { clave: 'cuentaId', etiqueta: 'Empresa', render: (o) => { const c = cuentaDe(o.cuentaId); return c ? c.razonSocial : '-'; } },
            { clave: 'modalidad', etiqueta: 'Modalidad' },
            { clave: 'ciudad', etiqueta: 'Ciudad' },
            { clave: 'salario', etiqueta: 'Salario' },
            { clave: 'fechaPublicacion', etiqueta: 'Publicada', render: (o) => UCLA.utils.formatoFecha(o.fechaPublicacion) },
            { clave: 'postulantes', etiqueta: 'Postulantes', render: (o) => o.egresadoIds.length },
            { clave: 'estado', etiqueta: 'Estado', render: (o) => UCLA.utils.badgeEstado(o.estado) },
            { clave: 'acciones', etiqueta: 'Acciones', render: (o) => `<button data-postulantes="${o.id}" class="text-xs font-medium hover:underline" style="color: var(--color-primary);">Ver postulantes</button>` },
        ];
    }

    function secciones() {
        return [{
            titulo: 'Nueva oferta de empleo',
            camposIzquierda: [
                { clave: 'cargo', etiqueta: 'Cargo', tipo: 'text', obligatorio: true },
                { clave: 'cuenta', etiqueta: 'Empresa aliada', tipo: 'select', opciones: UCLA.data.cuentas.map((c) => c.id + ' - ' + c.razonSocial), obligatorio: true },
                { clave: 'modalidad', etiqueta: 'Modalidad', tipo: 'select', opciones: ['Presencial', 'Híbrido', 'Remoto'] },
            ],
            camposDerecha: [
                { clave: 'ciudad', etiqueta: 'Ciudad', tipo: 'text' },
                { clave: 'salario', etiqueta: 'Rango salarial', tipo: 'text' },
            ],
        }];
    }

    function render(container) {
        function pintar() {
            UCLA.components.listShell.render(container, {
                titulo: 'Bolsa de Empleo',
                columnas: columnas(),
                filas: UCLA.data.ofertasEmpleo,
                filaId: (o) => o.id,
                camposModulo: CAMPOS_MODULO,
                campoOrden: 'fechaPublicacion',
                exportName: 'bolsa-empleo',
                botonPrincipal: {
                    etiqueta: 'Publicar oferta',
                    onClick: () => UCLA.components.recordForm.abrir({
                        titulo: 'Nueva oferta de empleo',
                        secciones: secciones(),
                        onGuardar: (datos) => {
                            UCLA.data.ofertasEmpleo.unshift({
                                id: 'oe-' + Date.now(), cargo: datos.cargo || 'Sin nombre', cuentaId: (datos.cuenta || '').split(' - ')[0],
                                modalidad: datos.modalidad || 'Presencial', ciudad: datos.ciudad || '', salario: datos.salario || '',
                                fechaPublicacion: new Date().toISOString().slice(0, 10), estado: 'Abierta', egresadoIds: [],
                            });
                            pintar();
                        },
                    }),
                },
            });
        }

        if (clickHandler) container.removeEventListener('click', clickHandler);
        clickHandler = (e) => {
            const btn = e.target.closest('[data-postulantes]');
            if (btn) abrirPostulantes(UCLA.data.ofertasEmpleo.find((o) => o.id === btn.getAttribute('data-postulantes')));
        };
        container.addEventListener('click', clickHandler);

        pintar();
    }

    function abrirPostulantes(oferta) {
        let modal = document.getElementById('modalPostulantesEmpleo');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalPostulantesEmpleo';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center modal';
            document.body.appendChild(modal);
        }
        const postulantes = oferta.egresadoIds.map(egresadoDe).filter(Boolean);
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-pe-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                <h3 class="text-lg font-bold mb-1" style="color: var(--color-primary-dark);">Postulantes</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-muted);">${oferta.cargo}</p>
                ${postulantes.length ? `
                    <div class="space-y-2 max-h-72 overflow-y-auto">
                        ${postulantes.map((e) => `
                            <a href="#/egresados/perfil/${e.id}" class="block px-3 py-2 rounded-lg border hover:bg-gray-50" style="border-color: var(--color-border);">
                                <p class="text-sm font-medium" style="color: var(--color-text);">${e.nombre}</p>
                                <p class="text-xs" style="color: var(--color-text-muted);">${e.programa} · ${e.situacionLaboral}</p>
                            </a>`).join('')}
                    </div>` : `<p class="text-sm text-center py-6" style="color: var(--color-text-muted);">Todavía no hay postulantes para esta oferta.</p>`}
                <div class="flex justify-end pt-4">
                    <button data-pe-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cerrar</button>
                </div>
            </div>`;
        modal.querySelectorAll('[data-pe-cerrar]').forEach((el) => el.addEventListener('click', () => modal.classList.add('hidden')));
        modal.classList.remove('hidden');
    }

    UCLA.views['egresados/empleo'] = { render };
})();

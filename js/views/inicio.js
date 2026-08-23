// Inicio — asistente de configuración guiada de 5 pasos. Solo para administradores;
// si ya se completó o el usuario no es admin, redirige directo al Dashboard.
(function () {
    const PASOS = [
        {
            id: 'equipo', icono: 'fa-user-friends', etiqueta: 'Invitar a su equipo',
            tituloDerecha: 'Invite a su equipo',
            descripcion: 'Manténgase conectado y trabaje en colaboración con coordinadores, asesores y aliados desde una sola plataforma.',
            boton: 'Invitar usuarios',
        },
        {
            id: 'admision', icono: 'fa-filter', etiqueta: 'Configurar su proceso de admisión y matrícula',
            tituloDerecha: 'Defina su proceso de admisión',
            descripcion: 'Personalice las etapas de su embudo, desde el primer contacto hasta la matrícula confirmada, según los programas que ofrece su sede.',
            boton: 'Configurar proceso',
        },
        {
            id: 'correo', icono: 'fa-envelope', etiqueta: 'Conectar su correo institucional',
            tituloDerecha: 'Conecte su correo',
            descripcion: 'Sincronice su cuenta de correo institucional para enviar y recibir comunicaciones directamente desde el CRM.',
            boton: 'Conectar correo',
        },
        {
            id: 'migracion', icono: 'fa-database', etiqueta: 'Migrar sus datos actuales de estudiantes y egresados',
            tituloDerecha: 'Migre sus datos actuales',
            descripcion: 'Cargue su base actual de estudiantes, egresados y contactos para no perder el historial de su gestión.',
            boton: 'Migrar datos',
        },
        {
            id: 'integraciones', icono: 'fa-th-large', etiqueta: 'Configurar integraciones',
            tituloDerecha: 'Conecte sus herramientas',
            descripcion: 'Integre pasarelas de pago, WhatsApp Business y calendario para centralizar toda su operación.',
            boton: 'Ver integraciones',
        },
    ];

    let pasoSeleccionado = null;

    function primerPasoPendiente(completados) {
        const pendiente = PASOS.find((p) => !completados.includes(p.id));
        return pendiente ? pendiente.id : PASOS[0].id;
    }

    function render(container) {
        if (!UCLA.state.isAdmin() || UCLA.state.onboardingCompleto()) {
            UCLA.router.navigate('dashboard');
            return;
        }

        const completados = UCLA.state.getOnboardingCompletado();
        if (!pasoSeleccionado || completados.includes(pasoSeleccionado)) {
            pasoSeleccionado = primerPasoPendiente(completados);
        }

        container.innerHTML = `
            <div class="max-w-5xl mx-auto">
                <div class="flex justify-end mb-4">
                    <button id="btnOmitir" class="px-4 py-2 text-sm font-medium rounded-lg border" style="color: var(--color-text); border-color: var(--color-border); background: #fff;">
                        Omitir
                    </button>
                </div>

                <div class="rounded-2xl shadow-lg overflow-hidden relative" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 55%, var(--color-accent-100) 130%);">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-0 m-1 rounded-2xl overflow-hidden" style="background: #ffffff;">
                        <div class="p-5 sm:p-8">
                            <h2 class="text-2xl font-bold" style="color: var(--color-primary-dark);">Configure su CRM de UCLA Extensión</h2>
                            <p class="mt-2 text-sm" style="color: var(--color-text-muted);">Haga que su gestión académica sea más inteligente y conectada</p>

                            <div class="mt-6 space-y-3" id="pasosLista"></div>
                        </div>

                        <div class="p-5 sm:p-8 flex items-center" style="background: var(--color-primary-50);">
                            <div id="panelDerecho" class="w-full transition-opacity duration-300"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        pintarPasos(container, completados);
        pintarPanelDerecho(container);

        container.querySelector('#btnOmitir').addEventListener('click', () => UCLA.router.navigate('dashboard'));
    }

    function pintarPasos(container, completados) {
        const lista = container.querySelector('#pasosLista');
        lista.innerHTML = PASOS.map((paso, i) => {
            const completo = completados.includes(paso.id);
            const activo = paso.id === pasoSeleccionado;
            return `
                <button type="button" data-paso="${paso.id}"
                    class="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all bg-white"
                    style="border-color: ${activo ? 'var(--color-primary)' : 'var(--color-border)'}; ${activo ? 'box-shadow: 0 4px 12px rgba(28,127,168,0.15);' : ''}">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--color-primary-50);">
                        <i class="fas ${paso.icono}" style="color: var(--color-primary);"></i>
                    </div>
                    <span class="flex-1 text-sm font-medium" style="color: var(--color-text);">${i + 1}. ${paso.etiqueta}</span>
                    ${completo
                        ? `<i class="fas fa-check-circle text-lg" style="color: var(--color-success);"></i>`
                        : activo
                            ? `<span class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--color-accent);"><i class="fas fa-arrow-right text-white text-xs"></i></span>`
                            : `<span class="w-7 h-7"></span>`}
                </button>`;
        }).join('');

        lista.querySelectorAll('[data-paso]').forEach((btn) => {
            btn.addEventListener('click', () => {
                pasoSeleccionado = btn.getAttribute('data-paso');
                pintarPasos(container, UCLA.state.getOnboardingCompletado());
                pintarPanelDerecho(container);
            });
        });
    }

    function pintarPanelDerecho(container) {
        const panel = container.querySelector('#panelDerecho');
        const completados = UCLA.state.getOnboardingCompletado();

        if (completados.length >= 5) {
            panel.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-circle-check text-5xl mb-4" style="color: var(--color-success);"></i>
                    <h3 class="text-xl font-bold" style="color: var(--color-primary-dark);">¡Configuración completa!</h3>
                    <p class="mt-2 text-sm" style="color: var(--color-text-muted);">Redirigiendo al Dashboard Gerencial...</p>
                </div>`;
            setTimeout(() => UCLA.router.navigate('dashboard'), 1600);
            return;
        }

        const paso = PASOS.find((p) => p.id === pasoSeleccionado) || PASOS[0];
        panel.style.opacity = '0';
        setTimeout(() => {
            panel.innerHTML = `
                <div>
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style="background: var(--color-accent-100);">
                        <i class="fas ${paso.icono} text-2xl" style="color: var(--color-accent-dark);"></i>
                    </div>
                    <h3 class="text-lg font-bold" style="color: var(--color-primary-dark);">${paso.tituloDerecha}</h3>
                    <p class="mt-2 text-sm leading-relaxed" style="color: var(--color-text-muted);">${paso.descripcion}</p>
                    <button id="btnAccionPaso" class="btn-accent mt-5">${paso.boton}</button>
                </div>`;
            panel.style.opacity = '1';
            container.querySelector('#btnAccionPaso').addEventListener('click', () => {
                UCLA.components.toast.show(`"${paso.boton}" simulado correctamente`, 'success');
                const nuevosCompletados = UCLA.state.marcarOnboardingPaso(paso.id);
                pasoSeleccionado = primerPasoPendiente(nuevosCompletados);
                pintarPasos(container, nuevosCompletados);
                pintarPanelDerecho(container);
            });
        }, 150);
    }

    UCLA.views['inicio'] = { render };
})();

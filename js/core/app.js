// Arranque de la aplicación: login/logout y glue final. Todo lo demás
// (namespace, state, router, componentes, vistas) ya se cargó antes que este script.
(function () {
    let appIniciada = false;

    function iniciarApp() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');

        if (!appIniciada) {
            UCLA.components.sidebar.render(document.getElementById('sidebar'));
            UCLA.components.topbar.render(document.getElementById('topbar'));
            UCLA.router.start();
            appIniciada = true;
        }
    }

    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        if (!email || !password) return;
        if (!UCLA.utils.esCorreoInstitucional(email)) {
            UCLA.components.toast.show('Use su correo institucional @amigo.edu.co para iniciar sesión', 'error');
            return;
        }
        iniciarApp();
    });

    window.logout = function logout() {
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginModal').classList.remove('hidden');
    };

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // Todo overlay modal del sitio (los 3 originales de index.html y los
            // que las vistas crean dinámicamente) comparte la clase .modal —
            // más confiable que adivinar por el sufijo del id. Se excluye
            // #loginModal para no dejar la pantalla en blanco antes de autenticar.
            document.querySelectorAll('.modal:not(.hidden)').forEach((modal) => {
                if (modal.id !== 'loginModal') modal.classList.add('hidden');
            });
        }
    });
})();

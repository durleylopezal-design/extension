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
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if (email && password) iniciarApp();
    });

    window.logout = function logout() {
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginModal').classList.remove('hidden');
    };

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('[id$="Modal"]').forEach((modal) => modal.classList.add('hidden'));
        }
    });
})();

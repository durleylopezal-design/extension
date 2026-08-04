// Notificaciones flotantes ("toasts") simuladas — sustituyen a una respuesta real
// de backend con feedback visual inmediato.
(function () {
    function show(message, type = 'info') {
        const div = document.createElement('div');
        div.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl text-white transform transition-all duration-300 translate-y-0 z-50 ${
            type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : ''
        }`;
        if (type === 'info') {
            div.style.background = 'var(--color-primary)';
            div.style.borderLeft = '4px solid var(--color-accent)';
        }
        div.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>${message}`;
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.transform = 'translateY(100px)';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    }

    UCLA.components.toast = { show };
    window.showNotification = show;
})();

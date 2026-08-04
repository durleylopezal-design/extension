// Modales genéricos de creación (Nueva Oportunidad, Nuevo Evento, Nueva Solicitud)
// y confirmaciones. El markup de esos modales vive de forma estática en index.html
// y se abre/cierra por id.
(function () {
    function open(modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.remove('hidden');
    }

    function close(modalId) {
        const el = document.getElementById(modalId);
        if (el) el.classList.add('hidden');
    }

    UCLA.components.modal = { open, close };

    // Wrappers globales delgados: el markup existente usa onclick="openModal('...')"
    window.openModal = open;
    window.closeModal = close;
})();

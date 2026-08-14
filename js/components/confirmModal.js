// Modal de confirmación genérico (p. ej. "¿Eliminar este registro?"), panel
// singleton igual patrón que recordForm.js — se crea una vez y se reutiliza
// en cualquier módulo que necesite pedir confirmación antes de una acción
// destructiva.
(function () {
    let modalEl = null;

    function asegurarModal() {
        if (modalEl) return modalEl;
        modalEl = document.createElement('div');
        modalEl.id = 'confirmModalOverlay';
        modalEl.className = 'fixed inset-0 z-50 hidden flex items-center justify-center modal';
        modalEl.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-40" data-cm-cerrar></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6">
                <h3 id="cmTitulo" class="text-lg font-bold mb-2" style="color: var(--color-primary-dark);"></h3>
                <p id="cmMensaje" class="text-sm mb-6" style="color: var(--color-text-muted);"></p>
                <div class="flex justify-end gap-2">
                    <button data-cm-cerrar class="px-4 py-2 text-sm rounded-lg" style="color: var(--color-text-muted);">Cancelar</button>
                    <button id="cmConfirmar" class="px-4 py-2 text-sm rounded-lg text-white font-medium" style="background: var(--color-danger);"></button>
                </div>
            </div>`;
        document.body.appendChild(modalEl);
        modalEl.querySelectorAll('[data-cm-cerrar]').forEach((el) => el.addEventListener('click', cerrar));
        return modalEl;
    }

    function abrir({ titulo, mensaje, textoConfirmar, onConfirmar }) {
        const overlay = asegurarModal();
        overlay.querySelector('#cmTitulo').textContent = titulo || 'Confirmar acción';
        overlay.querySelector('#cmMensaje').textContent = mensaje || '¿Está seguro? Esta acción no se puede deshacer.';

        const btnConfirmar = overlay.querySelector('#cmConfirmar');
        btnConfirmar.textContent = textoConfirmar || 'Eliminar';
        btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
        overlay.querySelector('#cmConfirmar').addEventListener('click', () => {
            if (onConfirmar) onConfirmar();
            cerrar();
        });

        overlay.classList.remove('hidden');
    }

    function cerrar() {
        if (modalEl) modalEl.classList.add('hidden');
    }

    UCLA.components.confirmModal = { abrir, cerrar };
})();

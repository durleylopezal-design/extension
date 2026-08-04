// Namespace global de la aplicación. Todo lo que antes vivía como funciones
// sueltas en el <script> de index.html cuelga ahora de UCLA.*
window.UCLA = {
    data: {},        // arrays de ejemplo, uno por dominio (js/data/*.js)
    views: {},        // UCLA.views['crm/pipeline'] = { render(container, params) }
    components: {},   // sidebar, topbar, modal, toast, charts, kanban...
    state: {},         // helpers de estado + localStorage (js/core/state.js)
};

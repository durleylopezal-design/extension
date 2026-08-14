// Capa de persistencia real para datos de negocio (oportunidades, campañas,
// solicitudes de formación, ...), a diferencia de js/core/state.js que solo
// persiste estado de UI. localStorage guarda, por dominio, un snapshot
// completo del array bajo `ucla_crm_data_<dominio>`; UCLA.data[dominio] se
// muta siempre in-place (nunca se reasigna) para que ninguna vista que ya
// haya capturado la referencia del array quede desactualizada.
(function () {
    const PREFIX = 'ucla_crm_data_';

    function leer(dominio) {
        try {
            const raw = localStorage.getItem(PREFIX + dominio);
            return raw === null ? null : JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function escribir(dominio, arr) {
        try {
            localStorage.setItem(PREFIX + dominio, JSON.stringify(arr));
        } catch (e) {
            // localStorage no disponible (modo privado, cuota excedida, etc.) — se ignora
        }
    }

    // Primera carga en este navegador: la semilla del código es el estado inicial
    // (y se persiste tal cual). Cargas siguientes: el snapshot guardado manda.
    function hidratar(dominio, arraySemilla) {
        const guardado = leer(dominio);
        if (guardado) return guardado;
        escribir(dominio, arraySemilla);
        return arraySemilla;
    }

    function crear(dominio, registro) {
        const arr = UCLA.data[dominio];
        const nuevo = Object.assign({ id: crypto.randomUUID() }, registro);
        arr.unshift(nuevo);
        escribir(dominio, arr);
        return nuevo;
    }

    function actualizar(dominio, id, cambios) {
        const item = obtener(dominio, id);
        if (item) Object.assign(item, cambios);
        escribir(dominio, UCLA.data[dominio]);
        return item;
    }

    function eliminar(dominio, id) {
        const arr = UCLA.data[dominio];
        const idx = arr.findIndex((r) => r.id === id);
        if (idx !== -1) arr.splice(idx, 1);
        escribir(dominio, arr);
    }

    function obtener(dominio, id) {
        return UCLA.data[dominio].find((r) => r.id === id);
    }

    UCLA.store = { hidratar, crear, actualizar, eliminar, obtener };
})();

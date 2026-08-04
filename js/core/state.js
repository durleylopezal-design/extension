// Estado de la aplicación persistido en localStorage bajo el prefijo ucla_crm_.
// No hay backend: esto simula sesión, sede activa, preferencias de UI y progreso
// de onboarding entre recargas de página.
(function () {
    const PREFIX = 'ucla_crm_';

    function read(key, fallback) {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
        } catch (e) {
            // localStorage no disponible (modo privado, cuota excedida, etc.) — se ignora
        }
    }

    const SEDES = [
        { codigo: 'MDE', nombre: 'Medellín' },
        { codigo: 'MZL', nombre: 'Manizales' },
        { codigo: 'MTR', nombre: 'Montería' },
        { codigo: 'APD', nombre: 'Apartadó' },
        { codigo: 'BOG', nombre: 'Bogotá' },
    ];

    const usuarioActual = {
        nombre: 'Coord. Sede Medellín',
        correo: 'coordinador@ucla.edu.co',
        cargo: 'Coordinador de Extensión',
        rol: 'admin', // 'admin' | 'coordinador' - controla visibilidad de Administración
        sedeId: 'MDE',
    };

    UCLA.state = {
        SEDES,
        usuarioActual,

        isAdmin() {
            return usuarioActual.rol === 'admin';
        },

        getSedeActiva() {
            return read('sedeActiva', usuarioActual.sedeId);
        },
        setSedeActiva(codigo) {
            write('sedeActiva', codigo);
            document.dispatchEvent(new CustomEvent('ucla:sede-cambiada', { detail: { sede: codigo } }));
        },

        isFolderOpen(folderId) {
            const abiertas = read('sidebarFolders', ['crm']);
            return abiertas.includes(folderId);
        },
        toggleFolder(folderId) {
            const abiertas = read('sidebarFolders', ['crm']);
            const idx = abiertas.indexOf(folderId);
            if (idx === -1) abiertas.push(folderId); else abiertas.splice(idx, 1);
            write('sidebarFolders', abiertas);
            return abiertas.includes(folderId);
        },

        getOnboardingCompletado() {
            return read('onboardingPasos', []);
        },
        marcarOnboardingPaso(pasoId) {
            const pasos = read('onboardingPasos', []);
            if (!pasos.includes(pasoId)) pasos.push(pasoId);
            write('onboardingPasos', pasos);
            return pasos;
        },
        onboardingCompleto() {
            return read('onboardingPasos', []).length >= 5;
        },

        getFavoritos() {
            return read('favoritosInformes', []);
        },
        toggleFavorito(informeId) {
            const favs = read('favoritosInformes', []);
            const idx = favs.indexOf(informeId);
            if (idx === -1) favs.push(informeId); else favs.splice(idx, 1);
            write('favoritosInformes', favs);
            return favs;
        },

        // Carpetas personalizadas de Informes (además de las 11 fijas por módulo)
        getCarpetasPersonalizadas() {
            return read('carpetasInformes', []);
        },
        crearCarpeta(nombre) {
            const carpetas = read('carpetasInformes', []);
            const carpeta = { id: 'custom-' + Date.now(), nombre };
            carpetas.push(carpeta);
            write('carpetasInformes', carpetas);
            return carpeta;
        },
        renombrarCarpeta(id, nombre) {
            const carpetas = read('carpetasInformes', []);
            const carpeta = carpetas.find((c) => c.id === id);
            if (carpeta) carpeta.nombre = nombre;
            write('carpetasInformes', carpetas);
            return carpetas;
        },
        eliminarCarpeta(id) {
            const carpetas = read('carpetasInformes', []).filter((c) => c.id !== id);
            write('carpetasInformes', carpetas);
            return carpetas;
        },

        // Paneles de Análisis (posiciones/orden de componentes y paneles guardados)
        getPaneles() {
            const guardados = read('paneles', null);
            if (guardados) return guardados;
            const semilla = (window.UCLA.data && window.UCLA.data.paneles) || [];
            write('paneles', semilla);
            return semilla;
        },
        guardarPanel(panel) {
            const paneles = this.getPaneles();
            paneles.push(panel);
            write('paneles', paneles);
            return paneles;
        },
        actualizarPanel(id, cambios) {
            const paneles = this.getPaneles();
            const panel = paneles.find((p) => p.id === id);
            if (panel) Object.assign(panel, cambios);
            write('paneles', paneles);
            return panel;
        },

        // Asistente de bienvenida de Análisis (solo se muestra la primera vez)
        analisisAsistenteVisto() {
            return read('analisisAsistenteVisto', false);
        },
        marcarAnalisisAsistenteVisto() {
            write('analisisAsistenteVisto', true);
        },

        resetDatosDemo() {
            Object.keys(localStorage)
                .filter((k) => k.indexOf(PREFIX) === 0)
                .forEach((k) => localStorage.removeItem(k));
        },
    };
})();

// Almacenamiento de archivos adjuntos reales (IndexedDB) para Solicitudes de
// Formación. localStorage (usado por UCLA.store) no es apto para blobs de
// hasta 10MB — por eso los adjuntos viven en su propia base IndexedDB,
// indexados por solicitudId en vez de guardar referencias en UCLA.data.
(function () {
    const DB_NAME = 'ucla_crm_archivos';
    const STORE = 'archivosFormacion';
    const TIPOS_PERMITIDOS = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const TAMANO_MAXIMO = 10 * 1024 * 1024; // 10MB

    let dbPromise = null;

    function abrirDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    const store = db.createObjectStore(STORE, { keyPath: 'id' });
                    store.createIndex('solicitudId', 'solicitudId', { unique: false });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return dbPromise;
    }

    function validar(file) {
        const extensionValida = /\.(pdf|docx?|PDF|DOCX?)$/.test(file.name);
        if (!TIPOS_PERMITIDOS.includes(file.type) && !extensionValida) {
            return 'Solo se permiten archivos PDF o DOCX.';
        }
        if (file.size > TAMANO_MAXIMO) {
            return 'El archivo supera el tamaño máximo de 10MB.';
        }
        return null;
    }

    function meta(registro) {
        return { id: registro.id, solicitudId: registro.solicitudId, nombre: registro.nombre, tipo: registro.tipo, tamano: registro.tamano, fechaCarga: registro.fechaCarga };
    }

    async function guardar(solicitudId, file) {
        const error = validar(file);
        if (error) throw new Error(error);
        const db = await abrirDB();
        const registro = {
            id: crypto.randomUUID(),
            solicitudId,
            nombre: file.name,
            tipo: file.type || 'application/octet-stream',
            tamano: file.size,
            blob: file,
            fechaCarga: new Date().toISOString(),
        };
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(registro);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
        return meta(registro);
    }

    async function listar(solicitudId) {
        const db = await abrirDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).index('solicitudId').getAll(solicitudId);
            req.onsuccess = () => resolve(req.result.map(meta));
            req.onerror = () => reject(req.error);
        });
    }

    async function obtenerBlobUrl(archivoId) {
        const db = await abrirDB();
        const registro = await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get(archivoId);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return registro ? URL.createObjectURL(registro.blob) : null;
    }

    async function eliminar(archivoId) {
        const db = await abrirDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).delete(archivoId);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    }

    async function eliminarDeSolicitud(solicitudId) {
        const archivos = await listar(solicitudId);
        for (const a of archivos) await eliminar(a.id);
    }

    UCLA.archivos = { guardar, listar, obtenerBlobUrl, eliminar, eliminarDeSolicitud, TAMANO_MAXIMO };
})();

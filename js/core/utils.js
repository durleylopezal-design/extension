// Utilidades compartidas por vistas y componentes.
(function () {
    function formatoCOP(valor) {
        return '$ ' + Math.round(valor).toLocaleString('es-CO');
    }

    function formatoFecha(fechaIso) {
        if (!fechaIso) return '';
        const [y, m, d] = fechaIso.split('-');
        return `${d}/${m}/${y}`;
    }

    function debounce(fn, waitMs) {
        let timer = null;
        return function debounced(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), waitMs);
        };
    }

    // Exporta un array de objetos planos a CSV y dispara la descarga en el navegador.
    function exportCSV(filename, rows) {
        if (!rows || !rows.length) return;
        const headers = Object.keys(rows[0]);
        const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const csv = [
            headers.map(escape).join(','),
            ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
        ].join('\r\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // Exportación a PDF simulada: usa la impresión del navegador sobre la vista actual.
    function exportPDF() {
        window.print();
    }

    // Convención de color por estado, común a los badges de todo el CRM:
    // verde = aprobado/pagado/activo/vigente/completado · turquesa = en
    // proceso/en revisión/programado · naranja = pendiente/por vencer/lista
    // de espera · coral = rechazado/vencido/inactivo/anulado · gris = borrador/archivado.
    function colorEstado(estado) {
        const e = String(estado || '').toLowerCase();
        if (/aprobad|pagad|activ|vigente|complet|homologad|exitos|conectad|confirmad|certificad|conciliad/.test(e)) return 'var(--color-success)';
        if (/proceso|revisi|programad|en curso/.test(e)) return 'var(--color-primary)';
        if (/pendiente|vencer|espera|borrador/.test(e)) return 'var(--color-accent)';
        if (/rechazad|vencid|inactiv|anulad|cancelad|error|descartad|no homologad|diferencia/.test(e)) return 'var(--color-danger)';
        return 'var(--color-neutral-dark, #6B6F72)';
    }

    function badgeEstado(estado) {
        const color = colorEstado(estado);
        return `<span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background: color-mix(in srgb, ${color} 18%, white); color: ${color};">${estado}</span>`;
    }

    // Registra una entrada real en Admin · Auditoría (UCLA.data.registrosAuditoria).
    // Los flujos de aprobación (solicitudes/admision, solicitudes/becas, ...) la
    // llaman en vez de solo simular con un toast.
    function registrarAuditoria({ accion, modulo, detalle }) {
        UCLA.data.registrosAuditoria.unshift({
            id: 'aud-' + Date.now(), fecha: new Date().toISOString().slice(0, 16),
            usuario: UCLA.state.usuarioActual.nombre, accion, modulo, detalle,
        });
    }

    UCLA.utils = { formatoCOP, formatoFecha, debounce, exportCSV, exportPDF, colorEstado, badgeEstado, registrarAuditoria };
})();

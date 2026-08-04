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

    UCLA.utils = { formatoCOP, formatoFecha, debounce, exportCSV, exportPDF };
})();

// Fila de tarjetas KPI reutilizable en los tableros de indicadores de cada
// módulo (mismo estilo visual que las tarjetas ya usadas en Dashboard/Análisis).
(function () {
    // Tailwind escanea el texto del archivo en busca de nombres de clase
    // literales; una clase construida por interpolación (`lg:grid-cols-${n}`)
    // no aparece en el CSS compilado. Se usa un mapa con las clases completas.
    const COLUMNAS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

    function render(container, tarjetas) {
        const colClase = COLUMNAS[Math.min(tarjetas.length, 4)] || COLUMNAS[4];
        container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 ${colClase} gap-4">
                ${tarjetas.map((t) => `
                    <div class="bg-white rounded-xl p-5 shadow-lg" style="border-top: 4px solid ${t.color || 'var(--color-primary)'};">
                        <h4 class="text-xs font-medium uppercase tracking-wide" style="color: var(--color-text-muted);">${t.etiqueta}</h4>
                        <p class="text-2xl font-bold mt-1" style="color: var(--color-text);">${t.valor}</p>
                        ${t.variacion ? `<p class="text-xs mt-1 font-semibold" style="color: ${t.positivo === false ? 'var(--color-danger)' : 'var(--color-success)'};">
                            <i class="fas fa-arrow-${t.positivo === false ? 'down' : 'up'}"></i> ${t.variacion}
                        </p>` : ''}
                    </div>
                `).join('')}
            </div>`;
    }

    UCLA.components.statCards = { render };
})();

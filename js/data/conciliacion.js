// Conciliación de Pagos — movimientos del extracto bancario cruzados contra
// UCLA.data.pagos (pagoId). Los que no tienen pagoId aún están sin conciliar.
UCLA.data.movimientosBancarios = [
    { id: 'mb-01', fecha: '2026-07-20', banco: 'Bancolombia', referencia: 'TRX-88213', valor: 3200000, tipo: 'Transferencia', estado: 'Conciliado', pagoId: 'pag-01' },
    { id: 'mb-02', fecha: '2026-07-22', banco: 'PSE', referencia: 'PSE-55021', valor: 1600000, tipo: 'PSE', estado: 'Conciliado', pagoId: 'pag-02' },
    { id: 'mb-03', fecha: '2026-07-18', banco: 'Bancolombia', referencia: 'TRX-88097', valor: 2900000, tipo: 'Convenio', estado: 'Conciliado', pagoId: 'pag-03' },
    { id: 'mb-04', fecha: '2026-07-19', banco: 'Davivienda', referencia: 'TRX-77102', valor: 2750000, tipo: 'Transferencia', estado: 'Diferencia', pagoId: 'pag-04' },
    { id: 'mb-05', fecha: '2026-07-29', banco: 'Bancolombia', referencia: 'TRX-88450', valor: 2080000, tipo: 'Transferencia', estado: 'Conciliado', pagoId: 'pag-05' },
    { id: 'mb-06', fecha: '2026-07-27', banco: 'Bancolombia', referencia: 'TRX-88401', valor: 1800000, tipo: 'Convenio', estado: 'Conciliado', pagoId: 'pag-06' },
    { id: 'mb-07', fecha: '2026-07-22', banco: 'PSE', referencia: 'PSE-55033', valor: 150000, tipo: 'PSE', estado: 'Conciliado', pagoId: 'pag-07' },
    { id: 'mb-08', fecha: '2026-07-13', banco: 'Bancolombia', referencia: 'TRX-87850', valor: 2900000, tipo: 'Transferencia', estado: 'Conciliado', pagoId: 'pag-08' },
    { id: 'mb-09', fecha: '2026-08-01', banco: 'PSE', referencia: 'PSE-55090', valor: 2295000, tipo: 'PSE', estado: 'Conciliado', pagoId: 'pag-10' },
    { id: 'mb-10', fecha: '2026-07-14', banco: 'Bancolombia', referencia: 'TRX-87910', valor: 1920000, tipo: 'Convenio', estado: 'Conciliado', pagoId: 'pag-11' },
    { id: 'mb-11', fecha: '2026-08-03', banco: 'Bancolombia', referencia: 'TRX-90045', valor: 850000, tipo: 'Transferencia', estado: 'Pendiente', pagoId: null },
    { id: 'mb-12', fecha: '2026-08-02', banco: 'Davivienda', referencia: 'TRX-90012', valor: 2250000, tipo: 'Transferencia', estado: 'Pendiente', pagoId: null },
    { id: 'mb-13', fecha: '2026-08-04', banco: 'PSE', referencia: 'PSE-55112', valor: 1820000, tipo: 'PSE', estado: 'Pendiente', pagoId: null },
];

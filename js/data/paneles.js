// Panel de Análisis por defecto ("Visión general de organización") con sus
// 9 componentes, en el orden exacto de la especificación. UCLA.state.getPaneles()
// siembra este arreglo en localStorage la primera vez.
UCLA.data.paneles = [
    {
        id: 'panel-general',
        nombre: 'Visión general de organización',
        categoria: 'Institucional',
        visibilidad: 'institucion',
        componentes: [
            { id: 'c1', tipo: 'kpi', titulo: 'Posibles estudiantes este mes', valor: '42', variacion: '+18%', positivo: true },
            { id: 'c2', tipo: 'kpi', titulo: 'Ingresos de este mes', valor: '$ 185.200.000', variacion: '+23%', positivo: true },
            { id: 'c3', tipo: 'kpi', titulo: 'Solicitudes en proceso', valor: '27', variacion: '+4 vs. mes anterior', positivo: true },
            { id: 'c4', tipo: 'kpi', titulo: 'Matrículas confirmadas este mes', valor: '138', variacion: '+12 vs. mes anterior', positivo: true },

            { id: 'c5', tipo: 'medidor', titulo: 'Meta de captación de estudiantes, este año', valorActual: 682, meta: 1000, unidad: 'estudiantes' },
            { id: 'c6', tipo: 'embudo', titulo: 'Meta de ingresos, este año', valorActual: 1376000000, meta: 2000000000, unidad: 'COP' },

            {
                id: 'c7', tipo: 'tablaRendimiento', titulo: 'Monitor de rendimiento, últimos tres meses',
                filas: [
                    { mes: 'Mayo', leads: 210, solicitudes: 96, matriculas: 74, ingresos: '$ 156.300.000', pendiente: '$ 12.400.000' },
                    { mes: 'Junio', leads: 184, solicitudes: 88, matriculas: 69, ingresos: '$ 263.900.000', pendiente: '$ 8.100.000' },
                    { mes: 'Julio', leads: 227, solicitudes: 103, matriculas: 82, ingresos: '$ 185.200.000', pendiente: '$ 15.600.000' },
                ],
            },
            {
                id: 'c8', tipo: 'dona', titulo: 'Posibles estudiantes por origen',
                etiquetas: ['Redes sociales', 'Feria educativa', 'Referido de egresado', 'Página web', 'Llamada del asesor', 'Convenio institucional'],
                valores: [32, 21, 15, 18, 9, 5],
            },
            {
                id: 'c9', tipo: 'tablaAsesores', titulo: 'Asesores más productivos',
                filas: [
                    { asesor: 'Ana García', matriculas: 34 },
                    { asesor: 'Carlos Pérez', matriculas: 29 },
                    { asesor: 'María López', matriculas: 26 },
                    { asesor: 'Juan Martínez', matriculas: 21 },
                ],
            },
        ],
    },
];

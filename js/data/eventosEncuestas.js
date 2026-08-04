// Encuestas de satisfacción por evento — resultados agregados (el diseño de
// preguntas se simula con un modelo fijo hasta que exista un surveyBuilder).
UCLA.data.eventosEncuestas = [
    {
        id: 'enc-01', eventoCodigo: 'DIP0392', nombre: 'Encuesta de satisfacción — Diplomado Conciliación Extrajudicial',
        enviadas: 51, respondidas: 38, promedioGeneral: 4.6,
        preguntas: [
            { texto: 'Calidad de los contenidos', promedio: 4.7 },
            { texto: 'Desempeño del facilitador', promedio: 4.8 },
            { texto: 'Organización logística', promedio: 4.2 },
            { texto: 'Probabilidad de recomendar', promedio: 4.6 },
        ],
    },
    {
        id: 'enc-02', eventoCodigo: 'SML0033', nombre: 'Encuesta de satisfacción — Semillero Emprendimiento',
        enviadas: 45, respondidas: 40, promedioGeneral: 4.8,
        preguntas: [
            { texto: 'Calidad de los contenidos', promedio: 4.9 },
            { texto: 'Desempeño del facilitador', promedio: 4.9 },
            { texto: 'Organización logística', promedio: 4.5 },
            { texto: 'Probabilidad de recomendar', promedio: 4.8 },
        ],
    },
    {
        id: 'enc-03', eventoCodigo: 'EVT1004', nombre: 'Encuesta de satisfacción — Taller de Oratoria y Liderazgo',
        enviadas: 30, respondidas: 21, promedioGeneral: 4.3,
        preguntas: [
            { texto: 'Calidad de los contenidos', promedio: 4.4 },
            { texto: 'Desempeño del facilitador', promedio: 4.6 },
            { texto: 'Organización logística', promedio: 3.9 },
            { texto: 'Probabilidad de recomendar', promedio: 4.3 },
        ],
    },
    {
        id: 'enc-04', eventoCodigo: 'DIP0385', nombre: 'Encuesta de satisfacción — Pedagogía Prof. No Licenciados',
        enviadas: 38, respondidas: 12, promedioGeneral: 4.1,
        preguntas: [
            { texto: 'Calidad de los contenidos', promedio: 4.3 },
            { texto: 'Desempeño del facilitador', promedio: 4.2 },
            { texto: 'Organización logística', promedio: 3.7 },
            { texto: 'Probabilidad de recomendar', promedio: 4.1 },
        ],
    },
];

// Facultades y programas — fuente única para los selects de "Facultad" que hoy
// aparecen repetidos e inconsistentes en varios modales de index.html. La usan
// la clasificación de carpetas de Informes y el formulario de Nueva Solicitud
// de Formación (js/views/informes.js).
UCLA.data.facultades = [
    { id: 'fac-derecho', nombre: 'Derecho', programas: [
        { id: 'prog-derecho', nombre: 'Derecho' },
        { id: 'prog-conciliacion', nombre: 'Conciliación Extrajudicial' },
    ] },
    { id: 'fac-ingenieria', nombre: 'Ingeniería', programas: [
        { id: 'prog-sistemas', nombre: 'Ingeniería de Sistemas' },
        { id: 'prog-ia', nombre: 'Inteligencia Artificial Aplicada' },
    ] },
    { id: 'fac-economicas', nombre: 'Ciencias Económicas', programas: [
        { id: 'prog-administracion', nombre: 'Administración de Empresas' },
        { id: 'prog-marketing', nombre: 'Mercadeo Digital' },
    ] },
    { id: 'fac-salud', nombre: 'Ciencias de la Salud', programas: [
        { id: 'prog-psicologia', nombre: 'Psicología' },
        { id: 'prog-enfermeria', nombre: 'Enfermería' },
    ] },
];

// Áreas administrativas para clasificar carpetas de Informes (además de
// Facultad + Programa). Array simple, fácil de extender con más áreas.
UCLA.data.areasCarpetas = ['Extensión', 'Egresados', 'Tesorería', 'Admisiones'];

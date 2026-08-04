# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este repositorio

Este repositorio contiene el **mockup/prototipo estático** (HTML + Tailwind + JS vanilla) del CRM de Extensión Universitaria de la Universidad Católica Luis Amigó (UCLA). Es un prototipo navegable de una sola página (`index.html`) que simula la interfaz de un futuro sistema; **no** contiene backend, base de datos ni build tooling más allá de la compilación de CSS.

`README.md` es el documento de **Discovery Phase** del proyecto (v2.0, FO-DP-001-v2): describe el sistema objetivo completo (backend en Java/Spring Boot, MySQL, frontend en Angular, múltiples sedes, integraciones con ACREDITTA, etc.). Ese documento describe la arquitectura *futura/planeada*, no lo que existe hoy en el código — el `index.html` actual es solo la maqueta de UI usada para validar flujos con el negocio antes de construir el sistema real. Al proponer cambios de arquitectura o alcance, consulta el README para contexto de negocio, pero no asumas que algo descrito ahí ya está implementado.

## Comandos

- Compilar CSS de Tailwind (única tarea de build del repo):
  ```
  npm run build:css
  ```
  Esto ejecuta `tailwindcss -i ./tailwind.src.css -o ./tailwind.css --minify`. `tailwind.src.css` solo contiene las tres directivas `@tailwind` — toda la personalización de colores vive en `tailwind.config.js`.
- No hay lint, tests, ni servidor de desarrollo configurados. Para ver la maqueta basta con abrir `index.html` en el navegador (o servirlo con cualquier servidor estático); no requiere backend.
- Tras editar clases de Tailwind usadas en `index.html`, hay que volver a correr `npm run build:css` porque `tailwind.css` es un artefacto compilado y no debe editarse a mano.

## Arquitectura del prototipo

`index.html` es un shell delgado: el modal de login (`#loginModal`), el contenedor `#mainApp` (oculto hasta el login) con `<aside id="sidebar">` y `<header id="topbar">` vacíos más `<div id="contentArea">` como punto de montaje del router, los tres modales de creación rápida (Nueva Oportunidad/Evento/Solicitud), el panel de notificaciones, y el `<style>` con las variables CSS institucionales en `:root` (`--color-primary` #1C7FA8 turquesa, `--color-primary-dark` #1B3A4A azul petróleo, `--color-accent` #F5821F naranja). Toda la interactividad vive en `js/`, cargado como `<script>` clásicos (sin `type="module"`, sin bundler) en orden de dependencia al final del body — el sitio debe seguir funcionando abierto directamente con `file://`, sin servidor.

```
js/core/namespace.js   → window.UCLA = { data, views, components, state }
js/core/state.js       → localStorage bajo el prefijo ucla_crm_ (sede activa, carpetas del sidebar abiertas, onboarding, favoritos, carpetas de informes, paneles de Análisis, usuario/rol)
js/core/router.js      → router por hash (#/modulo/submodulo): UCLA.views[ruta].render(container, params), montado en #contentArea. Soporta rutas con parámetro (p. ej. 'informes/:id') vía UCLA.router.matchRoute()
js/core/utils.js       → formatoCOP, formatoFecha, debounce, exportCSV, exportPDF (window.print)
js/core/app.js         → bootstrap: login/logout, arranca sidebar+topbar+router tras autenticar
js/components/*.js     → modal, toast, placeholder ("módulo en construcción"), charts (wrappers Chart.js: initIngresos/initSegmentos específicos del Dashboard + initBar/initLine/initDoughnut genéricos), sidebar, topbar (incluye `agregarNotificacion()` para reflejar recordatorios de Actividades en la campana), y el patrón de listado compartido por CRM/Actividades/Solicitudes/Egresados/Financiero: dataTable, filterPanel, listShell (los orquesta), recordForm (panel deslizante de creación), kanbanBoard, emptyState, importWizard (asistente de importación genérico, parametrizado por módulo), statCards (fila de tarjetas KPI) y detailPanel (página de detalle con pestañas + línea de tiempo de interacciones)
js/data/*.js           → arrays de ejemplo, uno por dominio (eventos —incluye campos de calendario/cupos—, eventosAsistentes, eventosEncuestas, financiero, certificados —incluye certificadosEmitidos y plantillasCertificado—, consolidado, cuentas, informes, paneles, leads, contactos, oportunidades, documentos, tareas, reuniones, llamadas, solicitudesAdmision, solicitudesBecas, solicitudesHomologacion, egresados, recordatorios, pagos, cuentasPorCobrar, conciliacion —movimientosBancarios—, alianzas —convenios, programasAlianza, interaccionesAlianza—, encuestasEgresados, ofertasEmpleo, comunidadEgresados —publicacionesComunidad—)
js/views/*.js          → una vista por ruta real: UCLA.views['dashboard'] = { render(container, params) }; las rutas con parámetro se registran como UCLA.views['informes/:id']
```

Los `onclick=""` inline que ya existían en el markup migrado (p. ej. `openModal(...)`, `showCRMTab(...)`, `drag/drop/allowDrop`) se mantienen apuntando a wrappers globales delgados definidos por el componente/vista correspondiente (`window.openModal`, `window.showCRMTab`, etc.) en vez de reescribir todo el markup a `addEventListener`.

### Router y estado de las rutas

El router (`js/core/router.js`) conoce el título de **todas** las rutas de la especificación completa del CRM (CRM, Solicitudes, Eventos, Egresados, Actividades, Financiero, Alianzas, Certificados, Reportes, Inventario, Integraciones, Administración — ver `UCLA.router.TITULOS`), pero por ahora solo un subconjunto tiene vista real registrada en `UCLA.views`:

- `inicio` (onboarding guiado de 5 pasos, solo admins, redirige a `dashboard` si ya se completó), `informes` + `informes/:id` (listado con carpetas/favoritos + detalle con gráficos), `analisis` (panel de control con componentes arrastrables + asistente de bienvenida de 2 pasos), `dashboard`, las **7 secciones de CRM** (`crm/leads`, `crm/contactos`, `crm/cuentas`, `crm/oportunidades`, `crm/previsiones`, `crm/documentos`, `crm/campanas`), las **3 secciones de Actividades** (`actividades/tareas`, `actividades/reuniones`, `actividades/llamadas`) + `actividades/recordatorios`, **las 7 secciones de Eventos** (`eventos/gestion`, `eventos/calendario`, `eventos/asistentes`, `eventos/cupos`, `eventos/checkin`, `eventos/encuestas`, `eventos/reportes` — módulo completo), **3 de Solicitudes** (`solicitudes/admision`, `solicitudes/becas`, `solicitudes/homologacion`) + `solicitudes/seguimiento`, **las 6 secciones de Egresados** (`egresados/base` + `egresados/perfil/:id`, `egresados/encuestas`, `egresados/empleo`, `egresados/comunidad`, `egresados/indicadores` — módulo completo), **las 4 secciones de Certificados** (`certificados/emision`, `certificados/plantillas`, `certificados/verificacion`, `certificados/historial` — módulo completo), **las 4 secciones de Reportes BI** (`reportes/tableros`, `reportes/academicos`, `reportes/financieros`, `reportes/exportacion` — módulo completo), **`financiero/facturacion` + `financiero/pagos` + `financiero/cartera` + `financiero/becas` + `financiero/conciliacion`** (módulo Financiero completo), y **las 4 secciones de Alianzas** (`alianzas/convenios`, `alianzas/empresas` + `alianzas/empresas/:id`, `alianzas/programas`, `alianzas/seguimiento` — módulo completo).

`solicitudesBecas` (`js/data/solicitudesBecas.js`) es la fuente compartida entre `solicitudes/becas` (crea/resuelve solicitudes) y `financiero/becas` (lee las que quedaron con `estado: 'Aprobada'`) — no hay dos arreglos separados para lo mismo. De la misma forma, `alianzas/*` reutiliza `UCLA.data.cuentas` (la misma fuente de `crm/cuentas`) como "empresas aliadas": no existe un arreglo `empresas` aparte, `alianzas/empresas` lista `UCLA.data.cuentas` directamente y `alianzas/empresas/:id` es un `detailPanel` sobre ese mismo registro. `egresados/empleo` (`UCLA.data.ofertasEmpleo`) también referencia `cuentas` como empleador y `UCLA.data.egresados` como postulantes; `certificados/historial` y `certificados/verificacion` comparten `UCLA.data.certificadosEmitidos` (historial interno y buscador público sobre el mismo arreglo, por `codigoVerificacion`); `reportes/academicos`/`reportes/financieros` reutilizan `UCLA.data.consolidado` (la misma fuente de `reportes/tableros`) sin datos nuevos; `reportes/exportacion` reutiliza `UCLA.data.informes` (la misma fuente del módulo Informes). `UCLA.utils.colorEstado()`/`badgeEstado()` centralizan la convención de color por estado (verde=aprobado/pagado/activo/certificado/conciliado, turquesa=en proceso/revisión/programado, naranja=pendiente/por vencer, coral=rechazado/vencido/cancelado/diferencia, gris=borrador) para no repetirla en cada vista nueva.

No todas las vistas nuevas usan `listShell`: `eventos/calendario` es una cuadrícula de mes hecha a mano que colorea los eventos de `UCLA.data.eventos` por `colorEstado(estado)`; `eventos/checkin`, `certificados/verificacion` (buscador público por código) y `egresados/comunidad` (muro de publicaciones tipo feed) tampoco lo usan, por ser herramientas de un solo propósito en vez de listados CRUD; `certificados/plantillas` es una galería de tarjetas (usa `recordForm` para crear, pero no `dataTable`). `eventos/asistentes`/`eventos/cupos` sí usan `listShell` y comparten `UCLA.data.eventosAsistentes` — inscribir en `asistentes` respeta el `cupoMaximo` del evento (pasa a "Lista de espera" si está lleno) y "Promover" en `cupos` hace el camino inverso. `financiero/conciliacion` cruza `UCLA.data.movimientosBancarios` contra `UCLA.data.pagos` por `pagoId`. `egresados/indicadores` es un dashboard 100% calculado en vivo sobre `UCLA.data.egresados`, sin ningún archivo de datos nuevo.

`crm/actividades` ya no es un alias: es un redirect a `#/actividades/tareas` (`js/views/crmOportunidades.js`, al final del archivo).

#### Patrón de listado de CRM y Actividades

`crmLeads.js`, `crmContactos.js`, `crmCuentas.js`, `actTareas.js` y `actReuniones.js`/`actLlamadas.js` (estas dos con modal a medida en vez de `recordForm`) siguen el mismo patrón: `UCLA.components.listShell.render(container, config)` — con `columnas`/`filas`/`filaId` para la tabla (`dataTable.js`), `camposModulo` para el panel de filtros (`filterPanel.js` — solo el buscador de texto filtra de verdad; los checkboxes de filtro son presentacionales) y `botonPrincipal.onClick` que abre `UCLA.components.recordForm.abrir({ titulo, secciones, onGuardar })` para crear un registro (el `onGuardar` inserta la fila en el arreglo local de la vista y vuelve a pintar — no hay persistencia real). `listShell` acepta `extraToolbarHtml`/`onExtraToolbarBind` para inyectar controles propios de una sección (el selector STAGEVIEW de Oportunidades, el botón "Registrar una llamada" de Llamadas) y su menú "Importar" abre `UCLA.components.importWizard.abrir({ modulo })`.

`crmOportunidades.js` reutiliza el mismo `listShell` pero con `vistaInicial: 'kanban'` y un `renderKanban` que delega en `kanbanBoard.js` (drag & drop nativo). `actTareas.js` reutiliza `kanbanBoard.js` de forma genérica: agrupa por el campo que el usuario elija en el modal "Vista Kanban, Configuración" (`campoEtapa` de `kanbanBoard.render`, antes fijo en `'etapa'`). `crmPrevisiones.js`/`crmCampanas.js` usan `emptyState.bienvenida()`. `crmDocumentos.js` es la única vista de CRM que no usa `listShell` (explorador de carpetas a medida).

Recordatorios: cuando se crea una tarea/reunión/llamada con un "Recordatorio" distinto de "Ninguno", la vista llama a `UCLA.components.topbar.agregarNotificacion({ titulo, detalle })`, que incrementa el contador de la campana y agrega un ítem al panel de notificaciones (`#notificationsPanel`, estático en `index.html`). La detección de cruce de horario en "Programar una llamada" (`actLlamadas.js`) solo cubre el caso explícito de la especificación: una reunión de `todoElDia: true` el mismo día de la llamada.

Cualquier otra ruta renderiza `UCLA.components.placeholder` ("Módulo en construcción") en vez de fallar — antes de esta migración, los ítems de sidebar sin `div` de módulo asociado (alianzas, usuarios, config) rompían `showModule()` con un `TypeError`; el router lo corrige de raíz.

### Sidebar y topbar

`js/components/sidebar.js` renderiza el menú completo (Inicio, Módulos con carpetas desplegables, Administración) a partir de una estructura de datos declarada en el propio archivo; el estado expandido/colapsado de cada carpeta persiste por `UCLA.state.toggleFolder()`/`isFolderOpen()`. `js/components/topbar.js` renderiza buscador global (busca sobre `UCLA.data.*`), selector de sede, notificaciones, botón "+Nuevo" y menú de perfil.

### Al modificar la UI

- Los colores institucionales están definidos en dos lugares que deben mantenerse coherentes: `tailwind.config.js` (paletas `brand`/`accent`/`neutral`/`danger`, con `safelist` para clases que se generan dinámicamente en JS) y las variables CSS en el `<style>` de `index.html` (`--color-danger` es el coral `#E96B5A`, usado para estados obligatorios/vencidos/cruces de horario). Tras cambiar cualquiera, correr `npm run build:css`.
- Los datos de ejemplo viven en `js/data/*.js` como `UCLA.data.<dominio>`; para agregar/editar registros de ejemplo, edita esos arrays.
- Para añadir una vista real a una ruta que hoy es placeholder: crear `js/views/<archivo>.js` con `UCLA.views['ruta'] = { render(container, params) { ... } }`, añadir el `<script>` en `index.html` después de `js/components/*.js` y antes de `js/core/app.js`, y el router la recogerá automáticamente (ya tiene el título registrado).

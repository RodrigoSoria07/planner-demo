/* Planner Demo — 100% fictional data. No real company, people or projects. */
(function () {
  'use strict';
  const PD = (window.PD = window.PD || {});

  // Fixed "today" so the demo (and screenshots) always look the same.
  PD.TODAY = new Date(2026, 10, 23); // Mon 23 Nov 2026
  PD.DAY = 86400000;
  PD.addDays = (n) => new Date(PD.TODAY.getTime() + n * PD.DAY);

  PD.COMPANY = 'Nimbus Retail Group';

  PD.STATUSES = ['backlog', 'progress', 'review', 'done'];
  PD.PRIORITIES = ['critical', 'high', 'medium', 'low'];

  PD.PEOPLE = [
    { id: 'vm', name: 'Valeria Montes', color: '#6366f1', role: { en: 'Product Manager', es: 'Gerente de producto' } },
    { id: 'da', name: 'Diego Arriaza', color: '#0ea5e9', role: { en: 'Engineering Lead', es: 'Líder de ingeniería' } },
    { id: 'cr', name: 'Camila Ruiz', color: '#f59e0b', role: { en: 'Data Analyst', es: 'Analista de datos' } },
    { id: 'th', name: 'Tomás Herrera', color: '#ec4899', role: { en: 'Mobile Developer', es: 'Desarrollador móvil' } },
    { id: 'lf', name: 'Lucía Fernández', color: '#10b981', role: { en: 'Finance Systems', es: 'Sistemas financieros' } },
    { id: 'mo', name: 'Mateo Ortiz', color: '#8b5cf6', role: { en: 'Support Operations', es: 'Operaciones de soporte' } },
    { id: 'sp', name: 'Sofía Paredes', color: '#ef4444', role: { en: 'UX Designer', es: 'Diseñadora UX' } },
  ];

  // s / e = start / due as day offsets from TODAY.
  PD.PROJECTS = [
    { id: 'p1', color: '#6366f1', owner: 'vm', s: -70, e: 67, n: { en: 'Storefront Relaunch', es: 'Relanzamiento de tienda' },
      ms: [{ d: -14, n: { en: 'Design system live', es: 'Sistema de diseño listo' } }, { d: 40, n: { en: 'Beta checkout', es: 'Checkout beta' } }] },
    { id: 'p2', color: '#0ea5e9', owner: 'da', s: -49, e: 95, n: { en: 'Warehouse Automation', es: 'Automatización de bodega' },
      ms: [{ d: -10, n: { en: 'Dock scanning live', es: 'Escaneo en muelles' } }, { d: 60, n: { en: 'Zone B pilot', es: 'Piloto zona B' } }] },
    { id: 'p3', color: '#f59e0b', owner: 'cr', s: -91, e: 25, n: { en: 'Customer Data Platform', es: 'Plataforma de datos de clientes' },
      ms: [{ d: -30, n: { en: 'Unified customer ID', es: 'ID único de cliente' } }, { d: 25, n: { en: 'Go-live', es: 'Salida a producción' } }] },
    { id: 'p4', color: '#ec4899', owner: 'th', s: -21, e: 128, n: { en: 'Mobile Loyalty App', es: 'App móvil de lealtad' },
      ms: [{ d: 45, n: { en: 'Closed beta', es: 'Beta cerrada' } }, { d: 110, n: { en: 'Store launch', es: 'Lanzamiento en tiendas' } }] },
    { id: 'p5', color: '#10b981', owner: 'lf', s: -56, e: 18, n: { en: 'Finance Close Automation', es: 'Automatización del cierre contable' },
      ms: [{ d: -12, n: { en: 'Bank bot live', es: 'Bot bancario activo' } }, { d: 18, n: { en: 'First automated close', es: 'Primer cierre automático' } }] },
    { id: 'p6', color: '#8b5cf6', owner: 'mo', s: -42, e: 53, n: { en: 'Support Desk Migration', es: 'Migración de mesa de ayuda' },
      ms: [{ d: 14, n: { en: 'Channel cutover', es: 'Corte de canales' } }, { d: 53, n: { en: 'Legacy tool retired', es: 'Herramienta anterior retirada' } }] },
  ];

  const S = (en, es, done) => ({ en, es, done: !!done });
  const C = (who, en, es, ago) => ({ who, en, es, ago });

  PD.TASKS = [
    // --- Storefront Relaunch
    { id: 't1', p: 'p1', st: 'done', pr: 'high', who: ['sp'], s: -60, e: -14, w: 0,
      n: { en: 'Design system & component library', es: 'Sistema de diseño y librería de componentes' },
      sub: [S('Design tokens', 'Tokens de diseño', 1), S('Buttons, forms, tables', 'Botones, formularios, tablas', 1), S('Documentation site', 'Sitio de documentación', 1)],
      cm: [C('vm', 'Great work — this unblocks the whole team.', 'Excelente trabajo, esto destraba a todo el equipo.', 14)] },
    { id: 't2', p: 'p1', st: 'review', pr: 'high', who: ['sp', 'da'], s: -30, e: -2, w: 4,
      n: { en: 'Product page redesign', es: 'Rediseño de la página de producto' },
      sub: [S('Wireframes', 'Wireframes', 1), S('High-fidelity mockups', 'Maquetas de alta fidelidad', 1), S('Accessibility audit', 'Auditoría de accesibilidad', 0), S('Developer handoff', 'Entrega a desarrollo', 0)],
      cm: [C('da', 'Review is blocked on the accessibility audit.', 'La revisión espera la auditoría de accesibilidad.', 2), C('sp', 'Audit scheduled for Wednesday.', 'Auditoría programada para el miércoles.', 1)] },
    { id: 't3', p: 'p1', st: 'progress', pr: 'critical', who: ['da'], s: -14, e: 9, w: 10,
      n: { en: 'One-page checkout', es: 'Checkout en una sola página' },
      sub: [S('Address autocomplete', 'Autocompletado de direcciones', 1), S('Digital wallets', 'Billeteras digitales', 1), S('Error states', 'Estados de error', 0), S('A/B test setup', 'Configuración de prueba A/B', 0), S('Analytics events', 'Eventos de analítica', 0)],
      cm: [C('vm', 'Target: +4% conversion on mobile.', 'Meta: +4% de conversión en móvil.', 5)] },
    { id: 't4', p: 'p1', st: 'backlog', pr: 'medium', who: ['vm'], s: 5, e: 30, w: 0,
      n: { en: 'SEO migration & redirects', es: 'Migración SEO y redirecciones' },
      sub: [S('URL map', 'Mapa de URLs', 0), S('301 redirects', 'Redirecciones 301', 0), S('Sitemap & monitoring', 'Sitemap y monitoreo', 0)], cm: [] },
    { id: 't5', p: 'p1', st: 'progress', pr: 'medium', who: ['da'], s: -7, e: 21, w: 10,
      n: { en: 'Performance budget (Core Web Vitals)', es: 'Presupuesto de rendimiento (Core Web Vitals)' },
      sub: [S('Image pipeline', 'Pipeline de imágenes', 1), S('Lazy loading', 'Carga diferida', 0), S('CDN cache rules', 'Reglas de caché en CDN', 0)], cm: [] },
    { id: 't30', p: 'p1', st: 'progress', pr: 'medium', who: ['vm'], s: -3, e: 14, w: 14,
      n: { en: 'Q1 portfolio planning', es: 'Planeación de portafolio del Q1' }, sub: [], cm: [] },

    // --- Warehouse Automation
    { id: 't6', p: 'p2', st: 'done', pr: 'high', who: ['da'], s: -45, e: -10, w: 0,
      n: { en: 'Barcode scanning at receiving docks', es: 'Escaneo de códigos en muelles de recepción' },
      sub: [S('Select scanners', 'Selección de escáneres', 1), S('Dock software', 'Software de muelles', 1), S('Operator training', 'Capacitación de operarios', 1)], cm: [] },
    { id: 't7', p: 'p2', st: 'progress', pr: 'critical', who: ['da', 'cr'], s: -20, e: 6, w: 10,
      n: { en: 'Pick-path optimisation', es: 'Optimización de rutas de picking' },
      sub: [S('Route data model', 'Modelo de datos de rutas', 1), S('Simulate layouts', 'Simulación de layouts', 1), S('Pilot in zone B', 'Piloto en zona B', 0), S('Rollout checklist', 'Checklist de despliegue', 0)],
      cm: [C('cr', 'Simulation shows −18% walking distance.', 'La simulación muestra −18% de distancia recorrida.', 3)] },
    { id: 't8', p: 'p2', st: 'review', pr: 'high', who: ['lf', 'da'], s: -18, e: 1, w: 4,
      n: { en: 'Inventory sync with ERP', es: 'Sincronización de inventario con el ERP' },
      sub: [S('Field mapping', 'Mapeo de campos', 1), S('Nightly job', 'Proceso nocturno', 1), S('Reconciliation report', 'Reporte de conciliación', 1), S('User acceptance testing', 'Pruebas de aceptación', 0)], cm: [] },
    { id: 't9', p: 'p2', st: 'backlog', pr: 'low', who: ['th'], s: 12, e: 40, w: 0,
      n: { en: 'Cycle-count mobile checklist', es: 'Checklist móvil de conteo cíclico' }, sub: [], cm: [] },
    { id: 't10', p: 'p2', st: 'progress', pr: 'medium', who: ['mo'], s: -5, e: 18, w: 10,
      n: { en: 'Dock scheduling board', es: 'Tablero de citas en muelles' }, sub: [], cm: [] },

    // --- Customer Data Platform
    { id: 't11', p: 'p3', st: 'done', pr: 'critical', who: ['cr'], s: -80, e: -30, w: 0,
      n: { en: 'Unified customer ID', es: 'ID único de cliente' },
      sub: [S('Matching rules', 'Reglas de coincidencia', 1), S('Deduplicate 1.2M profiles', 'Deduplicar 1.2M de perfiles', 1)], cm: [] },
    { id: 't12', p: 'p3', st: 'progress', pr: 'high', who: ['cr'], s: -25, e: 4, w: 10,
      n: { en: 'Customer segmentation dashboards', es: 'Dashboards de segmentación de clientes' },
      sub: [S('RFM model', 'Modelo RFM', 1), S('Retention cohorts', 'Cohortes de retención', 1), S('Churn-risk flag', 'Indicador de riesgo de fuga', 0), S('Publish to leadership', 'Publicar a gerencia', 0)],
      cm: [C('vm', 'Leadership wants this before the board meeting.', 'Gerencia lo necesita antes de la junta.', 4)] },
    { id: 't13', p: 'p3', st: 'review', pr: 'high', who: ['vm'], s: -15, e: 3, w: 4,
      n: { en: 'Consent & privacy audit', es: 'Auditoría de consentimiento y privacidad' }, sub: [], cm: [] },
    { id: 't14', p: 'p3', st: 'backlog', pr: 'medium', who: ['cr', 'th'], s: 8, e: 24, w: 0,
      n: { en: 'Marketing audience sync', es: 'Sincronización de audiencias de marketing' }, sub: [], cm: [] },

    // --- Mobile Loyalty App
    { id: 't15', p: 'p4', st: 'progress', pr: 'critical', who: ['th', 'da'], s: -16, e: 12, w: 20,
      n: { en: 'Points engine API', es: 'API del motor de puntos' },
      sub: [S('Rules schema', 'Esquema de reglas', 1), S('Accrual service', 'Servicio de acumulación', 1), S('Redemption endpoint', 'Endpoint de canje', 0), S('Load test', 'Prueba de carga', 0)],
      cm: [C('da', 'Accrual is stable under 800 req/s.', 'La acumulación es estable a 800 req/s.', 2)] },
    { id: 't16', p: 'p4', st: 'progress', pr: 'high', who: ['sp'], s: -22, e: -3, w: 16,
      n: { en: 'Onboarding & sign-up flow', es: 'Flujo de registro y bienvenida' },
      sub: [S('Prototype', 'Prototipo', 1), S('User tests (8 sessions)', 'Pruebas con usuarios (8 sesiones)', 1), S('Implement final flow', 'Implementar flujo final', 0)],
      cm: [C('vm', 'Three days late — can we cut the optional survey step?', 'Tres días de atraso: ¿quitamos el paso opcional de encuesta?', 1)] },
    { id: 't17', p: 'p4', st: 'backlog', pr: 'medium', who: ['mo'], s: 14, e: 45, w: 0,
      n: { en: 'Push notification journeys', es: 'Recorridos de notificaciones push' }, sub: [], cm: [] },
    { id: 't18', p: 'p4', st: 'backlog', pr: 'low', who: ['th'], s: 25, e: 60, w: 0,
      n: { en: 'Store locator & QR wallet pass', es: 'Localizador de tiendas y pase QR' }, sub: [], cm: [] },
    { id: 't29', p: 'p4', st: 'progress', pr: 'high', who: ['th'], s: -9, e: 20, w: 14,
      n: { en: 'Offline mode for points balance', es: 'Modo sin conexión para el saldo de puntos' },
      sub: [S('Local cache', 'Caché local', 1), S('Conflict resolution', 'Resolución de conflictos', 0), S('Sync indicator', 'Indicador de sincronización', 0)], cm: [] },

    // --- Finance Close Automation
    { id: 't20', p: 'p5', st: 'done', pr: 'high', who: ['lf'], s: -50, e: -12, w: 0,
      n: { en: 'Bank-feed reconciliation bot', es: 'Bot de conciliación bancaria' },
      sub: [S('Parse statements', 'Lectura de extractos', 1), S('Matching rules', 'Reglas de conciliación', 1), S('Exception queue', 'Cola de excepciones', 1)], cm: [] },
    { id: 't21', p: 'p5', st: 'progress', pr: 'high', who: ['lf'], s: -10, e: 7, w: 18,
      n: { en: 'Month-end checklist automation', es: 'Automatización del checklist de cierre' },
      sub: [S('Map the checklist', 'Mapear el checklist', 1), S('Build tracker', 'Construir seguimiento', 1), S('Reminders & alerts', 'Recordatorios y alertas', 0), S('Sign-off flow', 'Flujo de aprobación', 0)], cm: [] },
    { id: 't22', p: 'p5', st: 'review', pr: 'medium', who: ['cr', 'lf'], s: -8, e: 2, w: 4,
      n: { en: 'Variance commentary reports', es: 'Reportes de comentarios de variación' }, sub: [], cm: [] },
    { id: 't23', p: 'p5', st: 'backlog', pr: 'low', who: ['mo'], s: 10, e: 18, w: 0,
      n: { en: 'Audit evidence archive', es: 'Archivo de evidencias de auditoría' }, sub: [], cm: [] },

    // --- Support Desk Migration
    { id: 't24', p: 'p6', st: 'progress', pr: 'critical', who: ['mo'], s: -28, e: 14, w: 16,
      n: { en: 'Channel inbox migration', es: 'Migración de canales de atención' },
      sub: [S('Inventory channels', 'Inventario de canales', 1), S('Connect email', 'Conectar correo', 1), S('Connect web chat', 'Conectar chat web', 1), S('Connect WhatsApp', 'Conectar WhatsApp', 0), S('Cutover plan', 'Plan de corte', 0)],
      cm: [C('mo', 'WhatsApp templates are awaiting approval.', 'Las plantillas de WhatsApp esperan aprobación.', 1)] },
    { id: 't25', p: 'p6', st: 'done', pr: 'medium', who: ['mo'], s: -30, e: -6, w: 0,
      n: { en: 'Macros & canned replies', es: 'Macros y respuestas predefinidas' }, sub: [], cm: [] },
    { id: 't26', p: 'p6', st: 'progress', pr: 'high', who: ['mo', 'vm'], s: -6, e: 10, w: 10,
      n: { en: 'SLA & escalation rules', es: 'Reglas de SLA y escalamiento' }, sub: [], cm: [] },
    { id: 't27', p: 'p6', st: 'backlog', pr: 'medium', who: ['vm'], s: 11, e: 26, w: 0,
      n: { en: 'Agent training sessions', es: 'Sesiones de capacitación de agentes' }, sub: [], cm: [] },
    { id: 't28', p: 'p6', st: 'review', pr: 'low', who: ['sp'], s: -9, e: 5, w: 4,
      n: { en: 'Customer satisfaction survey', es: 'Encuesta de satisfacción del cliente' }, sub: [], cm: [] },
  ];

  // Weekly history, last 8 weeks (oldest first).
  PD.HISTORY = {
    completed: [3, 4, 2, 5, 6, 4, 5, 5],
    created: [5, 4, 4, 6, 5, 6, 4, 5],
    onTime: [78, 81, 76, 84, 88, 86, 90, 92],
  };

  PD.NOTIFS = [
    { who: 'da', en: 'moved “One-page checkout” to In progress', es: 'movió “Checkout en una sola página” a En progreso', ago: '12m' },
    { who: 'sp', en: 'commented on “Product page redesign”', es: 'comentó en “Rediseño de la página de producto”', ago: '1h' },
    { who: 'vm', en: 'assigned you “Consent & privacy audit”', es: 'te asignó “Auditoría de consentimiento y privacidad”', ago: '3h' },
    { who: 'mo', en: 'completed “Macros & canned replies”', es: 'completó “Macros y respuestas predefinidas”', ago: '1d' },
  ];

  PD.I18N = {
    en: {
      overview: 'Overview', board: 'Board', roadmap: 'Roadmap', projects: 'Projects', team: 'Team',
      workspace: 'Workspace', views: 'Views', allProjects: 'All projects', search: 'Search tasks…', everyone: 'Everyone', anyPriority: 'Any priority',
      newTask: 'New task', demoNote: 'Demo with 100% fictional data', reset: 'Reset demo', theme: 'Theme', language: 'Language',
      backlog: 'Backlog', progress: 'In progress', review: 'In review', done: 'Done',
      critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
      openTasks: 'Open tasks', completedPct: 'Completion', overdue: 'Overdue', onTime: 'On-time delivery', thisWeek: 'this week', vsLast: 'vs last week',
      activeProjects: 'active projects', throughput: 'Weekly throughput', throughputSub: 'Tasks completed vs created', onTimeTrend: 'On-time delivery trend',
      byStatus: 'Tasks by status', workload: 'Team workload', upcoming: 'Upcoming deadlines', projectHealth: 'Project health',
      created: 'Created', completed: 'Completed', groupBy: 'Group by', none: 'None', byProject: 'Project', byPerson: 'Person',
      expandAll: 'Expand all', collapseAll: 'Collapse all', showTasks: 'Show tasks', hideTasks: 'Hide tasks', today: 'Today',
      task: 'Task', owner: 'Owner', status: 'Status', priority: 'Priority', start: 'Start', due: 'Due', assignees: 'Assignees', progressLbl: 'Progress',
      subtasks: 'Subtasks', comments: 'Comments', noComments: 'No comments yet', addComment: 'Add a comment and press Enter…', project: 'Project',
      capacity: 'Capacity', hrsWeek: 'h/week', loadLabel: 'Weekly load', openCount: 'open', noOpen: 'No open tasks', atRisk: 'At risk', onTrack: 'On track', complete: 'Complete', behind: 'Behind',
      create: 'Create task', cancel: 'Cancel', title: 'Title', notifications: 'Notifications', daysLeft: 'd left', daysLate: 'd late', milestone: 'Milestone',
      tasksWord: 'tasks', noResults: 'No tasks match these filters.', you: 'You',
      hierarchy: 'Project › Task › Subtask', of: 'of', ago: 'ago',
    },
    es: {
      overview: 'Resumen', board: 'Tablero', roadmap: 'Roadmap', projects: 'Proyectos', team: 'Equipo',
      workspace: 'Espacio de trabajo', views: 'Vistas', allProjects: 'Todos los proyectos', search: 'Buscar tareas…', everyone: 'Todos', anyPriority: 'Cualquier prioridad',
      newTask: 'Nueva tarea', demoNote: 'Demo con datos 100% ficticios', reset: 'Reiniciar demo', theme: 'Tema', language: 'Idioma',
      backlog: 'Pendiente', progress: 'En progreso', review: 'En revisión', done: 'Hecho',
      critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja',
      openTasks: 'Tareas abiertas', completedPct: 'Avance', overdue: 'Atrasadas', onTime: 'Entrega a tiempo', thisWeek: 'esta semana', vsLast: 'vs semana pasada',
      activeProjects: 'proyectos activos', throughput: 'Productividad semanal', throughputSub: 'Tareas completadas vs creadas', onTimeTrend: 'Tendencia de entrega a tiempo',
      byStatus: 'Tareas por estado', workload: 'Carga del equipo', upcoming: 'Próximos vencimientos', projectHealth: 'Salud de proyectos',
      created: 'Creadas', completed: 'Completadas', groupBy: 'Agrupar por', none: 'Ninguno', byProject: 'Proyecto', byPerson: 'Persona',
      expandAll: 'Expandir todo', collapseAll: 'Contraer todo', showTasks: 'Mostrar tareas', hideTasks: 'Ocultar tareas', today: 'Hoy',
      task: 'Tarea', owner: 'Responsable', status: 'Estado', priority: 'Prioridad', start: 'Inicio', due: 'Vence', assignees: 'Asignados', progressLbl: 'Avance',
      subtasks: 'Subtareas', comments: 'Comentarios', noComments: 'Aún no hay comentarios', addComment: 'Escribe un comentario y presiona Enter…', project: 'Proyecto',
      capacity: 'Capacidad', hrsWeek: 'h/semana', loadLabel: 'Carga semanal', openCount: 'abiertas', noOpen: 'Sin tareas abiertas', atRisk: 'En riesgo', onTrack: 'En curso', complete: 'Completo', behind: 'Atrasado',
      create: 'Crear tarea', cancel: 'Cancelar', title: 'Título', notifications: 'Notificaciones', daysLeft: 'd restantes', daysLate: 'd de atraso', milestone: 'Hito',
      tasksWord: 'tareas', noResults: 'Ninguna tarea coincide con los filtros.', you: 'Tú',
      hierarchy: 'Proyecto › Tarea › Subtarea', of: 'de', ago: 'hace',
    },
  };
})();

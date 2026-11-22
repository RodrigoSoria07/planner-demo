/* Planner Demo — core: state, helpers, shell, board, drawer, modal. */
(function () {
  'use strict';
  const PD = window.PD;
  const KEY = 'planner-demo-v1';
  const VIEWS = ['overview', 'board', 'roadmap', 'projects', 'team'];
  const FILTERED_VIEWS = ['board', 'roadmap', 'projects'];

  const state = (PD.state = {
    view: 'overview', lang: 'en', theme: 'light', proj: '', who: '', prio: '', q: '', group: 'none',
    laneClosed: {}, expanded: { p1: true, p2: true }, showTasks: true, open: null, tasks: null,
  });
  PD.views = {};

  /* ---------- helpers ---------- */
  PD.t = (k) => (PD.I18N[state.lang] && PD.I18N[state.lang][k]) || PD.I18N.en[k] || k;
  PD.L = (o) => (o && (o[state.lang] || o.en)) || '';
  PD.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  PD.person = (id) => PD.PEOPLE.find((p) => p.id === id);
  PD.project = (id) => PD.PROJECTS.find((p) => p.id === id);
  PD.task = (id) => state.tasks.find((t) => t.id === id);
  PD.initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  PD.avatar = (id, cls) => {
    const p = PD.person(id);
    return `<span class="avatar ${cls || ''}" style="background:${p.color}" title="${PD.esc(p.name)}">${PD.initials(p.name)}</span>`;
  };
  PD.avatars = (ids) => `<span class="avatars">${ids.map((i) => PD.avatar(i)).join('')}</span>`;
  PD.fmt = (offset, opts) =>
    new Intl.DateTimeFormat(state.lang === 'es' ? 'es' : 'en', opts || { month: 'short', day: 'numeric' }).format(PD.addDays(offset));
  PD.isOpen = (t) => t.st !== 'done';
  PD.isOverdue = (t) => PD.isOpen(t) && t.e < 0;
  PD.taskPct = (t) => {
    if (t.st === 'done') return 100;
    if (t.sub.length) return Math.round((t.sub.filter((s) => s.done).length / t.sub.length) * 100);
    return { backlog: 0, progress: 50, review: 85 }[t.st];
  };
  PD.projPct = (pid) => {
    const ts = state.tasks.filter((t) => t.p === pid);
    return ts.length ? Math.round(ts.reduce((a, t) => a + PD.taskPct(t), 0) / ts.length) : 0;
  };
  PD.dueLabel = (t) => {
    if (t.st === 'done') return PD.fmt(t.e);
    return PD.isOverdue(t) ? `${-t.e}${PD.t('daysLate')}` : PD.fmt(t.e);
  };
  PD.filtered = () => {
    const q = state.q.trim().toLowerCase();
    return state.tasks.filter((t) => {
      if (state.proj && t.p !== state.proj) return false;
      if (state.who && !t.who.includes(state.who)) return false;
      if (state.prio && t.pr !== state.prio) return false;
      if (q && !(PD.L(t.n).toLowerCase().includes(q) || PD.L(PD.project(t.p).n).toLowerCase().includes(q))) return false;
      return true;
    });
  };
  PD.prioPill = (pr) => `<span class="pill ${pr}">${PD.t(pr)}</span>`;
  PD.stDot = (s) => `<span class="st-dot st-${s}"></span>`;
  PD.progressBar = (pct, color) => `<div class="bar"><i style="width:${pct}%;${color ? `background:${color}` : ''}"></i></div>`;

  const ICON = {
    overview: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
    board: '<rect x="3" y="3" width="5" height="18" rx="1.5"/><rect x="10" y="3" width="5" height="12" rx="1.5"/><rect x="17" y="3" width="4" height="8" rx="1.5"/>',
    roadmap: '<path d="M3 6h10M7 12h12M5 18h9"/>',
    projects: '<path d="M4 6h16M4 12h10M4 18h6M16 14l3 3 2-3"/>',
    team: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14c2.8 0 4.5 1.8 4.5 4.5"/>',
    bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7 2.5 7h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  };
  PD.icon = (n, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra || ''}>${ICON[n]}</svg>`;

  /* ---------- persistence ---------- */
  function seed() { return JSON.parse(JSON.stringify(PD.TASKS)); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ tasks: state.tasks, lang: state.lang, theme: state.theme })); } catch (e) { /* storage may be blocked */ }
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && Array.isArray(raw.tasks)) { state.tasks = raw.tasks; state.lang = raw.lang || 'en'; state.theme = raw.theme || 'light'; }
    } catch (e) { /* ignore corrupt storage */ }
    if (!state.tasks) state.tasks = seed();
  }
  PD.save = save;

  /* ---------- shell ---------- */
  function renderSide() {
    const nav = VIEWS.map((v) => `<button class="nav-item ${state.view === v ? 'active' : ''}" data-act="nav" data-v="${v}">${PD.icon(v)}${PD.t(v)}</button>`).join('');
    const projs = PD.PROJECTS.map((p) => {
      const n = state.tasks.filter((t) => t.p === p.id && PD.isOpen(t)).length;
      return `<button class="nav-item ${state.proj === p.id ? 'active' : ''}" data-act="proj" data-p="${p.id}"><i class="dot" style="background:${p.color}"></i><span>${PD.esc(PD.L(p.n))}</span><span class="count">${n}</span></button>`;
    }).join('');
    document.getElementById('side').innerHTML = `
      <div class="brand"><div class="logo">P</div><div><b>Planner</b><small>${PD.COMPANY}</small></div></div>
      <h6>${PD.t('views')}</h6>${nav}
      <h6>${PD.t('projects')}</h6>${projs}
      <div class="side-foot">
        <div class="demo-pill">● ${PD.t('demoNote')}</div>
        <div class="chip-row">
          <button class="mini-btn" data-act="lang" data-l="en" ${state.lang === 'en' ? 'style="background:rgba(255,255,255,.14)"' : ''}>EN</button>
          <button class="mini-btn" data-act="lang" data-l="es" ${state.lang === 'es' ? 'style="background:rgba(255,255,255,.14)"' : ''}>ES</button>
          <button class="mini-btn" data-act="theme">${state.theme === 'dark' ? '☀' : '☾'} ${PD.t('theme')}</button>
          <button class="mini-btn" data-act="reset">${PD.t('reset')}</button>
        </div>
      </div>`;
  }

  function renderTop() {
    const filters = FILTERED_VIEWS.includes(state.view);
    const opt = (v, l, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${PD.esc(l)}</option>`;
    const people = opt('', PD.t('everyone'), state.who) + PD.PEOPLE.map((p) => opt(p.id, p.name, state.who)).join('');
    const prios = opt('', PD.t('anyPriority'), state.prio) + PD.PRIORITIES.map((p) => opt(p, PD.t(p), state.prio)).join('');
    const projName = state.proj ? ` · ${PD.esc(PD.L(PD.project(state.proj).n))}` : '';
    document.getElementById('topbar').innerHTML = `
      <h1>${PD.t(state.view)}${filters ? projName : ''}</h1>
      ${filters ? `<div class="search">${PD.icon('search')}<input id="q" placeholder="${PD.t('search')}" value="${PD.esc(state.q)}"></div>
      <select class="sel" data-f="who">${people}</select><select class="sel" data-f="prio">${prios}</select>` : ''}
      <span class="spacer"></span>
      <button class="icon-btn" data-act="notifs" aria-label="${PD.t('notifications')}">${PD.icon('bell')}<span class="badge">${PD.NOTIFS.length}</span></button>
      <button class="btn primary" data-act="new">+ ${PD.t('newTask')}</button>`;
  }

  PD.renderView = () => {
    const view = document.getElementById('view');
    view.innerHTML = PD.views[state.view]();
  };
  PD.render = () => {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.documentElement.lang = state.lang;
    renderSide(); renderTop(); PD.renderView(); renderDrawer();
  };

  /* ---------- board ---------- */
  function card(t, showProject) {
    const p = PD.project(t.p);
    const done = t.sub.filter((s) => s.done).length;
    const sub = t.sub.length ? `<div class="sub-row">${PD.progressBar(PD.taskPct(t), p.color)}<span>${done}/${t.sub.length}</span></div>` : '';
    return `<div class="tcard" draggable="true" data-act="open" data-id="${t.id}" style="--pc:${p.color}">
      ${showProject ? `<span class="proj-chip"><i style="background:${p.color}"></i>${PD.esc(PD.L(p.n))}</span>` : ''}
      <div class="ttl">${PD.esc(PD.L(t.n))}</div>${sub}
      <div class="meta">${PD.prioPill(t.pr)}<span class="${PD.isOverdue(t) ? 'late' : ''}">${PD.dueLabel(t)}</span>${PD.avatars(t.who)}</div>
    </div>`;
  }

  function groupTasks(list) {
    if (state.group === 'project') return PD.PROJECTS.map((p) => ({ key: p.id, title: `<i class="dot" style="background:${p.color};width:10px;height:10px;border-radius:3px;display:inline-block"></i> ${PD.esc(PD.L(p.n))}`, tasks: list.filter((t) => t.p === p.id) })).filter((g) => g.tasks.length);
    if (state.group === 'person') return PD.PEOPLE.map((p) => ({ key: p.id, title: `${PD.avatar(p.id, 'sm')} ${PD.esc(p.name)}`, tasks: list.filter((t) => t.who[0] === p.id) })).filter((g) => g.tasks.length);
    return [{ key: 'all', title: null, tasks: list }];
  }

  PD.views.board = () => {
    const list = PD.filtered();
    if (!list.length) return `<div class="card empty">${PD.t('noResults')}</div>`;
    const head = PD.STATUSES.map((s) => `<div class="col-head">${PD.stDot(s)} ${PD.t(s)} <span class="n">${list.filter((t) => t.st === s).length}</span></div>`).join('');
    const seg = (id, label) => `<button class="${state.group === id ? 'on' : ''}" data-act="group" data-g="${id}">${label}</button>`;
    const lanes = groupTasks(list).map((g) => {
      const cells = PD.STATUSES.map((s) => `<div class="cell" data-st="${s}">${g.tasks.filter((t) => t.st === s).map((t) => card(t, state.group !== 'project')).join('')}</div>`).join('');
      const title = g.title ? `<div class="lane-title" data-act="lane" data-lane="${g.key}"><span class="chev">${PD.icon('chev', 'width="16" height="16"')}</span>${g.title} <span class="faint">${g.tasks.length}</span></div>` : '';
      return `<section class="lane ${state.laneClosed[g.key] ? 'closed' : ''}">${title}<div class="lane-grid">${cells}</div></section>`;
    }).join('');
    return `<div class="toolbar"><span>${PD.t('groupBy')}:</span><div class="seg">${seg('none', PD.t('none'))}${seg('project', PD.t('byProject'))}${seg('person', PD.t('byPerson'))}</div></div>
      <div class="board-head">${head}</div>${lanes}`;
  };

  /* ---------- drawer ---------- */
  function renderDrawer() {
    const el = document.getElementById('drawer');
    const t = state.open && PD.task(state.open);
    document.getElementById('scrim').classList.toggle('on', !!t);
    el.classList.toggle('on', !!t);
    if (!t) { el.innerHTML = ''; return; }
    const p = PD.project(t.p);
    const sel = (f, vals, cur) => `<select class="sel" data-f="${f}">${vals.map((v) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${PD.t(v)}</option>`).join('')}</select>`;
    const subs = t.sub.map((s, i) => `<div class="chk ${s.done ? 'on' : ''}"><button class="cb ${s.done ? 'on' : ''}" data-act="sub" data-id="${t.id}" data-i="${i}">${s.done ? PD.icon('check') : ''}</button><span>${PD.esc(PD.L(s))}</span></div>`).join('');
    const cms = t.cm.length ? t.cm.map((c) => `<div class="cmt">${PD.avatar(c.who)}<div class="bub"><b>${PD.esc(PD.person(c.who).name)}</b> <small>${typeof c.ago === 'number' ? `${state.lang === 'es' ? 'hace' : ''} ${c.ago}d ${state.lang === 'es' ? '' : 'ago'}` : PD.t('you') + ' · ' + c.ago}</small><div>${PD.esc(PD.L(c))}</div></div></div>`).join('') : `<div class="muted">${PD.t('noComments')}</div>`;
    el.innerHTML = `<button class="close" data-act="close" aria-label="Close">✕</button>
      <header><span class="proj-chip"><i style="background:${p.color}"></i>${PD.esc(PD.L(p.n))}</span><h2>${PD.esc(PD.L(t.n))}</h2></header>
      <div class="body">
        <div class="props">
          <span class="k">${PD.t('status')}</span><div>${sel('d-st', PD.STATUSES, t.st)}</div>
          <span class="k">${PD.t('priority')}</span><div>${sel('d-pr', PD.PRIORITIES, t.pr)}</div>
          <span class="k">${PD.t('assignees')}</span><div style="display:flex;gap:8px;align-items:center">${PD.avatars(t.who)} <span class="muted">${t.who.map((w) => PD.person(w).name.split(' ')[0]).join(', ')}</span></div>
          <span class="k">${PD.t('start')} → ${PD.t('due')}</span><div>${PD.fmt(t.s)} → <span class="${PD.isOverdue(t) ? 'late' : ''}">${PD.fmt(t.e)}</span></div>
          <span class="k">${PD.t('progressLbl')}</span><div style="display:flex;gap:10px;align-items:center"><div style="flex:1">${PD.progressBar(PD.taskPct(t), p.color)}</div><b>${PD.taskPct(t)}%</b></div>
        </div>
        ${t.sub.length ? `<div><div class="sec-title"><span>${PD.t('subtasks')}</span><span>${t.sub.filter((s) => s.done).length}/${t.sub.length}</span></div>${subs}</div>` : ''}
        <div><div class="sec-title"><span>${PD.t('comments')}</span></div>${cms}<input class="cinput" id="cmt" data-id="${t.id}" placeholder="${PD.t('addComment')}"></div>
      </div>`;
  }
  PD.openTask = (id) => { state.open = id; renderDrawer(); };
  const closeAll = () => {
    state.open = null; renderDrawer();
    document.getElementById('modal').classList.remove('on');
    document.getElementById('notifs').classList.remove('on');
    document.getElementById('scrim').classList.remove('on');
  };

  /* ---------- modal & notifications ---------- */
  function isoDate(offset) {
    const d = PD.addDays(offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function openModal() {
    const o = (v, l) => `<option value="${v}">${PD.esc(l)}</option>`;
    const m = document.getElementById('modal');
    m.innerHTML = `<h3 style="font-size:17px">${PD.t('newTask')}</h3>
      <label>${PD.t('title')}<input id="m-title" autofocus></label>
      <div class="two"><label>${PD.t('project')}<select id="m-proj">${PD.PROJECTS.map((p) => o(p.id, PD.L(p.n))).join('')}</select></label>
      <label>${PD.t('assignees')}<select id="m-who">${PD.PEOPLE.map((p) => o(p.id, p.name)).join('')}</select></label></div>
      <div class="two"><label>${PD.t('priority')}<select id="m-pr">${PD.PRIORITIES.map((p) => o(p, PD.t(p))).join('')}</select></label>
      <label>${PD.t('due')}<input id="m-due" type="date" value="${isoDate(14)}"></label></div>
      <footer><button class="btn" data-act="close">${PD.t('cancel')}</button><button class="btn primary" data-act="create">${PD.t('create')}</button></footer>`;
    m.classList.add('on'); document.getElementById('scrim').classList.add('on');
    setTimeout(() => document.getElementById('m-title').focus(), 0);
  }
  function createTask() {
    const val = (id) => document.getElementById(id).value;
    const title = val('m-title').trim();
    if (!title) { document.getElementById('m-title').focus(); return; }
    const due = Math.round((new Date(val('m-due') + 'T00:00:00') - PD.TODAY) / PD.DAY);
    state.tasks.unshift({ id: 'n' + Date.now(), p: val('m-proj'), st: 'backlog', pr: val('m-pr'), who: [val('m-who')], s: 0, e: Number.isFinite(due) ? due : 14, w: 0, n: { en: title, es: title }, sub: [], cm: [] });
    save(); closeAll(); PD.render();
  }
  function renderNotifs() {
    document.getElementById('notifs').innerHTML = `<h4>${PD.t('notifications')}</h4>` + PD.NOTIFS.map((n) =>
      `<div class="row">${PD.avatar(n.who)}<div class="grow"><b>${PD.esc(PD.person(n.who).name.split(' ')[0])}</b> ${PD.esc(PD.L(n))}</div><span class="faint">${n.ago}</span></div>`).join('');
  }

  /* ---------- actions ---------- */
  function setStatus(t, s) {
    t.st = s;
    if (s === 'done') t.sub.forEach((x) => { x.done = true; });
    save(); PD.render();
  }
  function toggleSub(id, i) {
    const t = PD.task(id); const s = t.sub[i];
    s.done = !s.done;
    if (t.st === 'done' && !s.done) t.st = 'progress';
    save(); PD.render();
  }
  function setRoute(v) {
    state.view = VIEWS.includes(v) ? v : 'overview';
    if (location.hash.slice(1) !== state.view) history.replaceState(null, '', '#' + state.view);
  }
  const ACTIONS = {
    nav: (d) => { setRoute(d.v); closeAll(); PD.render(); },
    proj: (d) => { state.proj = state.proj === d.p ? '' : d.p; if (['overview', 'team'].includes(state.view)) setRoute('board'); PD.render(); },
    lang: (d) => { state.lang = d.l; save(); PD.render(); },
    theme: () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); PD.render(); },
    reset: () => { localStorage.removeItem(KEY); state.tasks = seed(); Object.assign(state, { proj: '', who: '', prio: '', q: '' }); PD.render(); },
    new: openModal, create: createTask, close: closeAll,
    notifs: () => { renderNotifs(); document.getElementById('notifs').classList.toggle('on'); },
    open: (d) => PD.openTask(d.id),
    group: (d) => { state.group = d.g; PD.renderView(); },
    lane: (d) => { state.laneClosed[d.lane] = !state.laneClosed[d.lane]; PD.renderView(); },
    sub: (d) => toggleSub(d.id, +d.i),
    exp: (d) => { state.expanded[d.pid] = !state.expanded[d.pid]; PD.renderView(); },
    expAll: (d) => { PD.PROJECTS.forEach((p) => { state.expanded[p.id] = d.on === '1'; }); PD.renderView(); },
    person: (d) => { state.who = d.who; setRoute('board'); closeAll(); PD.render(); },
  };

  function onClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el) { if (!e.target.closest('#notifs')) document.getElementById('notifs').classList.remove('on'); return; }
    if (el.tagName === 'BUTTON' && el.dataset.act === 'sub') e.stopPropagation();
    const fn = ACTIONS[el.dataset.act];
    if (fn) fn(el.dataset);
  }

  function onChange(e) {
    const f = e.target.dataset.f;
    if (!f) return;
    if (f === 'who' || f === 'prio') { state[f] = e.target.value; PD.renderView(); return; }
    const t = state.open && PD.task(state.open);
    if (!t) return;
    if (f === 'd-st') setStatus(t, e.target.value);
    if (f === 'd-pr') { t.pr = e.target.value; save(); PD.render(); }
  }

  function bindDrag() {
    let dragId = null;
    document.addEventListener('dragstart', (e) => {
      const c = e.target.closest && e.target.closest('.tcard');
      if (!c) return;
      dragId = c.dataset.id; c.classList.add('dragging'); e.dataTransfer.setData('text/plain', dragId); e.dataTransfer.effectAllowed = 'move';
    });
    document.addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.dragging,.over').forEach((n) => n.classList.remove('dragging', 'over')); });
    document.addEventListener('dragover', (e) => { const c = e.target.closest && e.target.closest('.cell'); if (c && dragId) { e.preventDefault(); c.classList.add('over'); } });
    document.addEventListener('dragleave', (e) => { const c = e.target.closest && e.target.closest('.cell'); if (c) c.classList.remove('over'); });
    document.addEventListener('drop', (e) => {
      const c = e.target.closest && e.target.closest('.cell');
      if (!c || !dragId) return;
      e.preventDefault();
      const t = PD.task(dragId); dragId = null;
      if (t && t.st !== c.dataset.st) setStatus(t, c.dataset.st);
    });
  }

  function readUrl() {
    const q = new URLSearchParams(location.search);
    if (q.get('lang')) state.lang = q.get('lang') === 'es' ? 'es' : 'en';
    if (q.get('theme')) state.theme = q.get('theme') === 'dark' ? 'dark' : 'light';
    if (q.get('group')) state.group = q.get('group');
    if (q.get('open')) state.open = q.get('open');
    if (q.get('proj')) state.proj = q.get('proj');
    if (q.get('expand') === 'all') PD.PROJECTS.forEach((p) => { state.expanded[p.id] = true; });
    if (q.get('expand') === 'none') state.expanded = {};
    setRoute(location.hash.slice(1) || 'overview');
  }

  PD.start = () => {
    load(); readUrl();
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', (e) => { if (e.target.id === 'q') { state.q = e.target.value; PD.renderView(); } });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
      if (e.key === 'Enter' && e.target.id === 'cmt' && e.target.value.trim()) {
        const t = PD.task(e.target.dataset.id);
        t.cm.push({ who: 'vm', en: e.target.value.trim(), es: e.target.value.trim(), ago: state.lang === 'es' ? 'ahora' : 'just now' });
        save(); renderDrawer();
      }
    });
    document.getElementById('scrim').addEventListener('click', closeAll);
    window.addEventListener('hashchange', () => { setRoute(location.hash.slice(1)); PD.render(); });
    bindDrag();
    PD.render();
  };
})();

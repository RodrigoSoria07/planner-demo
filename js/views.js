/* Planner Demo — views: overview, roadmap, projects tree, team. */
(function () {
  'use strict';
  const PD = window.PD;
  const state = PD.state;
  const CAPACITY = 40;

  /* ---------- derived metrics ---------- */
  PD.load = (pid) => {
    const hrs = state.tasks.filter((t) => t.who.includes(pid) && (t.st === 'progress' || t.st === 'review')).reduce((a, t) => a + t.w / t.who.length, 0);
    return Math.round(hrs);
  };
  PD.projStatus = (pid) => {
    const p = PD.project(pid);
    const tasks = state.tasks.filter((t) => t.p === pid);
    const pct = PD.projPct(pid);
    if (tasks.length && pct === 100) return { cls: 'ok', key: 'complete' };
    const late = tasks.filter(PD.isOverdue).length;
    const expected = Math.max(0, Math.min(100, ((0 - p.s) / (p.e - p.s)) * 100));
    if (pct + 25 < expected) return { cls: 'bad', key: 'behind' };
    if (late > 0) return { cls: 'warn', key: 'atRisk' };
    return { cls: 'ok', key: 'onTrack' };
  };
  const statusTag = (s) => `<span class="tag ${s.cls}">${PD.t(s.key)}</span>`;

  /* ---------- tiny SVG charts ---------- */
  function spark(values, color) {
    const max = Math.max(...values), min = Math.min(...values), n = values.length;
    const pts = values.map((v, i) => `${(i / (n - 1)) * 96},${32 - ((v - min) / (max - min || 1)) * 28 - 2}`).join(' ');
    return `<svg class="spark" viewBox="0 0 96 34"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function barChart(h) {
    const W = 600, H = 210, padL = 26, padB = 26, max = 8, gw = (W - padL) / h.completed.length;
    const y = (v) => H - padB - (v / max) * (H - padB - 10);
    let g = '';
    [0, 2, 4, 6, 8].forEach((v) => { g += `<line x1="${padL}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--border)"/><text x="0" y="${y(v) + 4}" font-size="10" fill="var(--faint)">${v}</text>`; });
    h.completed.forEach((c, i) => {
      const x = padL + i * gw + gw * 0.14, bw = gw * 0.3;
      g += `<rect x="${x}" y="${y(c)}" width="${bw}" height="${H - padB - y(c)}" rx="4" fill="var(--accent)"/>`;
      g += `<rect x="${x + bw + 4}" y="${y(h.created[i])}" width="${bw}" height="${H - padB - y(h.created[i])}" rx="4" fill="var(--faint)" opacity=".45"/>`;
      g += `<text x="${x + bw}" y="${H - 8}" font-size="10.5" fill="var(--muted)" text-anchor="middle">${PD.fmt(-49 + i * 7)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${PD.t('throughput')}">${g}</svg>`;
  }
  function donut(counts, total) {
    const R = 52, C = 2 * Math.PI * R;
    let off = 0, arcs = '';
    PD.STATUSES.forEach((s) => {
      const len = (counts[s] / total) * C;
      arcs += `<circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--st-${s})" stroke-width="18" stroke-dasharray="${len - 2} ${C - len + 2}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`;
      off += len;
    });
    return `<svg viewBox="0 0 140 140" width="150" height="150">${arcs}<text x="70" y="70" text-anchor="middle" font-size="26" font-weight="800" fill="var(--ink)">${total}</text><text x="70" y="88" text-anchor="middle" font-size="10.5" fill="var(--muted)">${PD.t('tasksWord')}</text></svg>`;
  }

  /* ---------- overview ---------- */
  PD.views.overview = () => {
    const all = state.tasks, h = PD.HISTORY;
    const open = all.filter(PD.isOpen).length;
    const overdue = all.filter(PD.isOverdue).length;
    const pct = Math.round(all.reduce((a, t) => a + PD.taskPct(t), 0) / all.length);
    const counts = {}; PD.STATUSES.forEach((s) => { counts[s] = all.filter((t) => t.st === s).length; });
    const onTime = h.onTime[h.onTime.length - 1], onTimeDelta = onTime - h.onTime[h.onTime.length - 2];
    const kpi = (lbl, val, delta, sp, color) => `<div class="card kpi"><div class="lbl">${lbl}</div><div class="val">${val}</div><div class="delta">${delta}</div>${sp ? spark(sp, color) : ''}</div>`;
    const kpis = `<div class="kpis">
      ${kpi(PD.t('openTasks'), open, `<b class="up">${PD.PROJECTS.length}</b> ${PD.t('activeProjects')}`, h.created, 'var(--accent)')}
      ${kpi(PD.t('completedPct'), pct + '%', `<b class="up">+${h.completed[7]}</b> ${PD.t('completed').toLowerCase()} ${PD.t('thisWeek')}`, h.completed, 'var(--st-done)')}
      ${kpi(PD.t('overdue'), overdue, `${all.filter((t) => PD.isOpen(t) && t.e >= 0 && t.e <= 7).length} ${PD.t('due').toLowerCase()} ≤ 7d`, null)}
      ${kpi(PD.t('onTime'), onTime + '%', `<b class="${onTimeDelta >= 0 ? 'up' : 'down'}">${onTimeDelta >= 0 ? '+' : ''}${onTimeDelta} pts</b> ${PD.t('vsLast')}`, h.onTime, 'var(--st-done)')}
    </div>`;

    const chart = `<div class="card pad"><h3>${PD.t('throughput')}</h3><div class="sub">${PD.t('throughputSub')}</div><div style="margin-top:10px">${barChart(h)}</div>
      <div class="legend"><span style="--c:var(--accent)">${PD.t('completed')}</span><span style="--c:var(--faint)">${PD.t('created')}</span></div></div>`;
    const stat = `<div class="card pad"><h3>${PD.t('byStatus')}</h3><div class="donut-wrap">${donut(counts, all.length)}<ul>${PD.STATUSES.map((s) => `<li>${PD.stDot(s)} ${PD.t(s)}<b>${counts[s]}</b></li>`).join('')}</ul></div></div>`;

    const health = PD.PROJECTS.map((p) => `<div class="clickable" data-act="proj" data-p="${p.id}" style="padding:2px 4px;border-radius:8px"><div class="top"><span class="proj-chip" style="font-size:13px;color:var(--ink)"><i style="background:${p.color}"></i>${PD.esc(PD.L(p.n))}</span>${statusTag(PD.projStatus(p.id))}</div>${PD.progressBar(PD.projPct(p.id), p.color)}</div>`).join('');
    const upcoming = all.filter(PD.isOpen).sort((a, b) => a.e - b.e).slice(0, 7).map((t) => `<div class="row clickable" data-act="open" data-id="${t.id}"><div class="grow"><div class="ttl">${PD.esc(PD.L(t.n))}</div><span class="proj-chip"><i style="background:${PD.project(t.p).color}"></i>${PD.esc(PD.L(PD.project(t.p).n))}</span></div><span class="${PD.isOverdue(t) ? 'late' : 'muted'}">${PD.dueLabel(t)}</span>${PD.avatar(t.who[0])}</div>`).join('');
    const work = PD.PEOPLE.map((p) => {
      const l = PD.load(p.id), pc = Math.min(100, Math.round((l / CAPACITY) * 100));
      return `<div class="row clickable" data-act="person" data-who="${p.id}">${PD.avatar(p.id)}<div class="grow"><div style="display:flex;justify-content:space-between"><span class="ttl">${p.name.split(' ')[0]}</span><span class="muted">${l}/${CAPACITY}h</span></div><div class="bar load ${pc > 90 ? 'hi' : pc > 70 ? 'mid' : ''}" style="margin-top:5px"><i style="width:${pc}%"></i></div></div></div>`;
    }).join('');
    return `${kpis}<div class="grid-2">${chart}${stat}</div>
      <div class="grid-3"><div class="card pad"><h3>${PD.t('projectHealth')}</h3><div class="health">${health}</div></div>
      <div class="card pad"><h3>${PD.t('upcoming')}</h3>${upcoming}</div>
      <div class="card pad"><h3>${PD.t('workload')}</h3>${work}</div></div>`;
  };

  /* ---------- roadmap ---------- */
  const R0 = -100, R1 = 140, PPD = 3.5, LABEL_W = 290;
  const px = (d) => Math.round((d - R0) * PPD);
  PD.views.roadmap = () => {
    const list = PD.filtered();
    const trackW = (R1 - R0) * PPD;
    let months = '';
    for (let d = R0; d <= R1; d++) {
      const dt = PD.addDays(d);
      if (dt.getDate() === 1) months += `<div class="g-month" style="left:${px(d)}px">${PD.fmt(d, { month: 'short', year: dt.getMonth() === 0 ? 'numeric' : undefined })}</div>`;
    }
    const track = (inner) => `<div class="g-track" style="width:${trackW}px">${inner}</div>`;
    const rows = PD.PROJECTS.filter((p) => !state.proj || state.proj === p.id).map((p) => {
      const mine = list.filter((t) => t.p === p.id);
      if (!mine.length && (state.who || state.prio || state.q)) return '';
      const open = state.expanded[p.id];
      const ms = p.ms.map((m) => `<span class="ms" style="--c:${p.color};left:${px(m.d) - 7}px" title="${PD.esc(PD.L(m.n))} · ${PD.fmt(m.d)}"></span>`).join('');
      const bar = `<div class="g-bar" style="--c:${p.color};left:${px(p.s)}px;width:${px(p.e) - px(p.s)}px"><i style="width:${PD.projPct(p.id)}%"></i><span>${PD.projPct(p.id)}%</span></div>`;
      let out = `<div class="g-row proj"><div class="g-label" data-act="exp" data-pid="${p.id}"><span style="width:16px;transform:rotate(${open ? 0 : -90}deg);display:inline-block;color:var(--faint)">${PD.icon('chev', 'width="16" height="16"')}</span><i style="width:10px;height:10px;border-radius:3px;background:${p.color};flex:none"></i><span class="nm">${PD.esc(PD.L(p.n))}</span><span style="margin-left:auto">${PD.avatar(p.owner, 'sm')}</span></div>${track(bar + ms)}</div>`;
      if (open && state.showTasks) {
        out += mine.map((t) => `<div class="g-row task"><div class="g-label" data-act="open" data-id="${t.id}"><span class="st-dot st-${t.st}"></span><span class="nm">${PD.esc(PD.L(t.n))}</span></div>${track(`<div class="g-bar ${PD.isOverdue(t) ? 'late' : ''}" data-act="open" data-id="${t.id}" style="--c:${p.color};left:${px(t.s)}px;width:${Math.max(8, px(t.e) - px(t.s))}px" title="${PD.esc(PD.L(t.n))} · ${PD.fmt(t.s)} → ${PD.fmt(t.e)}"><i style="width:${PD.taskPct(t)}%"></i></div>`)}</div>`).join('');
      }
      return out;
    }).join('');
    const todayX = LABEL_W + px(0);
    return `<div class="toolbar"><div class="seg"><button data-act="expAll" data-on="1">${PD.t('expandAll')}</button><button data-act="expAll" data-on="0">${PD.t('collapseAll')}</button></div>
      <span class="muted" style="display:inline-flex;align-items:center;gap:6px"><span class="ms" style="position:static;--c:var(--accent);transform:rotate(45deg) scale(.8)"></span> ${PD.t('milestone')}</span></div>
      <div class="card gantt"><div class="g-inner" style="width:${LABEL_W + trackW}px">
        <div class="g-head"><div class="g-label">${PD.t('project')} / ${PD.t('task')}</div><div class="g-scale" style="width:${trackW}px">${months}</div></div>
        ${rows}<div class="today-line" style="left:${todayX}px"></div><span class="today-tag" style="left:${todayX}px">${PD.t('today')}</span>
      </div></div>`;
  };

  /* ---------- projects tree (hierarchy by columns) ---------- */
  PD.views.projects = () => {
    const list = PD.filtered();
    const filtering = state.who || state.prio || state.q;
    const check = (t, i, s) => `<button class="cb ${s.done ? 'on' : ''}" data-act="sub" data-id="${t.id}" data-i="${i}">${s.done ? PD.icon('check') : ''}</button>`;
    let body = '';
    PD.PROJECTS.filter((p) => !state.proj || state.proj === p.id).forEach((p) => {
      const mine = list.filter((t) => t.p === p.id);
      if (!mine.length && filtering) return;
      const open = state.expanded[p.id];
      body += `<tr class="l0 ${open ? '' : 'closed'}" data-act="exp" data-pid="${p.id}" style="cursor:pointer"><td><div class="nm"><span class="chev">${PD.icon('chev', 'width="16" height="16"')}</span><i style="width:10px;height:10px;border-radius:3px;background:${p.color}"></i>${PD.esc(PD.L(p.n))} <span class="faint" style="font-weight:500">${mine.length}</span></div></td>
        <td>${PD.avatar(p.owner)}</td><td>${statusTag(PD.projStatus(p.id))}</td><td></td>
        <td><div class="tbar">${PD.progressBar(PD.projPct(p.id), p.color)}<small>${PD.projPct(p.id)}%</small></div></td><td>${PD.fmt(p.s)}</td><td>${PD.fmt(p.e)}</td></tr>`;
      if (!open) return;
      mine.forEach((t) => {
        body += `<tr class="l1 clickable" data-act="open" data-id="${t.id}"><td><div class="nm">${PD.esc(PD.L(t.n))}</div></td><td>${PD.avatars(t.who)}</td>
          <td><span class="nm">${PD.stDot(t.st)} ${PD.t(t.st)}</span></td><td>${PD.prioPill(t.pr)}</td>
          <td><div class="tbar">${PD.progressBar(PD.taskPct(t), p.color)}<small>${PD.taskPct(t)}%</small></div></td><td>${PD.fmt(t.s)}</td><td class="${PD.isOverdue(t) ? 'late' : ''}">${PD.dueLabel(t)}</td></tr>`;
        t.sub.forEach((s, i) => {
          body += `<tr class="l2 ${s.done ? 'sub-done' : ''}"><td><div class="nm">${check(t, i, s)}<span>${PD.esc(PD.L(s))}</span></div></td><td></td><td class="faint">${s.done ? PD.t('done') : ''}</td><td></td><td></td><td></td><td></td></tr>`;
        });
      });
    });
    if (!body) return `<div class="card empty">${PD.t('noResults')}</div>`;
    return `<div class="toolbar"><div class="seg"><button data-act="expAll" data-on="1">${PD.t('expandAll')}</button><button data-act="expAll" data-on="0">${PD.t('collapseAll')}</button></div><span>${PD.t('hierarchy')}</span></div>
      <div class="card" style="overflow:hidden"><table class="tree"><thead><tr><th style="width:34%">${PD.t('task')}</th><th>${PD.t('owner')}</th><th>${PD.t('status')}</th><th>${PD.t('priority')}</th><th>${PD.t('progressLbl')}</th><th>${PD.t('start')}</th><th>${PD.t('due')}</th></tr></thead><tbody>${body}</tbody></table></div>`;
  };

  /* ---------- team ---------- */
  PD.views.team = () => {
    const cards = PD.PEOPLE.map((p) => {
      const mine = state.tasks.filter((t) => t.who.includes(p.id));
      const l = PD.load(p.id), pc = Math.round((l / CAPACITY) * 100);
      const stat = PD.STATUSES.map((s) => `<div><b>${mine.filter((t) => t.st === s).length}</b>${PD.t(s)}</div>`).join('');
      const next = mine.filter((t) => t.st === 'progress' || t.st === 'review').sort((a, b) => a.e - b.e).slice(0, 3);
      const tasks = next.length ? next.map((t) => `<div class="ptask"><i style="width:8px;height:8px;border-radius:3px;background:${PD.project(t.p).color};flex:none"></i><span class="t">${PD.esc(PD.L(t.n))}</span><span class="${PD.isOverdue(t) ? 'late' : 'muted'}">${PD.dueLabel(t)}</span></div>`).join('') : `<div class="muted">${PD.t('noOpen')}</div>`;
      return `<div class="card pcard" data-act="person" data-who="${p.id}">
        <div class="who">${PD.avatar(p.id, 'lg')}<div><b>${p.name}</b><small>${PD.esc(PD.L(p.role))}</small></div><span style="margin-left:auto" class="tag ${pc > 90 ? 'bad' : pc > 70 ? 'warn' : 'ok'}">${pc}%</span></div>
        <div><div class="load-top"><span>${PD.t('loadLabel')}</span><span>${l} / ${CAPACITY} ${PD.t('hrsWeek')}</span></div><div class="bar load ${pc > 90 ? 'hi' : pc > 70 ? 'mid' : ''}"><i style="width:${Math.min(100, pc)}%"></i></div></div>
        <div class="mini-stats">${stat}</div><div>${tasks}</div></div>`;
    }).join('');
    return `<div class="team-grid">${cards}</div>`;
  };
})();

// Spreadsheet CV. Renders window.CV (js/cv-data.js) as a grey sheet:
// row numbers in the gutter, one row per entry, and a timeline on the right
// that runs backwards (newest on the left). Tabs across the top pick which
// groups show; a zoom control switches the timeline between years and
// months. Everything is in the hash so it can be linked:
//   /cv#moment            a tab
//   /cv#moment&zoom=years a tab at a zoom
//   /cv#moment/tahoe      a tab with an entry open
//   /cv#tahoe             an entry (opens in a tab that has it)
(function () {
  const CV = window.CV;
  const top = document.getElementById('top');
  const intro = document.getElementById('intro');
  const wrap = document.getElementById('sheet-wrap');
  const sheet = document.getElementById('sheet');
  const viewer = document.getElementById('viewer');
  const media = document.getElementById('viewer-media');
  const commentBody = document.getElementById('comment-body');
  const closeBtn = document.getElementById('comment-close');

  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const mi = (s) => { const [y, m] = String(s).split('-').map(Number); return y * 12 + (m - 1); };
  const NOW = mi(CV.now);
  const M0 = mi(CV.monthsFrom);
  const yOf = (m) => Math.floor(m / 12);
  const mOf = (m) => ((m % 12) + 12) % 12;

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ext = (h) => /^https?:/.test(h) ? ' target="_blank" rel="noopener noreferrer"' : '';

  // ---------- Data ----------
  const byId = new Map();
  CV.sections.forEach((sec) => sec.items.forEach((item) => byId.set(item.id, { item, sec })));
  const isInternal = (item) => item.kind === 'internal';

  // Month range of an entry: { from, to, open, approx }. Month data when it
  // exists; otherwise whole years ("approx", drawn dashed in month zoom).
  function rangeOf(item) {
    if (item.start) {
      const from = mi(item.start);
      const open = item.end === 'now';
      const to = open ? NOW : item.end ? mi(item.end) : from;
      return { from, to: Math.max(from, to), open, approx: false };
    }
    const txt = String(item.years || '');
    const m = txt.match(/(\d{4})\s*[–-]\s*(\d{4}|now)/i);
    let fy = item.year, ty = item.year, open = /ongoing/i.test(txt);
    if (m) { fy = Number(m[1]); open = /now/i.test(m[2]); ty = open ? yOf(NOW) : Number(m[2]); }
    const from = fy * 12;
    const to = open ? NOW : Math.min(NOW, ty * 12 + 11);
    return { from, to, open, approx: true };
  }

  // "mar 2026", "jun–oct 2026", "oct 2026–now", or the years text.
  function whenOf(item) {
    if (!item.start) return item.years || String(item.year);
    const r = rangeOf(item);
    const a = `${MONTHS[mOf(r.from)]}`, ay = yOf(r.from);
    if (r.open) return `${a} ${ay}–now`;
    if (r.to === r.from) return `${a} ${ay}`;
    const b = MONTHS[mOf(r.to)], by = yOf(r.to);
    return ay === by ? `${a}–${b} ${ay}` : `${a} ${ay}–${b} ${by}`;
  }
  // Short label for the phone cell and the "earlier" column: "21–23", "24–now".
  function shortOf(item) {
    const r = rangeOf(item);
    const a = String(yOf(r.from)).slice(2);
    if (r.open) return `${a}–now`;
    const b = String(yOf(r.to)).slice(2);
    return a === b ? (item.start ? `${MONTHS[mOf(r.from)]} ${a}` : a) : `${a}–${b}`;
  }

  // Groups for a tab: [{ label, color, items, table }].
  function groupsFor(tab) {
    if (tab.all) return CV.sections.map((s) => ({ label: s.name, color: s.color, items: s.items }));
    return tab.groups.map((g) => {
      const sec = g.section && CV.sections.find((s) => s.name === g.section);
      let items;
      if (g.featured) items = CV.sections.flatMap((s) => s.items.filter((i) => i.featured));
      else if (g.ids) items = g.ids.map((id) => byId.get(id)).filter(Boolean).map((x) => x.item);
      else items = sec ? sec.items.slice() : [];
      if (g.kind === 'client') items = items.filter((i) => !isInternal(i));
      if (g.kind === 'internal') items = items.filter(isInternal);
      return { label: g.label || (sec && sec.name) || '', color: g.color || (sec && sec.color) || '#ccc', items };
    }).filter((g) => g.items.length);
  }
  const tabById = (id) => CV.tabs.find((t) => t.id === id);
  const tabHas = (tab, id) => groupsFor(tab).some((g) => g.items.some((i) => i.id === id));

  // ---------- State + hash ----------
  const state = { tab: null, zoom: null, item: null };
  const defaultZoom = (tab) => tab.zoom || 'years';
  function hashFor(tabId, itemId, zoom) {
    const tab = tabById(tabId);
    let h = '#' + tabId + (itemId ? '/' + itemId : '');
    if (zoom && zoom !== defaultZoom(tab)) h += '&zoom=' + zoom;
    return h;
  }
  function parse() {
    const raw = decodeURIComponent(location.hash.slice(1));
    const [path, ...rest] = raw.split('&');
    const params = Object.fromEntries(rest.map((p) => p.split('=')));
    let [a, b] = (path || '').split('/');
    let tab = tabById(a), item = null;
    if (tab) item = b && byId.has(b) ? b : null;
    else if (a && byId.has(a)) {
      item = a;
      const cur = state.tab && tabById(state.tab);
      tab = (cur && tabHas(cur, a) && cur) || CV.tabs.find((t) => !t.all && tabHas(t, a)) || tabById('everything');
    }
    tab = tab || CV.tabs[0];
    const zoom = params.zoom === 'months' || params.zoom === 'years' ? params.zoom : defaultZoom(tab);
    return { tab: tab.id, zoom, item };
  }

  // ---------- Header: title, nav, zoom, tabs (not part of the grid) ----------
  const tabLinks = [];
  const zoomLinks = {};
  function buildTop() {
    const r1 = el('div', 'trow head');
    r1.append(el('div', 'cell gutter'), el('h1', 'cell title', esc(CV.title)), el('div', 'cell fill'));
    CV.nav.forEach(([label, href]) => r1.append(el('div', 'cell nav', `<a href="${esc(href)}"${ext(href)}>${esc(label)}</a>`)));

    const r2 = el('div', 'trow sub');
    r2.append(el('div', 'cell gutter'), el('div', 'cell title', `<em>${esc(CV.subtitle)}</em>`), el('div', 'cell fill'));
    const z = el('div', 'cell zoom');
    z.append(el('span', 'zoom-label', 'zoom'));
    ['years', 'months'].forEach((k, i) => {
      if (i) z.append(el('span', 'zoom-sep', '|'));
      const a = el('a', '', k);
      a.dataset.zoom = k;
      zoomLinks[k] = a;
      z.append(a);
    });
    r2.append(z);
    if (CV.note) r2.append(el('div', 'cell note', `<em>${esc(CV.note)}</em>`));

    const r3 = el('nav', 'trow tabs');
    r3.setAttribute('aria-label', 'CV sections');
    r3.append(el('div', 'cell gutter'));
    CV.tabs.forEach((t) => {
      const a = el('a', 'cell tab', esc(t.label));
      a.href = '#' + t.id;
      a.dataset.tab = t.id;
      tabLinks.push(a);
      r3.append(a);
    });
    r3.append(el('div', 'cell fill'));
    top.append(r1, r2, r3);
  }

  // ---------- Sheet ----------
  let flat = [];

  // Timeline columns for the items in view: [{ lo, hi, label, cls }].
  function columnsFor(items, zoom) {
    const rs = items.map(rangeOf);
    const maxT = Math.max(...rs.map((r) => r.to));
    const minF = Math.min(...rs.map((r) => r.from));
    const cols = [];
    if (zoom === 'years') {
      for (let y = yOf(maxT); y >= yOf(minF); y--) cols.push({ lo: y * 12, hi: y * 12 + 11, label: String(y), year: y });
    } else {
      for (let m = maxT; m >= Math.max(minF, M0); m--) {
        cols.push({ lo: m, hi: m, label: MONTHS[mOf(m)], year: yOf(m), cls: mOf(m) === 11 && m !== maxT ? 'ynew' : '' });
      }
      if (minF < M0) cols.push({ lo: -Infinity, hi: M0 - 1, label: 'earlier', cls: 'earlier' });
    }
    return cols;
  }

  const TABLE_COLS = [
    ['name', 'client'], ['what', 'what it was'], ['studio', 'studio'], ['type', 'type'],
    ['sub', 'my role'], ['when', 'when'], ['status', 'status'], ['see', 'see it'],
  ];
  const SHEET_COLS = [['name', ''], ['sub', 'role']];

  function render() {
    const tab = tabById(state.tab);
    const table = !!tab.table;
    const zoom = state.zoom;
    const groups = groupsFor(tab);
    const all = groups.flatMap((g) => g.items);
    const cols = columnsFor(all, zoom);
    const textCols = table ? TABLE_COLS : SHEET_COLS;

    // Timeline template; the text columns live in CSS (they change on phones).
    const tlMin = zoom === 'years' ? cols.length * 3.25
      : cols.reduce((a, c) => a + (c.cls === 'earlier' ? 4.25 : table ? 2.25 : 2.5), 0);
    const tl = zoom === 'years'
      ? `repeat(${cols.length}, minmax(3.25rem, 1fr))`
      : cols.map((c) => (c.cls === 'earlier' ? '4.25rem' : 'var(--month)')).join(' ');
    sheet.style.setProperty('--tl', tl);
    sheet.style.setProperty('--tlmin', tlMin + 'rem');
    sheet.className = `sheet z-${zoom}${table ? ' is-table' : ''}`;
    document.body.dataset.tab = tab.id;
    document.body.dataset.zoom = zoom;

    // Row builder: gutter + text cells + timeline cells + tail + phone cell.
    function row({ cls = '', num = '', texts = [], swatch } = {}) {
      const r = el('div', 'row ' + cls);
      const g = el('div', 'cell gutter', esc(num));
      if (swatch) g.style.background = swatch;
      r.append(g);
      textCols.forEach(([key, label], i) => {
        const c = el('div', `cell t t-${key}`, texts[i] == null ? '' : texts[i]);
        if (label) c.dataset.label = label;
        r.append(c);
      });
      cols.forEach((col) => r.append(el('div', 'cell yr' + (col.cls ? ' ' + col.cls : ''))));
      r.append(el('div', 'cell tail'));
      return r;
    }

    const frag = document.createDocumentFragment();

    // Column labels. Month zoom gets a year row above the month row.
    if (zoom === 'months') {
      const yr = row({ cls: 'colhead yearrow' });
      const yc = yr.querySelectorAll('.yr');
      let lastY = null;
      cols.forEach((c, i) => {
        if (c.cls === 'earlier') return;
        if (c.year !== lastY) { yc[i].textContent = String(c.year); yc[i].classList.add('ylabel'); lastY = c.year; }
      });
      frag.append(yr);
    }
    const head = row({ cls: 'colhead', texts: textCols.map(([, l]) => esc(l)) });
    head.querySelectorAll('.yr').forEach((c, i) => (c.textContent = cols[i].label));
    frag.append(head);

    flat = [];
    let n = 0;
    groups.forEach((g) => {
      frag.append(row({ cls: 'section', swatch: g.color, texts: [`<em>${esc(g.label)}</em>`] }));
      g.items.forEach((item) => {
        n += 1;
        const href = hashFor(tab.id, item.id, zoom);
        const see = item.see
          ? esc(item.see)
          : item.site ? `<a class="ext" href="${esc(item.site[1])}"${ext(item.site[1])}>${esc(item.site[0])} ↗</a>`
          : '<span class="muted">walkthrough on request</span>';
        const vals = {
          name: `<a class="open" href="${href}">${esc(item.title)}</a>`,
          sub: esc(item.sub), what: esc(item.what), studio: esc(item.studio), type: esc(item.type),
          when: esc(whenOf(item)), status: esc(item.status), see,
        };
        const r = row({ cls: 'entry', num: n, texts: textCols.map(([k]) => vals[k]) });
        r.dataset.id = item.id;
        r.dataset.href = href;
        const sc = r.querySelector('.t-studio');
        if (sc && item.studio) sc.classList.add('studio-' + item.studio);

        // Timeline: overlap of the entry's months with each column.
        const rg = rangeOf(item);
        const yc = r.querySelectorAll('.yr');
        const hit = cols.map((c) => rg.from <= c.hi && rg.to >= c.lo);
        const L = hit.indexOf(true), R = hit.lastIndexOf(true);
        if (L >= 0) {
          r.style.setProperty('--tint', g.color);
          if (rg.approx && zoom === 'months') r.classList.add('approx');
          for (let i = L; i < R; i++) {
            yc[i].classList.add('span');
            if (i === L) yc[i].classList.add(rg.open ? 'span-open' : 'span-end');
          }
          const s = yc[R];
          s.classList.add('start');
          if (L === R && rg.open) s.classList.add('start-open');
          if (item.img) {
            s.classList.add('has-thumb');
            const img = el('img');
            img.src = item.img; img.alt = ''; img.loading = 'lazy';
            s.append(img);
          } else {
            s.append(el('i', 'cap'));
            if (cols[R].cls === 'earlier') s.append(el('span', 'lbl', esc(shortOf(item))));
            else if (item.site && !table) {
              s.insertAdjacentHTML('beforeend', `<a class="ext" href="${esc(item.site[1])}"${ext(item.site[1])}>${esc(item.site[0])} ↗</a>`);
            }
          }
        }
        // Phone-only cell (year zoom): when, plus the link if there is one.
        const m = el('div', 'cell m-when', esc(shortOf(item)));
        r.append(m);
        frag.append(r);
        flat.push({ item, color: g.color, rowEl: r });
      });
      frag.append(row({ cls: 'blank' }));
    });
    for (let i = 0; i < (table ? 4 : 18); i++) frag.append(row({ cls: 'blank' }));
    sheet.replaceChildren(frag);

    // Intro (moment tab): merged cells above the sheet.
    intro.replaceChildren();
    intro.hidden = !tab.intro;
    (tab.intro || []).forEach((p) => {
      const r = el('div', 'trow para');
      r.append(el('div', 'cell gutter'), el('p', 'cell', esc(p)));
      intro.append(r);
    });

    tabLinks.forEach((a) => {
      const on = a.dataset.tab === tab.id;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    Object.entries(zoomLinks).forEach(([k, a]) => {
      a.href = hashFor(tab.id, null, k);
      a.classList.toggle('on', k === zoom);
      if (k === zoom) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    wrap.scrollLeft = 0;
  }

  // Row click anywhere (but on a real link) opens the entry.
  sheet.addEventListener('click', (e) => {
    if (e.target.closest('a.ext')) return;
    const r = e.target.closest('.row.entry');
    if (!r) return;
    if (e.target.closest('a.open')) return; // the link handles it
    location.hash = r.dataset.href;
  });

  // ---------- Viewer ----------
  let current = -1;
  let lastFocus = null;

  function open(id, { focus = true } = {}) {
    const idx = flat.findIndex((f) => f.item.id === id);
    if (idx < 0) return close();
    const { item } = flat[idx];
    if (current < 0) lastFocus = document.activeElement;
    flat.forEach((f, i) => f.rowEl.classList.toggle('is-open', i === idx));
    current = idx;

    if (item.img) {
      const img = el('img');
      img.src = item.img; img.alt = item.title;
      media.replaceChildren(img);
      media.hidden = false;
    } else {
      media.replaceChildren();
      media.hidden = true;
    }
    const links = (item.links || []).map(([l, h]) => `<a href="${esc(h)}"${ext(h)}>${esc(l)}</a>`);
    const facts = item.studio
      ? `<p class="c-facts">${esc(item.studio)} · ${esc(item.type)}<br>${esc(item.status)}${item.see ? '<br>' + esc(item.see) : !item.site ? '<br>walkthrough on request' : ''}</p>`
      : '';
    commentBody.innerHTML = `
      <h2 id="comment-title">${esc(item.title)}</h2>
      <p class="c-sub"><em>${esc(item.sub)}</em><br>${esc(whenOf(item))}</p>
      ${facts}
      ${(item.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}
      ${item.stack ? `<p class="c-stack">${esc(item.stack)}</p>` : ''}
      ${links.length ? `<p class="c-links">${links.join('<br>')}</p>` : ''}
      <p class="c-nav"><button type="button" data-step="-1">&larr; prev</button><button type="button" data-step="1">next &rarr;</button></p>`;
    viewer.hidden = false;
    document.body.classList.add('viewing');
    document.body.classList.toggle('viewing-media', !!item.img);
    if (focus) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (current < 0) return;
    flat.forEach((f) => f.rowEl.classList.remove('is-open'));
    current = -1;
    viewer.hidden = true;
    document.body.classList.remove('viewing', 'viewing-media');
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  function closeAndClean() {
    history.replaceState(null, '', hashFor(state.tab, null, state.zoom));
    state.item = null;
    close();
  }

  function step(d) {
    if (current < 0) return;
    const next = flat[(current + d + flat.length) % flat.length];
    location.hash = hashFor(state.tab, next.item.id, state.zoom);
  }

  function route() {
    if (location.hash === '#print') {
      history.replaceState(null, '', hashFor(state.tab || CV.tabs[0].id, null, state.zoom));
      window.print();
      return;
    }
    const next = parse();
    const changed = next.tab !== state.tab || next.zoom !== state.zoom;
    Object.assign(state, next);
    if (changed) { current = -1; render(); }
    if (state.item) open(state.item, { focus: !changed });
    else close();
  }

  window.addEventListener('hashchange', route);
  closeBtn.addEventListener('click', closeAndClean);
  commentBody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (b) step(Number(b.dataset.step));
  });
  media.addEventListener('click', closeAndClean);
  document.addEventListener('keydown', (e) => {
    if (current < 0) return;
    if (e.key === 'Escape') closeAndClean();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  // ---------- Print version: a plain CV with everything ----------
  const pr = document.getElementById('print-cv');
  pr.innerHTML = `<h1>${esc(CV.title)}</h1><p>${esc(CV.subtitle)}</p>` +
    CV.sections.map((s) => `<section><h2>${esc(s.name)}</h2>` +
      s.items.map((i) => {
        const extra = i.studio ? `<br>${esc(i.what)}. ${esc(i.studio)}, ${esc(i.type)}, ${esc(i.status)}.` : `<br>${esc((i.body || [])[0] || '')}`;
        return `<div class="p-item"><span class="p-years">${esc(whenOf(i))}</span><div><strong>${esc(i.title)}</strong>, ${esc(i.sub)}${extra}</div></div>`;
      }).join('') +
      `</section>`).join('');

  buildTop();
  route();
})();

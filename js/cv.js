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

  // Dates as text, always earliest → latest: "jun → oct 2026",
  // "2021 → 2023", "oct 2026 → now", "mar 2026".
  function whenOf(item) {
    if (!item.start) {
      const t = String(item.years || item.year);
      return t.replace(/\s*[–-]\s*/, ' → ');
    }
    const r = rangeOf(item);
    const a = MONTHS[mOf(r.from)], ay = yOf(r.from);
    if (r.open) return `${a} ${ay} → now`;
    if (r.to === r.from) return `${a} ${ay}`;
    const b = MONTHS[mOf(r.to)], by = yOf(r.to);
    return ay === by ? `${a} → ${b} ${ay}` : `${a} ${ay} → ${b} ${by}`;
  }
  // Short label for the "earlier" column: "21–23", "24–now".
  function shortOf(item) {
    const r = rangeOf(item);
    const a = String(yOf(r.from)).slice(2);
    if (r.open) return `${a}–now`;
    const b = String(yOf(r.to)).slice(2);
    return a === b ? (item.start ? `${MONTHS[mOf(r.from)]} ${a}` : a) : `${a}–${b}`;
  }
  // Label printed in a bar (option c): "jun–oct", "oct–now", "2021–23".
  function barLabel(item) {
    const r = rangeOf(item);
    if (!item.start) {
      if (/ongoing/i.test(item.years || '')) return 'ongoing';
      const a = yOf(r.from);
      if (r.open) return `${a}–now`;
      const b = yOf(r.to);
      return a === b ? String(a) : `${a}–${String(b).slice(2)}`;
    }
    const a = MONTHS[mOf(r.from)], ay = yOf(r.from);
    if (r.open) return `${a}–now`;
    if (r.to === r.from) return a;
    const b = MONTHS[mOf(r.to)], by = yOf(r.to);
    return ay === by ? `${a}–${b}` : `${a} ${String(ay).slice(2)}–${b} ${String(by).slice(2)}`;
  }
  // "5 mo", "2 yrs". Blank for one-off years and "ongoing".
  function lengthOf(item) {
    const r = rangeOf(item);
    if (!item.start) {
      if (/ongoing/i.test(item.years || '')) return '';
      const n = yOf(r.to) - yOf(r.from);
      return n < 1 ? '' : n === 1 ? '1 yr' : `${n} yrs`;
    }
    const n = r.to - r.from + 1;
    if (n < 12) return `${n} mo`;
    const y = Math.round(n / 12);
    return y === 1 ? '1 yr' : `${y} yrs`;
  }

  // Inline brand links: [oratory] / [moment] tokens in the data, keeping
  // whatever case the data wrote them in (the sheet lowercases it all).
  const BRANDS = { oratory: 'https://oratory.co', moment: 'https://moment.so' };
  const TOKEN = /\[(oratory|moment)\]/gi;
  const brandLink = (w) => `<a class="ext brand" href="${BRANDS[w.toLowerCase()]}" target="_blank" rel="noopener noreferrer">${esc(w)}</a>`;
  const rich = (s) => esc(s).replace(TOKEN, (_, w) => brandLink(w));
  const plain = (s) => String(s == null ? '' : s).replace(TOKEN, '$1');
  // A row's name: the first part opens the entry; any later brand token
  // is its own link ("MOMENT (formerly Oratory)").
  function nameHtml(title, href) {
    return `<a class="open" href="${href}">${esc(plain(title))}</a>`;
  }
  // "early phase: i set up kickoff…" → tag "early phase" + note.
  function statusHtml(s) {
    const t = String(s || '');
    const m = t.match(/^([^:(]+?)\s*(?::\s*|\()(.*?)\)?$/);
    const tag = (m ? m[1] : t).trim();
    const note = m ? m[2].trim() : '';
    const k = /^live/.test(tag) ? 'live' : /soon/.test(tag) ? 'soon' : 'other';
    return `<span class="st st-${k}">${esc(tag)}</span>${note ? `<span class="st-note">${esc(note)}</span>` : ''}`;
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
  // Timeline style is fixed to filled cells ("a"; Griffin picked it 11/23).
  // The b/c branches below are unreachable and can be deleted later.
  const DEFAULT_TL = 'a';
  const state = { tab: null, zoom: null, tl: DEFAULT_TL, item: null };
  const defaultZoom = (tab) => tab.zoom || 'months';
  function hashFor(tabId, itemId, zoom, tl = state.tl) {
    const tab = tabById(tabId);
    let h = '#' + tabId + (itemId ? '/' + itemId : '');
    if (zoom && zoom !== defaultZoom(tab)) h += '&zoom=' + zoom;
    if (tl && tl !== DEFAULT_TL) h += '&tl=' + tl;
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
    const tl = DEFAULT_TL;
    return { tab: tab.id, zoom, tl, item };
  }

  // Reading list for an entry (e.g. the reading group), grouped by year, newest first.
  const MON = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  function booksHtml(item) {
    if (!item.books || !item.books.length) return '';
    const groups = [];
    item.books.forEach((b) => {
      const y = b.d === 'now' ? 'reading now' : b.d.slice(0, 4);
      let g = groups.find((x) => x.y === y);
      if (!g) groups.push((g = { y, list: [] }));
      g.list.push(b);
    });
    return `<div class="c-books"><p class="c-books-head">what we've read <span>(${item.books.length})</span></p>` +
      groups.map((g) => `<p class="c-books-year">${esc(g.y)}</p><ul>` +
        g.list.map((b) => `<li><em>${esc(b.t)}</em>, ${esc(b.a)}${b.d !== 'now' ? ` <span>${MON[+b.d.slice(5, 7) - 1]}</span>` : ''}</li>`).join('') +
        '</ul>').join('') + '</div>';
  }

  // ---------- Hats: "likely fit for" titles with a hover card of fitting work ----------
  const hatsHtml = () => (CV.hats || []).map((h, i) =>
    `<span class="hat" tabindex="0" data-hat="${i}">${esc(h.label)}</span>`).join('<span class="hat-sep"> · </span>');
  const hatPop = el('div', 'hat-pop');
  hatPop.hidden = true;
  document.body.append(hatPop);
  let hatTimer = null, hatOn = null;
  function showHat(span) {
    clearTimeout(hatTimer);
    const h = CV.hats[+span.dataset.hat];
    if (!h) return;
    hatOn = span;
    const items = h.ids.map((id) => byId.get(id) && byId.get(id).item).filter(Boolean);
    hatPop.innerHTML = `<p class="hp-title">${esc(h.label)}</p><p class="hp-blurb">${esc(h.blurb)}</p><ul>` +
      items.map((it) => `<li><a href="#${esc(it.id)}">${esc(plain(it.title))}</a> <span>${esc(plain(it.sub || ''))}</span></li>`).join('') + '</ul>';
    hatPop.hidden = false;
    const r = span.getBoundingClientRect();
    const w = hatPop.offsetWidth;
    hatPop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
    const cellBottom = (span.closest('.cell') || span).getBoundingClientRect().bottom;
    hatPop.style.top = (cellBottom - 1) + 'px';
  }
  function hideHatSoon() {
    clearTimeout(hatTimer);
    hatTimer = setTimeout(() => { hatPop.hidden = true; hatOn = null; }, 160);
  }
  document.addEventListener('mouseover', (e) => {
    const span = e.target.closest && e.target.closest('.hat');
    if (span) showHat(span);
    else if (e.target.closest && e.target.closest('.hat-pop')) clearTimeout(hatTimer);
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest && (e.target.closest('.hat') || e.target.closest('.hat-pop'))) hideHatSoon();
  });
  document.addEventListener('focusin', (e) => { if (e.target.classList && e.target.classList.contains('hat')) showHat(e.target); });
  document.addEventListener('focusout', (e) => { if (e.target.classList && e.target.classList.contains('hat')) hideHatSoon(); });
  // Touch: tap a title to toggle its card; tap a work item to open it.
  document.addEventListener('click', (e) => {
    const span = e.target.closest('.hat');
    if (span) { if (hatOn === span && !hatPop.hidden) { hatPop.hidden = true; hatOn = null; } else showHat(span); return; }
    if (e.target.closest('.hat-pop a')) { hatPop.hidden = true; hatOn = null; return; }
    if (!e.target.closest('.hat-pop')) { hatPop.hidden = true; hatOn = null; }
  });
  window.addEventListener('scroll', () => { if (!hatPop.hidden) { hatPop.hidden = true; hatOn = null; } }, true);

  // ---------- Header: title, nav, zoom, timeline switch, tabs ----------
  const tabLinks = [];
  const zoomLinks = {};
  const tlLinks = {};
  function switcher(cls, label, keys, store, attr) {
    const z = el('div', 'cell sw ' + cls);
    z.append(el('span', 'sw-label', label));
    keys.forEach((k, i) => {
      if (i) z.append(el('span', 'sw-sep', '|'));
      const a = el('a', '', k);
      a.dataset[attr] = k;
      store[k] = a;
      z.append(a);
    });
    return z;
  }
  function buildTop() {
    // Upper header = three side-by-side columns so the bio can be one merged
    // cell spanning every row: [photo + name/subtitle/facts] [bio] [nav/zoom].
    const row = (cls, ...cells) => { const r = el('div', 'trow ' + cls); r.append(...cells); return r; };
    const corner = el('div', 'cell gutter corner',
      CV.portrait ? `<span class="portrait"><img src="${esc(CV.portrait)}" alt="griffin duffey, scanned photo and signature"></span>` : '');
    const facts = CV.facts || [];

    const colA = el('div', 'top-col a');
    colA.append(
      row('head', corner, el('h1', 'cell title', esc(CV.title))),
      row('sub', el('div', 'cell gutter'), el('div', 'cell title', `<em>${esc(CV.subtitle)}</em>`)),
      ...facts.map(([label, value]) => row('fact', el('div', 'cell gutter'),
        el('div', 'cell title', `<span class="fact-text"><span class="fact-label">${esc(label)}</span> ${value === '@hats' ? hatsHtml() : rich(value)}</span>`))),
    );

    const colC = el('div', 'top-col c');
    const navRow = row('head');
    CV.nav.forEach(([label, href]) => navRow.append(el('div', 'cell nav', `<a href="${esc(href)}"${ext(href)}>${esc(label)}</a>`)));
    const subRow = row('sub', switcher('zoom', 'zoom', ['years', 'months'], zoomLinks, 'zoom'));
    if (CV.note) subRow.append(el('div', 'cell note', `<em>${esc(CV.note)}</em>`));
    // One stretchy blank cell fills the rest of the column next to the fact rows.
    colC.append(navRow, subRow, row('rest', el('div', 'cell fill')));

    const upper = el('div', 'top-upper');
    upper.append(colA);
    if (CV.bio && CV.bio.length) upper.append(el('div', 'cell bio', CV.bio.map((p) => `<p>${rich(p)}</p>`).join('')));
    upper.append(colC);

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
    top.append(upper, r3);
    // Size the photo to the header's real height (rows can wrap), so it always
    // runs from the top edge down through the tabs.
    const fit = () => {
      const pp = parseFloat(getComputedStyle(top).getPropertyValue('--pp')) * 16 || 6;
      const h = upper.offsetHeight + r3.offsetHeight;
      if (window.innerWidth > 720 && h) top.style.setProperty('--pw', ((h - 2 * pp) / 1.47) + 'px');
      else top.style.removeProperty('--pw');
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(upper);
    if (document.fonts) document.fonts.ready.then(fit);
  }

  // ---------- Sheet ----------
  let flat = [];
  let bars = [];

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

  function textColsFor(table, tl) {
    if (table) {
      return [
        ['client', 'client'], ['st', 'studio · type'], ['sub', 'my role'], ['when', 'when'],
        ...(tl === 'b' ? [['len', 'length']] : []),
        ['status', 'status'], ['see', 'see it'],
      ];
    }
    if (tl === 'a') return [['name', ''], ['sub', 'role'], ['when', 'when']];
    if (tl === 'b') return [['name', ''], ['sub', 'role'], ['when', 'when'], ['len', 'length']];
    return [['name', ''], ['sub', 'role']];
  }

  function render() {
    const tab = tabById(state.tab);
    const table = !!tab.table;
    const tl = state.tl;
    const zoom = state.zoom;
    const groups = groupsFor(tab);
    const all = groups.flatMap((g) => g.items);
    const cols = tl === 'b' ? [] : columnsFor(all, zoom);
    const textCols = textColsFor(table, tl);

    // Timeline template; the text columns live in CSS (they change on phones).
    const tlMin = !cols.length ? 0 : zoom === 'years' ? cols.length * 3.25
      : cols.reduce((a, c) => a + (c.cls === 'earlier' ? 4.25 : table ? 2.25 : 2.5), 0);
    const tlTpl = !cols.length ? '' : zoom === 'years'
      ? `repeat(${cols.length}, minmax(3.25rem, 1fr))`
      : cols.map((c) => (c.cls === 'earlier' ? '4.25rem' : 'var(--month)')).join(' ');
    sheet.style.setProperty('--tl', tlTpl);
    sheet.style.setProperty('--tlmin', tlMin + 'rem');
    sheet.className = `sheet z-${zoom} tl-${tl}${table ? ' is-table' : ''}`;
    document.body.dataset.tab = tab.id;
    document.body.dataset.zoom = zoom;
    document.body.dataset.tl = tl;

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
    if (zoom === 'months' && cols.length) {
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
    bars = [];
    let n = 0;
    groups.forEach((g) => {
      frag.append(row({ cls: 'section', swatch: g.color, texts: [`<em>${esc(g.label)}</em>`] }));
      g.items.forEach((item) => {
        n += 1;
        const href = hashFor(tab.id, item.id, zoom);
        // Cells are plain text; links live in the popup card.
        const see = item.see
          ? `<span class="muted">${esc(item.see)}</span>`
          : item.site ? `<span>${esc(item.site[0]).replace(/\./g, '<wbr>.')}</span>`
          : '<span class="muted">walkthrough on request</span>';
        const studio = item.studio ? esc(item.studio === 'moment' ? 'MOMENT' : 'Oratory') : '';
        const vals = {
          name: `<span class="nm">${nameHtml(item.title, href)}</span>`,
          client: `<span class="c-name">${nameHtml(item.title, href)}</span><span class="c-what">${esc(plain(item.what))}</span>`,
          st: `${studio}<span class="dot"> · </span><span class="ty">${esc(item.type)}</span>${item.stack ? `<span class="stk">${esc(item.stack)}</span>` : ''}`,
          sub: esc(plain(item.sub)) + (item.also ? `<span class="also">${esc(item.also)}</span>` : ''), when: esc(whenOf(item)), len: esc(lengthOf(item)),
          status: statusHtml(item.status), see,
        };
        const r = row({ cls: 'entry', num: n, texts: textCols.map(([k]) => vals[k]) });
        r.dataset.id = item.id;
        r.dataset.href = href;
        r.style.setProperty('--tint', g.color);

        const rg = rangeOf(item);
        const yc = r.querySelectorAll('.yr');
        if (cols.length && rg.approx && zoom === 'months') r.classList.add('approx');

        if (tl === 'a') {
          // Filled cells: full tint where the item covers the column,
          // lighter where it only covers part of it.
          cols.forEach((c, i) => {
            const lo = Math.max(rg.from, c.lo), hi = Math.min(rg.to, c.hi);
            if (lo > hi) return;
            let full;
            if (c.cls === 'earlier') full = true;
            else if (zoom === 'months') full = !rg.approx;
            else {
              const avail = Math.min(c.hi, NOW) - c.lo + 1;
              full = rg.approx || hi - lo + 1 >= avail;
            }
            yc[i].classList.add('fill', full ? 'fill-full' : 'fill-part');
            if (c.cls === 'earlier') yc[i].append(el('span', 'lbl', esc(shortOf(item))));
          });
        } else if (tl === 'c') {
          const L = cols.findIndex((c) => rg.from <= c.hi && rg.to >= c.lo);
          if (L >= 0) {
            const bar = el('div', 'bar');
            const lbl = el('span', 'bar-lbl', esc(barLabel(item)));
            bar.append(lbl);
            r.append(bar);
            // Single unit: one month (month data) or one year (year data).
            const single = item.start ? rg.from === rg.to : yOf(rg.from) === yOf(rg.to) && !rg.open;
            bars.push({ bar, lbl, row: r, cells: yc, rg, single });
          }
        }
        // Phone-only cell: the dates as text.
        r.append(el('div', 'cell m-when', esc(whenOf(item))));
        frag.append(r);
        flat.push({ item, color: g.color, rowEl: r });
      });
      frag.append(row({ cls: 'blank' }));
    });
    for (let i = 0; i < (table ? 4 : 14); i++) frag.append(row({ cls: 'blank' }));
    sheet.replaceChildren(frag);
    layoutBars();

    // Intro (moment tab): one paragraph in merged cells above the sheet.
    intro.replaceChildren();
    intro.hidden = !tab.intro;
    if (tab.intro) {
      const r = el('div', 'trow para');
      r.append(el('div', 'cell gutter'), el('p', 'cell', rich(tab.intro)));
      intro.append(r);
    }

    tabLinks.forEach((a) => {
      const on = a.dataset.tab === tab.id;
      a.href = hashFor(a.dataset.tab, null, null);
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    Object.entries(zoomLinks).forEach(([k, a]) => {
      a.href = hashFor(tab.id, null, k);
      a.classList.toggle('on', k === zoom);
      if (k === zoom) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    Object.entries(tlLinks).forEach(([k, a]) => {
      a.href = hashFor(tab.id, null, zoom, k);
      a.classList.toggle('on', k === tl);
      if (k === tl) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    wrap.scrollLeft = 0;
  }

  // Option c: place each bar over its columns. Year columns are split into
  // twelfths (newest month on the left) so a jun–oct bar sits inside 2026.
  function layoutBars() {
    if (!bars.length) return;
    const cols = columnsFor(flat.map((f) => f.item), state.zoom);
    const zoom = state.zoom;
    bars.forEach(({ bar, lbl, cells, rg, single }) => {
      if (!cells.length || !cells[0].offsetWidth) return;
      const edge = (m, side) => {
        const i = cols.findIndex((c) => m >= c.lo && m <= c.hi);
        const c = cols[i], cell = cells[i];
        const x = cell.offsetLeft, w = cell.offsetWidth;
        if (zoom === 'years' && c.cls !== 'earlier') {
          const k = c.hi - m;
          return x + (side === 'l' ? k : k + 1) * (w / 12);
        }
        return side === 'l' ? x : x + w;
      };
      const pad = 2;
      let left = edge(rg.to, 'l') + pad;
      let width = Math.max(edge(rg.from, 'r') - pad - left, 10);
      bar.classList.remove('out');
      bar.style.left = left + 'px';
      bar.style.width = width + 'px';
      const need = lbl.scrollWidth + 12;
      if (need > width) {
        if (single) bar.style.width = need + 'px';
        else bar.classList.add('out');
      }
    });
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => layoutBars()).observe(sheet);
  if (document.fonts) document.fonts.ready.then(layoutBars);

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
      ? `<p class="c-facts">${brandLink(item.studio === 'moment' ? 'MOMENT' : 'Oratory')} · ${esc(item.type)}<br>${esc(item.status)}${item.see ? '<br>' + esc(item.see) : !item.site ? '<br>walkthrough on request' : ''}</p>`
      : '';
    const siteLink = item.site && !(item.links || []).some(([, h]) => h === item.site[1])
      ? `<p class="c-site"><a href="${esc(item.site[1])}"${ext(item.site[1])}>${esc(item.site[0])} ↗</a></p>`
      : '';
    const len = lengthOf(item);
    commentBody.innerHTML = `
      <h2 id="comment-title">${rich(item.title)}</h2>
      <p class="c-sub"><em>${rich(item.sub)}</em>${item.also ? `<br><span class="c-also">${esc(item.also)}</span>` : ''}<br>${esc(whenOf(item))}${len ? ` <span class="c-len">· ${esc(len)}</span>` : ''}</p>
      ${facts}
      ${siteLink}
      ${(item.body || []).map((p) => `<p>${rich(p)}</p>`).join('')}
      ${booksHtml(item)}
      ${item.stack ? `<p class="c-stack">built with ${esc(item.stack)}</p>` : ''}
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
    const changed = next.tab !== state.tab || next.zoom !== state.zoom || next.tl !== state.tl;
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
  // A click anywhere outside the popup closes it. Rows and links are left
  // alone: a row opens its own entry, a link navigates.
  document.addEventListener('click', (e) => {
    if (current < 0 || viewer.hidden) return;
    if (e.target.closest('#viewer, .row.entry, a, button')) return;
    closeAndClean();
  });
  document.addEventListener('keydown', (e) => {
    if (current < 0) return;
    if (e.key === 'Escape') closeAndClean();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  // ---------- Print version: a plain CV with everything ----------
  const pr = document.getElementById('print-cv');
  pr.innerHTML = `<h1>${esc(CV.title)}</h1><p>${esc(CV.subtitle)}</p>` +
    (CV.bio || []).map((p) => `<p>${rich(p)}</p>`).join('') +
    (CV.facts || []).map(([l, v]) => `<p>${esc(l)} ${rich(v)}</p>`).join('') +
    CV.sections.map((s) => `<section><h2>${esc(s.name)}</h2>` +
      s.items.map((i) => {
        const extra = i.studio ? `<br>${esc(plain(i.what))}. ${esc(i.studio)}, ${esc(i.type)}${i.stack ? ` (${esc(i.stack)})` : ''}, ${esc(i.status)}.` : `<br>${esc(plain((i.body || [])[0] || ''))}`;
        return `<div class="p-item"><span class="p-years">${esc(whenOf(i))}</span><div><strong>${esc(plain(i.title))}</strong>, ${esc(plain(i.sub))}${i.also ? `, ${esc(i.also)}` : ''}${extra}</div></div>`;
      }).join('') +
      `</section>`).join('');

  buildTop();
  route();
})();

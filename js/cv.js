// Spreadsheet CV. Renders window.CV (js/cv-data.js) into a grid:
// row numbers in the gutter, one row per entry, a thumbnail in the
// column for its year. Clicking a row (or /cv#id) opens the image on the
// left and a cell-comment style panel on the right.
(function () {
  const CV = window.CV;
  const sheet = document.getElementById('sheet');
  const viewer = document.getElementById('viewer');
  const media = document.getElementById('viewer-media');
  const commentBody = document.getElementById('comment-body');
  const closeBtn = document.getElementById('comment-close');

  const years = [];
  for (let y = CV.firstYear; y <= CV.lastYear; y++) years.push(y);
  document.documentElement.style.setProperty('--year-cols', years.length);

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const placeholder = (item, color, big) => {
    const ph = el('div', big ? 'ph ph-big' : 'ph');
    ph.style.setProperty('--tint', color);
    if (big) ph.innerHTML = `<span>${esc(item.title)}</span><small>${esc(item.years)}</small>`;
    return ph;
  };
  const picture = (item, color, big) => {
    if (!item.img) return placeholder(item, color, big);
    const img = el('img');
    img.src = item.img;
    img.alt = big ? item.title : '';
    img.loading = 'lazy';
    return img;
  };

  // "2021–2023" or "2024–now" → { from, to, open }. Anything else → null,
  // and the item shows as a single thumbnail in its year column.
  const spanOf = (item) => {
    const m = String(item.years || '').match(/(\d{4})\s*[–-]\s*(\d{4}|now)/i);
    if (!m) return null;
    const from = Number(m[1]);
    const open = /now/i.test(m[2]);
    const to = open ? CV.lastYear : Number(m[2]);
    return to > from ? { from, to, open } : null;
  };
  // Short year label for the phone cell: "21–23", "24–", "26".
  const shortYears = (item, span) => span
    ? `${String(span.from).slice(2)}–${span.open ? '' : String(span.to).slice(2)}`
    : String(item.year).slice(2);

  // A row = gutter cell + name cell + one cell per year + a trailing cell.
  // Rows that aren't entries pass their own content in.
  function row({ num = '', name = '', cls = '', tag = 'div', href, swatch } = {}) {
    const r = el(tag, 'row ' + cls);
    if (href) r.href = href;
    const g = el('div', 'cell gutter', esc(num));
    if (swatch) g.style.background = swatch;
    r.append(g, el('div', 'cell name', name));
    years.forEach(() => r.append(el('div', 'cell yr')));
    r.append(el('div', 'cell tail'));
    return r;
  }

  // ---------- Header ----------
  const head1 = row({ cls: 'head', name: esc(CV.title) });
  const head2 = row({ cls: 'head sub', name: `<em>${esc(CV.subtitle)}</em>` });
  // Nav links sit one per cell starting at the 7th year column, like Beckmans.
  const navStart = Math.max(0, years.length - CV.nav.length - 1);
  const yr1 = head1.querySelectorAll('.yr');
  CV.nav.forEach(([label, href], i) => {
    const c = yr1[navStart + i];
    if (!c) return;
    c.classList.add('link');
    c.innerHTML = `<a href="${esc(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}</a>`;
  });
  const note = head2.querySelectorAll('.yr')[navStart];
  if (note && CV.note) { note.classList.add('note'); note.innerHTML = `<em>${esc(CV.note)}</em>`; }
  // On phones the nav gets its own row (CSS hides the year cells there).
  const navM = el('nav', 'row nav-m');
  navM.style.setProperty('--nav-n', CV.nav.length);
  CV.nav.forEach(([label, href]) => {
    const a = el('a', 'cell', esc(label));
    a.href = href;
    navM.append(a);
  });

  const yearsRow = row({ cls: 'years' });
  yearsRow.querySelectorAll('.yr').forEach((c, i) => (c.textContent = String(years[i]).slice(2)));
  yearsRow.querySelector('.yr').textContent = years[0];

  sheet.append(head1, head2, navM, row({ cls: 'blank' }), yearsRow);

  // ---------- Sections ----------
  const flat = [];
  let n = 0;
  CV.sections.forEach((sec) => {
    sheet.append(row({ cls: 'section', name: `<em>${esc(sec.name)}</em>`, swatch: sec.color }));
    sec.items.forEach((item) => {
      n += 1;
      const r = row({ tag: 'a', cls: 'entry', num: n, name: esc(item.title), href: '#' + item.id });
      r.dataset.id = item.id;
      r.setAttribute('aria-label', `${item.title}, ${item.years}`);
      const span = spanOf(item);
      const col = years.indexOf(span ? span.from : item.year);
      const yrCells = r.querySelectorAll('.yr');
      if (col >= 0) {
        yrCells[col].classList.add('has-thumb');
        yrCells[col].append(picture(item, sec.color, false));
      }
      // Timeline: a bar in the section color through the rest of the range.
      if (span) {
        r.style.setProperty('--tint', sec.color);
        for (let y = span.from + 1; y <= span.to; y++) {
          const c = yrCells[years.indexOf(y)];
          if (!c) continue;
          c.classList.add('span');
          if (y === span.to) c.classList.add(span.open ? 'span-open' : 'span-end');
        }
      }
      // Phone-only cell: year text + thumbnail, since year columns are hidden.
      const m = el('div', 'cell m-thumb');
      m.append(picture(item, sec.color, false));
      m.append(el('span', '', shortYears(item, span)));
      r.append(m);
      sheet.append(r);
      flat.push({ item, sec, num: n, rowEl: r });
    });
    sheet.append(row({ cls: 'blank' }));
  });

  // Blank rows so the grid runs off the bottom of the screen.
  for (let i = 0; i < 30; i++) sheet.append(row({ cls: 'blank' }));

  // ---------- Viewer ----------
  let current = -1;
  let lastFocus = null;

  function open(id, { focus = true } = {}) {
    const idx = flat.findIndex((f) => f.item.id === id);
    if (idx < 0) return close();
    const { item, sec } = flat[idx];
    if (current < 0) lastFocus = document.activeElement;
    flat.forEach((f, i) => f.rowEl.classList.toggle('is-open', i === idx));
    current = idx;

    media.replaceChildren(picture(item, sec.color, true));
    const links = (item.links || [])
      .map(([l, h]) => `<a href="${esc(h)}"${h.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(l)}</a>`)
      .join('<br>');
    commentBody.innerHTML = `
      <h2 id="comment-title">${esc(item.title)}</h2>
      <p class="c-sub"><em>${esc(item.sub)}</em><br>${esc(item.years)}</p>
      ${(item.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}
      ${item.stack ? `<p class="c-stack">${esc(item.stack)}</p>` : ''}
      ${links ? `<p class="c-links">${links}</p>` : ''}
      <p class="c-nav"><button type="button" data-step="-1">&larr; prev</button><button type="button" data-step="1">next &rarr;</button></p>`;
    viewer.hidden = false;
    document.body.classList.add('viewing');
    if (focus) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (current < 0) return;
    flat.forEach((f) => f.rowEl.classList.remove('is-open'));
    current = -1;
    viewer.hidden = true;
    document.body.classList.remove('viewing');
    if (location.hash) history.replaceState(null, '', location.pathname);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function step(d) {
    if (current < 0) return;
    const next = flat[(current + d + flat.length) % flat.length];
    location.hash = next.item.id;
  }

  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id === 'print') { history.replaceState(null, '', location.pathname); window.print(); return; }
    id ? open(id) : close();
  };
  window.addEventListener('hashchange', fromHash);
  closeBtn.addEventListener('click', close);
  commentBody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (b) step(Number(b.dataset.step));
  });
  media.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (current < 0) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  // ---------- Print version: a plain one-page CV ----------
  const pr = document.getElementById('print-cv');
  pr.innerHTML = `<h1>${esc(CV.title)}</h1><p>${esc(CV.subtitle)}</p>` +
    CV.sections.map((s) => `<section><h2>${esc(s.name)}</h2>` +
      s.items.map((i) => `<div class="p-item"><span class="p-years">${esc(i.years)}</span><div><strong>${esc(i.title)}</strong>, ${esc(i.sub)}<br>${esc((i.body || [])[0] || '')}</div></div>`).join('') +
      `</section>`).join('');

  if (location.hash) fromHash();
})();

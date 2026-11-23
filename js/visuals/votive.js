// Featured-work visuals: votive. Registers window.CVVisuals[name] = (el) => { ... }.
//
//  votive-brand   the V✦TIVE mark printed in two riso passes on cream stock,
//                 next to the half-gallon chai jug and two kombucha bottles.
//                 One stepped 8fps clock (nothing tweens: every frame is a new
//                 "print"), three ink runs per ~10s loop.
//  votive-system  the back office: wholesale checkout → Stripe (invoice on net
//                 terms, or card) → /api/webhook → the "Votive Orders" sheet,
//                 Shippo buying the UPS label, and invoice.paid flipping the
//                 row to PAID. Columns mirror scripts/orders-sheet.gs in
//                 votive-site. Cafe names and amounts are made up.
//
// Both draw on a fixed design canvas scaled to the stage, pause off-screen and
// in hidden tabs, and render one still frame for prefers-reduced-motion.
window.CVVisuals = window.CVVisuals || {};
(() => {
  const A = '/assets/visuals/votive/';
  const W = 540, H = 440;
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- shared scaffolding ----------
  function setup(el, kind) {
    if (el._vvDestroy) el._vvDestroy();
    el.classList.add('v-votive', 'v-votive-' + kind);
    el.innerHTML = '';
    const fit = document.createElement('div');
    fit.className = 'vv-fit';
    const cvs = document.createElement('div');
    cvs.className = 'vv-canvas';
    fit.append(cvs);
    el.append(fit);
    const size = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / W, h / H);
      cvs.style.transform = `translate(${(w - W * s) / 2}px, ${(h - H * s) / 2}px) scale(${s})`;
    };
    const ro = window.ResizeObserver ? new ResizeObserver(size) : null;
    if (ro) ro.observe(el); else window.addEventListener('resize', size);
    size();
    return { cvs, cleanup: [() => (ro ? ro.disconnect() : window.removeEventListener('resize', size))] };
  }

  // Runs onFrame(ms) while the stage is on screen and the tab is visible.
  // Time only advances while running, so a paused loop resumes where it was.
  function loop(el, onFrame, cleanup) {
    let visible = false, raf = 0, t = 0, last = 0;
    const tick = (now) => {
      raf = 0;
      if (!el.isConnected) return stop();
      if (last) t += Math.min(now - last, 100);
      last = now;
      onFrame(t);
      raf = requestAnimationFrame(tick);
    };
    const run = () => { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } };
    const halt = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const io = window.IntersectionObserver
      ? new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; visible ? run() : halt(); }, { rootMargin: '80px' })
      : null;
    if (io) io.observe(el); else { visible = true; run(); }
    const vis = () => (document.hidden ? halt() : run());
    document.addEventListener('visibilitychange', vis);
    function stop() {
      halt();
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', vis);
    }
    cleanup.push(stop);
    onFrame(0);
  }

  // Tiny DOM helpers that only write when a value actually changes.
  const cache = new WeakMap();
  function put(node, key, val) {
    let c = cache.get(node);
    if (!c) cache.set(node, (c = {}));
    if (c[key] === val) return;
    c[key] = val;
    if (key === 'text') node.textContent = val;
    else if (key === 'html') node.innerHTML = val;
    else if (key === 'class') node.className = val;
    else if (key[0] === '-') node.style.setProperty(key, val);
    else node.style[key] = val;
  }
  const h = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  // Deterministic per-frame noise so loops repeat exactly.
  const hash = (n) => { let x = (n * 374761393 + 668265263) >>> 0; x = ((x ^ (x >>> 13)) * 1274126177) >>> 0; return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
  // Paper texture, drawn once into a small canvas: sparse ink specks (fine)
  // or soft blotches of uneven coverage (coarse). Seeded, so it never changes.
  const texCache = {};
  function texture(kind) {
    if (texCache[kind]) return texCache[kind];
    const n = kind === 'fine' ? 220 : 64, c = document.createElement('canvas');
    c.width = c.height = n;
    const x = c.getContext('2d'), img = x.createImageData(n, n), d = img.data;
    for (let i = 0; i < n * n; i++) {
      const r = hash(i + (kind === 'fine' ? 11 : 977));
      if (kind === 'fine') { d[i * 4] = 60; d[i * 4 + 1] = 42; d[i * 4 + 2] = 26; d[i * 4 + 3] = r > 0.93 ? 50 + (r - 0.93) * 2000 : 0; }
      else { d[i * 4] = d[i * 4 + 1] = 250; d[i * 4 + 2] = 240; d[i * 4 + 3] = r * 120; }
    }
    x.putImageData(img, 0, 0);
    return (texCache[kind] = `url(${c.toDataURL()})`);
  }

  // ======================================================================
  // votive-brand
  // ======================================================================
  const RUNS = [
    { a: '#9F5841', b: '#FFB511', name: 'brick + sunflower', line: 'chai concentrate, spiced + fermented' },
    { a: '#3D5588', b: '#FF48B0', name: 'federal blue + fluorescent pink', line: 'single-origin tea kombucha' },
    { a: '#00838A', b: '#FF6C2F', name: 'teal + orange', line: 'poured in 15+ cafes across the southeast' },
  ];
  const RUN_STEPS = 27, STEPS = 80, FPS = 8;

  const JUG = `<svg class="vv-jug" viewBox="0 0 112 196" aria-hidden="true">
    <defs><clipPath id="vvJugClip"><path d="M30 16H60V26C60 34 70 40 90 46C104 50 108 58 108 70V184C108 191 103 196 96 196H16C9 196 4 191 4 184V70C4 54 14 44 24 38C28 35 30 30 30 26Z"/></clipPath></defs>
    <path d="M30 16H60V26C60 34 70 40 90 46C104 50 108 58 108 70V184C108 191 103 196 96 196H16C9 196 4 191 4 184V70C4 54 14 44 24 38C28 35 30 30 30 26Z" fill="#efe6d4"/>
    <g clip-path="url(#vvJugClip)"><rect class="vv-chai" x="0" y="58" width="112" height="140" fill="#8C4A2F"/>
      <rect x="10" y="62" width="7" height="122" fill="#fff" opacity=".18"/></g>
    <path d="M73 62C84 62 92 66 93 74V106C93 111 89 113 85 111L78 107C74 105 72 101 72 97Z" fill="#F2EADB" stroke="#1a1a1a" stroke-width="1.6"/>
    <path d="M30 16H60V26C60 34 70 40 90 46C104 50 108 58 108 70V184C108 191 103 196 96 196H16C9 196 4 191 4 184V70C4 54 14 44 24 38C28 35 30 30 30 26Z" fill="none" stroke="#1a1a1a" stroke-width="1.8"/>
    <rect x="28" y="2" width="34" height="15" rx="2.5" fill="#f7f3ea" stroke="#1a1a1a" stroke-width="1.6"/>
    <path d="M28 7H62M28 11H62" stroke="#1a1a1a" stroke-width=".7" opacity=".5"/>
    <rect x="13" y="114" width="70" height="68" fill="#F2EADB" stroke="#1a1a1a" stroke-width=".8"/>
    <path class="vv-flag" d="M17 120L33 120L30 130L36 130L22 150L24 136L17 136Z" fill="var(--a)"/>
    <image href="${A}logo-silhouette.svg" x="38" y="118" width="38" height="46"/>
    <text x="48" y="172" text-anchor="middle" class="vv-tiny">chai tea concentrate</text>
    <path d="M18 176H78" stroke="#1a1a1a" stroke-width=".5" opacity=".6"/>
  </svg>`;
  const bottle = (liquid, tea, i) => `<svg class="vv-bottle" viewBox="0 0 40 170" aria-hidden="true">
    <defs><clipPath id="vvB${i}"><path d="M15 6H25V40C25 52 36 58 36 72V162C36 166 33 170 29 170H11C7 170 4 166 4 162V72C4 58 15 52 15 40Z"/></clipPath></defs>
    <path d="M15 6H25V40C25 52 36 58 36 72V162C36 166 33 170 29 170H11C7 170 4 166 4 162V72C4 58 15 52 15 40Z" fill="#e9e2d2"/>
    <g clip-path="url(#vvB${i})"><rect x="0" y="48" width="40" height="124" fill="${liquid}"/>
      <rect x="8" y="58" width="3" height="104" fill="#fff" opacity=".28"/></g>
    <path d="M15 6H25V40C25 52 36 58 36 72V162C36 166 33 170 29 170H11C7 170 4 166 4 162V72C4 58 15 52 15 40Z" fill="none" stroke="#1a1a1a" stroke-width="1.6"/>
    <path d="M13 1H27V7H13Z" fill="var(--b)" stroke="#1a1a1a" stroke-width="1.4"/>
    <rect x="4" y="94" width="32" height="48" fill="#F2EADB" stroke="#1a1a1a" stroke-width=".8"/>
    <rect x="4" y="94" width="32" height="7" fill="var(--a)"/>
    <image href="${A}logo-silhouette.svg" x="11" y="104" width="18" height="22"/>
    <text x="20" y="134" text-anchor="middle" class="vv-tiny">${tea}</text>
    <text x="20" y="139.5" text-anchor="middle" class="vv-tiny vv-tinier">kombucha</text>
  </svg>`;

  window.CVVisuals['votive-brand'] = function (el) {
    const { cvs, cleanup } = setup(el, 'brand');
    cvs.innerHTML = `
      <div class="vv-top"><span class="vv-run">v✦tive · run 01/03</span><span class="vv-inkname"></span></div>
      <div class="vv-sun"></div>
      <div class="vv-logo" role="img" aria-label="Votive logo">
        <div class="vv-ink vv-sil"></div><div class="vv-ink vv-fil"></div>
        <svg class="vv-spark" viewBox="-10 -10 20 20" aria-hidden="true"><path d="M0 -10C.8 -2 2 -.8 10 0C2 .8 .8 2 0 10C-.8 2 -2 .8 -10 0C-2 -.8 -.8 -2 0 -10Z"/></svg>
      </div>
      <div class="vv-shelf">
        <div class="vv-prod vv-p0">${JUG}</div>
        <div class="vv-prod vv-p1">${bottle('#C98A2B', 'oolong', 1)}</div>
        <div class="vv-prod vv-p2">${bottle('#9DA33A', 'sencha', 2)}</div>
      </div>
      <div class="vv-ground"></div>
      <div class="vv-foot"><span class="vv-line"></span><span class="vv-place">greenville, sc</span></div>
      `;
    // Texture covers the whole stage, not just the design canvas.
    const g1 = h('div', 'vv-grain'), g2 = h('div', 'vv-wear');
    g1.style.backgroundImage = texture('fine');
    g2.style.backgroundImage = texture('coarse');
    el.append(g2, g1);
    const sun = cvs.querySelector('.vv-sun');
    const sil = cvs.querySelector('.vv-sil'), fil = cvs.querySelector('.vv-fil');
    const spark = cvs.querySelector('.vv-spark');
    const prods = [...cvs.querySelectorAll('.vv-prod')];
    const runEl = cvs.querySelector('.vv-run'), inkEl = cvs.querySelector('.vv-inkname'), lineEl = cvs.querySelector('.vv-line');

    let lastStep = -1;
    function draw(f) {
      const r = Math.min(2, Math.floor(f / RUN_STEPS)), k = f - r * RUN_STEPS, run = RUNS[r];
      put(cvs, '--a', run.a);
      put(cvs, '--b', run.b);
      put(runEl, 'text', `v✦tive · run 0${r + 1}/03`);
      put(inkEl, 'text', run.name);
      // Reprint: the sheet goes back through the press, inks land misregistered and settle.
      const settle = [[0, 0, 0], [16, -9, 0.4], [7, -4, 0.8], [3, -2, 1]][k] || null;
      const jx = Math.round((hash(f * 3 + 1) - 0.5) * 4), jy = Math.round((hash(f * 3 + 2) - 0.5) * 3);
      const fx = Math.round((hash(f * 5 + 7) - 0.5) * 2.4), fy = Math.round((hash(f * 5 + 9) - 0.5) * 2.4);
      const [sx, sy, op] = settle || [jx, jy, 1];
      put(sil, 'transform', `translate(${sx + 4}px, ${sy + 3}px)`);
      put(sil, 'opacity', String(k === 0 ? 0 : op));
      put(fil, 'transform', `translate(${settle ? -sx / 2 : fx}px, ${settle ? sy / 2 : fy}px)`);
      put(fil, 'opacity', String(k === 0 ? 0.15 : Math.min(1, op + 0.15)));
      // The second ink: a flat disc, printed in its own (looser) pass.
      put(sun, 'transform', `translate(${settle ? sx * 1.4 : Math.round((hash(f * 7 + 3) - 0.5) * 5)}px, ${settle ? -sy : Math.round((hash(f * 7 + 4) - 0.5) * 4)}px)`);
      put(sun, 'opacity', String(k === 0 ? 0 : settle ? op * 0.9 : 0.9));
      // Products hop once per run, one after another, on whole frames.
      prods.forEach((p, i) => {
        const d = k - (7 + i * 2);
        const y = d === 0 ? -9 : d === 1 ? -4 : d === 2 ? 1 : 0;
        const rot = d === 0 ? (i % 2 ? 3 : -3) : d === 1 ? (i % 2 ? -1 : 1) : 0;
        put(p, 'transform', `translate(0, ${y}px) rotate(${rot}deg)`);
      });
      // The star in the mark catches the light.
      const sp = [0.3, 0.85, 1.1, 0.7, 0.3][k - 15];
      put(spark, 'transform', sp ? `scale(${sp}) rotate(${(k - 15) * 12}deg)` : 'scale(0)');
      // Copy line types out like a label printer, two characters a frame.
      const n = Math.max(0, (k - 4) * 2);
      put(lineEl, 'text', run.line.slice(0, n));
      put(lineEl, 'class', 'vv-line' + (n < run.line.length && k > 3 ? ' typing' : ''));
    }

    if (reduce()) { el.classList.add('vv-still'); draw(RUN_STEPS - 4); return; }
    loop(el, (t) => {
      const f = Math.floor(t / (1000 / FPS)) % STEPS;
      if (f !== lastStep) { lastStep = f; draw(f); }
    }, cleanup);
    el._vvDestroy = () => { cleanup.forEach((fn) => fn()); el._vvDestroy = null; };
  };

  // ======================================================================
  // votive-system
  // ======================================================================
  // Orders tab columns (scripts/orders-sheet.gs ORDER_HEADERS), the ones that
  // fit: Fulfilled, Date, Type, Name, Items, Total, Payment, Label. Email,
  // Phone, Address, Order ID, Notes and Tracking are left off for width.
  const COLS = [
    ['', 18], ['Date', 66], ['Type', 84], ['Name', 76], ['Items', 82], ['Total', 50], ['Payment', 54], ['Label', 66],
  ];
  const GUT = 20, ROW = 27, HEAD = 17;
  const colX = []; COLS.reduce((x, c, i) => ((colX[i] = x), x + c[1]), GUT);

  const OLD = [
    { done: true, date: 'Fri 11/20 10:41 AM', type: 'Wholesale ship', name: 'Pine & Pour', items: '9× Half Gallon Chai', total: '$164.20', pay: 'PAID', label: true },
    { done: true, date: 'Sat 11/21 8:15 AM', type: 'LOCAL DELIVERY (invoiced)', name: 'Marigold Market', items: '6× Half Gallon Chai', total: '$92.00', pay: 'PAID', label: false },
  ];
  const ORDERS = [
    {
      at: 0.6, acct: 'Low Tide Coffee', cases: 2, mode: 'invoice', ship: true,
      rates: [['2nd Day Air', '2 days', '$46.18'], ['Next Day Air Saver', '1 day', '$88.40']], pick: 0, total: '$287.40',
      date: 'Mon 11/23 9:14 AM', type: 'Wholesale ship (invoiced)', items: '18× Half Gallon Chai',
      stripe: ['invoice sent · net 15', 'due dec 8, emailed to the cafe'],
      hook: ['invoice.finalized', 'row appended · UNPAID'],
      shippo: ['ups 2nd day air label bought', '2 boxes · print link → sheet'],
    },
    {
      at: 6.8, acct: 'Fern & Kettle', cases: 1, mode: 'card', ship: true,
      rates: [['2nd Day Air', '2 days', '$31.06'], ['Next Day Air Saver', '1 day', '$57.75']], pick: 1, total: '$171.95',
      date: 'Mon 11/23 11:02 AM', type: 'Wholesale ship', items: '9× Half Gallon Chai',
      stripe: ['checkout · paid by card', 'stripe checkout session'],
      hook: ['checkout.session.completed', 'row appended · PAID'],
      shippo: ['ups next day air saver label', '1 box · print link → sheet'],
    },
    {
      at: 13.0, acct: 'Hollow Oak Cafe', cases: 1, mode: 'invoice', ship: false,
      rates: [['Local delivery', 'upstate sc', '']], pick: 0, total: '$126.00',
      date: 'Mon 11/23 2:37 PM', type: 'LOCAL DELIVERY (invoiced)', items: '9× Half Gallon Chai',
      stripe: ['invoice sent · net 15', 'due dec 8, emailed to the cafe'],
      hook: ['invoice.finalized', 'row appended · LOCAL DELIVERY'],
      shippo: ['local delivery · no label', 'hand-delivered, shippo skipped'],
    },
  ];
  const PAID_AT = 19.4, PACK_AT = 21.6, CLEAR_AT = 24.2, LOOP = 25.2;
  // Order-relative beats (seconds after order.at).
  const B = { rates: 0.7, pick: 1.5, press: 2.1, stripe: 2.5, hook: 3.2, row: 3.7, shippo: 4.3, label: 4.9 };

  // Packet rail (design px). Store button → rail → chips → sheet.
  const RAIL = 236;
  const CHIP_Y = [38, 108, 178];
  const SHEET_Y = 246;
  const rowTop = (i) => SHEET_Y + 22 + HEAD + ROW * i; // i: 0 = first data row
  const cellPt = (row, col) => [12 + colX[col] + COLS[col][1] / 2, rowTop(row) + ROW / 2];
  const lerpPath = (pts, u) => {
    const seg = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    let want = Math.max(0, Math.min(1, u)) * L;
    for (let i = 0; i < seg.length; i++) {
      if (want <= seg[i] || i === seg.length - 1) { const f = seg[i] ? want / seg[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; }
      want -= seg[i];
    }
    return pts[0];
  };
  const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

  window.CVVisuals['votive-system'] = function (el) {
    const { cvs, cleanup } = setup(el, 'system');
    const colHead = COLS.map(([n, w], i) => `<div class="vv-c vv-c${i}" style="left:${colX[i]}px;width:${w}px">${n}</div>`).join('');
    cvs.innerHTML = `
      <section class="vv-store">
        <div class="vv-url"><span class="vv-lock"></span><span class="vv-urltext">drinkvotive.com/wholesale/checkout</span></div>
        <div class="vv-page">
          <div class="vv-shead"><img src="${A}logo-silhouette.svg" alt=""><a>Wholesale</a><span class="vv-cartbtn">Cart (<b class="vv-cartn">0</b>)</span></div>
          <p class="vv-acct">Signed in as <b class="vv-acctname"></b></p>
          <p class="vv-lineitem"><span class="vv-cases"></span></p>
          <fieldset class="vv-rates"><legend class="vv-legend">Shipping</legend><div class="vv-ratelist"></div></fieldset>
          <p class="vv-total">Total: <b class="vv-totalv"></b></p>
          <span class="vv-btn"></span>
        </div>
        <div class="vv-invoice">
          <div class="vv-inv-h"><b>stripe</b> invoice</div>
          <div class="vv-inv-to">Low Tide Coffee</div>
          <div class="vv-inv-row"><span>terms</span><span>net 15 · due dec 8</span></div>
          <div class="vv-inv-row"><span>amount</span><span>$287.40</span></div>
          <div class="vv-inv-row"><span>paid</span><span>ach · dec 4</span></div>
          <div class="vv-stamp">PAID</div>
        </div>
      </section>
      <div class="vv-rail"></div>
      <div class="vv-stub vv-stub-store"></div>
      ${CHIP_Y.map((y) => `<div class="vv-stub" style="top:${y}px"></div>`).join('')}
      ${['stripe', 'webhook', 'shippo'].map((n, i) => `<section class="vv-chip vv-chip-${n}" style="top:${CHIP_Y[i] - 30}px">
        <div class="vv-chip-h"><i></i><b>${n}</b><span>${['payments', 'drinkvotive.com/api/webhook', 'ups labels'][i]}</span></div>
        <div class="vv-chip-m"></div><div class="vv-chip-s"></div></section>`).join('')}
      <div class="vv-packet"></div>
      <section class="vv-sheet" style="top:${SHEET_Y}px">
        <div class="vv-sheet-bar"><span class="vv-sheet-icon"></span><b>Votive Orders</b><span class="vv-sheet-sub">google sheets · Orders</span></div>
        <div class="vv-grid">
          <div class="vv-hrow"><div class="vv-rn">1</div>${colHead}</div>
          <div class="vv-rows"></div>
          <div class="vv-cursor"></div>
        </div>
        <div class="vv-tabs"><span class="on">Orders</span><span>Items</span></div>
      </section>`;
    const $ = (s) => cvs.querySelector(s);
    const store = $('.vv-store'), page = $('.vv-page'), inv = $('.vv-invoice');
    const acctName = $('.vv-acctname'), cases = $('.vv-cases'), rateList = $('.vv-ratelist'), totalV = $('.vv-totalv'), btn = $('.vv-btn'), cartN = $('.vv-cartn');
    const legend = $('.vv-legend');
    const chips = ['stripe', 'webhook', 'shippo'].map((n) => { const c = $('.vv-chip-' + n); return { c, m: c.querySelector('.vv-chip-m'), s: c.querySelector('.vv-chip-s') }; });
    const packet = $('.vv-packet'), rowsEl = $('.vv-rows'), cursor = $('.vv-cursor');

    // Sheet rows: two old fulfilled ones plus one per order.
    const all = [...OLD, ...ORDERS];
    const rows = all.map((o, i) => {
      const r = h('div', 'vv-row');
      r.style.top = ROW * i + 'px';
      r.innerHTML = `<div class="vv-rn">${i + 2}</div>` + COLS.map(([, w], c) => `<div class="vv-c vv-c${c}" style="left:${colX[c]}px;width:${w}px"></div>`).join('');
      const cells = [...r.querySelectorAll('.vv-c')];
      cells[0].innerHTML = '<span class="vv-box"></span>';
      cells[1].textContent = o.date;
      cells[2].textContent = o.type;
      cells[3].textContent = o.name || o.acct;
      cells[4].textContent = o.items;
      cells[5].textContent = o.total;
      if (/LOCAL/.test(o.type)) cells[2].classList.add('vv-local');
      rowsEl.append(r);
      return { r, cells, o };
    });
    rows.slice(0, OLD.length).forEach(({ r, cells, o }) => {
      r.classList.add('in', 'done');
      cells[6].textContent = o.pay;
      if (o.label) cells[7].innerHTML = '<u>Print label</u>';
    });

    const rateHTML = (o, s) => {
      if (o.ship && s < B.rates) return '<span class="vv-muted">Getting UPS rates…</span>';
      return o.rates.map((r, i) => {
        const on = s >= B.pick && i === o.pick;
        return `<label class="${on ? 'on' : ''}"><span class="vv-radio"></span>${r[0]} <span class="vv-muted">· ${r[1]}</span>${r[2] ? ` <span class="vv-rp">${r[2]}</span>` : ''}</label>`;
      }).join('');
    };

    function draw(t) {
      t %= LOOP;
      // Which order is on the storefront.
      let oi = -1;
      ORDERS.forEach((o, i) => { if (t >= o.at - 0.2) oi = i; });
      const o = ORDERS[Math.max(0, oi)];
      const s = t - o.at;
      const invoiceView = t >= PAID_AT - 0.6 && t < CLEAR_AT;
      put(page, 'class', 'vv-page' + (invoiceView ? ' out' : '') + (oi < 0 || t >= CLEAR_AT ? ' blank' : ''));
      put(inv, 'class', 'vv-invoice' + (invoiceView ? ' in' : '') + (t >= PAID_AT ? ' paid' : ''));
      put(store.querySelector('.vv-urltext'), 'text', invoiceView ? 'invoice.stripe.com/i/acct_…/live' : 'drinkvotive.com/wholesale/checkout');
      put(acctName, 'text', o.acct);
      put(cases, 'html', `Half Gallon Chai × ${o.cases * 9} <span class="vv-muted">(${o.cases} case${o.cases > 1 ? 's' : ''})</span>`);
      put(cartN, 'text', String(o.cases * 9));
      put(legend, 'text', o.ship ? 'Shipping · live UPS rates' : 'Shipping');
      put(rateList, 'html', rateHTML(o, s));
      put(totalV, 'text', s >= B.pick ? o.total : '—');
      const label = o.mode === 'invoice' ? 'Bill me later (net 15)' : 'Pay with card';
      const done = o.mode === 'invoice' ? 'Invoice sent ✓' : 'Paid ✓';
      put(btn, 'text', s >= B.stripe ? done : label);
      put(btn, 'class', 'vv-btn' + (s >= B.press && s < B.stripe ? ' press' : '') + (s >= B.stripe ? ' sent' : ''));

      // Chips: show the latest event per service; light up while it's fresh.
      const paid = t >= PAID_AT && t < CLEAR_AT;
      const ev = [null, null, null];
      if (oi >= 0 && t < CLEAR_AT) {
        if (s >= B.stripe) ev[0] = [o.stripe, s - B.stripe];
        if (s >= B.hook) ev[1] = [o.hook, s - B.hook];
        if (s >= B.shippo) ev[2] = [o.shippo, s - B.shippo, !o.ship];
      }
      if (paid) {
        ev[0] = [['invoice.paid · Low Tide Coffee', '$287.40 landed, net 15 kept'], t - PAID_AT];
        ev[1] = [['invoice.paid', 'row 4 flips UNPAID → PAID'], t - PAID_AT - 0.6];
        if (ev[1][1] < 0) ev[1] = null;
        ev[2] = null;
      }
      chips.forEach((ch, i) => {
        const e = ev[i];
        put(ch.m, 'text', e ? e[0][0] : 'waiting');
        put(ch.s, 'text', e ? e[0][1] : i === 2 ? 'live rates at checkout' : '—');
        put(ch.c, 'class', `vv-chip vv-chip-${['stripe', 'webhook', 'shippo'][i]}` + (e && e[1] < 1.6 ? ' hot' : '') + (e ? ' has' : '') + (e && e[2] ? ' skip' : ''));
      });

      // Rows: appended, labeled, paid, packed.
      let cur = null;
      ORDERS.forEach((ord, i) => {
        const R = rows[OLD.length + i], ss = t - ord.at, ri = OLD.length + i;
        const on = ss >= B.row && t < CLEAR_AT;
        const paidNow = ord.mode === 'card' || (i === 0 && t >= PAID_AT + 0.8);
        put(R.r, 'class', 'vv-row' + (on ? ' in' : '') + (on && ss < B.row + 1.2 ? ' fresh' : '') + (i === 1 && t >= PACK_AT && t < CLEAR_AT ? ' done' : ''));
        put(R.cells[6], 'text', paidNow ? 'PAID' : 'UNPAID');
        put(R.cells[6], 'class', `vv-c vv-c6 ${paidNow ? (ord.mode === 'card' ? 'vv-paid' : 'vv-paid vv-flip') : 'vv-unpaid'}`);
        const lab = ord.ship && ss >= B.label;
        put(R.cells[7], 'html', lab ? '<u>Print label</u>' : '');
        put(R.cells[7], 'class', 'vv-c vv-c7' + (lab && ss < B.label + 1.2 ? ' flash' : ''));
        put(R.cells[0], 'class', 'vv-c vv-c0' + (i === 1 && t >= PACK_AT ? ' ticked' : ''));
        if (on && ss < B.label + 1) cur = ss >= B.label && ord.ship ? [ri, 7] : [ri, 1];
        if (i === 0 && t >= PAID_AT + 0.8 && t < PACK_AT) cur = [ri, 6];
        if (i === 1 && t >= PACK_AT && t < CLEAR_AT) cur = [ri, 0];
      });
      if (cur) {
        const c = cur[1], w = cur[1] === 1 ? COLS[1][1] + COLS[2][1] + COLS[3][1] + COLS[4][1] + COLS[5][1] + COLS[6][1] : COLS[c][1];
        put(cursor, 'transform', `translate(${colX[c]}px, ${HEAD + ROW * cur[0]}px)`);
        put(cursor, 'width', w + 'px');
        put(cursor, 'opacity', '1');
      } else put(cursor, 'opacity', '0');

      // The packet: one dot riding the rail between whichever two stops are live.
      const P = [];
      const storeOut = [[224, 196], [RAIL, 196]];
      const chipPt = (i) => [[RAIL, CHIP_Y[i]], [252, CHIP_Y[i]]];
      const sheetPt = (ri, col) => [[RAIL, SHEET_Y], [RAIL, SHEET_Y + 10], cellPt(ri, col)];
      if (oi >= 0 && t < CLEAR_AT && !paid) {
        const ri = OLD.length + oi;
        P.push([B.press, B.stripe, [...storeOut, ...chipPt(0)]]);
        P.push([B.stripe + 0.1, B.hook, [[252, CHIP_Y[0]], ...chipPt(1)]]);
        P.push([B.hook + 0.05, B.row, [[252, CHIP_Y[1]], [RAIL, CHIP_Y[1]], ...sheetPt(ri, 1)]]);
        if (o.ship) P.push([B.row + 0.1, B.shippo, [[252, CHIP_Y[1]], ...chipPt(2)]]);
        if (o.ship) P.push([B.shippo + 0.05, B.label, [[252, CHIP_Y[2]], [RAIL, CHIP_Y[2]], ...sheetPt(ri, 7)]]);
      }
      let pos = null, ps = s;
      if (paid) {
        ps = t - PAID_AT;
        P.push([0, 0.6, [[252, CHIP_Y[0]], ...chipPt(1)]]);
        P.push([0.6, 0.8 + 0.4, [[252, CHIP_Y[1]], [RAIL, CHIP_Y[1]], ...sheetPt(OLD.length, 6)]]);
      }
      for (const [a, b, pts] of P) if (ps >= a && ps < b) pos = lerpPath(pts, ease((ps - a) / (b - a)));
      if (pos) {
        put(packet, 'transform', `translate(${pos[0].toFixed(1)}px, ${pos[1].toFixed(1)}px)`);
        put(packet, 'opacity', '1');
      } else put(packet, 'opacity', '0');
    }

    if (reduce()) { el.classList.add('vv-still'); draw(PACK_AT - 0.4); return; }
    loop(el, (ms) => draw(ms / 1000), cleanup);
    el._vvDestroy = () => { cleanup.forEach((fn) => fn()); el._vvDestroy = null; };
  };
})();

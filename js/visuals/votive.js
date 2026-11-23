// Featured-work visuals: votive. Registers window.CVVisuals[name] = (el) => { ... }.
//
//  votive-brand   real brand files, not redraws: the 3d-scan spin of the
//                 half-gallon jug, the drinkvotive.com nav logo animation, and
//                 a slow cycle through labels, stickers, merch and wordmarks.
//  votive-system  the back office: wholesale checkout → Stripe (invoice on net
//                 terms, or card) → /api/webhook → the "Votive Orders" sheet,
//                 Shippo buying the UPS label, and invoice.paid flipping the
//                 row to PAID. Columns mirror scripts/orders-sheet.gs in
//                 votive-site. Cafe names and amounts are made up.
//
// Both pause off-screen and in hidden tabs and show one still frame for
// prefers-reduced-motion. votive-system draws on a fixed design canvas scaled
// to the stage; votive-brand lazy-loads its images when the stage gets close.
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

  // ======================================================================
  // votive-brand
  // ======================================================================
  // Griffin's real Votive files (from the are.na design archive), not redraws:
  // the 3d-scan spin of the half-gallon jug, the drinkvotive.com nav logo, and
  // a slow cycle through labels, stickers, merch and wordmarks.
  const PIECES = [
    { src: 'label-chai.webp', cap: 'label · chai concentrate', w: 2375, h: 2750 },
    { src: 'hat-spin.webp', still: 'hat-spin-still.webp', cap: '3d scan · hat', w: 414, h: 400 },
    { src: 'sticker-bottle.webp', cap: 'bottle sticker', w: 3750, h: 6000 },
    { src: 'label-white-peony.webp', cap: 'label · white peony', w: 3750, h: 6000 },
    { src: 'merch-shirt.webp', cap: 'merch · tee', w: 5872, h: 5600 },
    { src: 'wordmark-stacked.webp', cap: 'wordmark · stacked', w: 500, h: 500 },
    { src: 'merch-hoodie.webp', cap: 'merch · hoodie', w: 2700, h: 3279 },
    { src: 'wordmark-star.webp', cap: 'wordmark · v✦tive', w: 1002, h: 1196 },
    { src: 'wordmark-color.webp', cap: 'wordmark · overprint', w: 1120, h: 1120 },
    { src: 'wordmark-chalk.webp', cap: 'wordmark · chalk', w: 774, h: 996 },
  ];
  const HOLD = 3400; // ms per piece in the cycle

  window.CVVisuals['votive-brand'] = function (el) {
    if (el._vvDestroy) el._vvDestroy();
    el.classList.add('v-votive', 'v-votive-brand');
    const still = reduce();
    const pad = (n) => String(n).padStart(2, '0');
    el.innerHTML = `
      <div class="vb-cell vb-hero">
        <img class="vb-anim" data-src="jug-spin.webp" data-still="jug-spin-still.webp" width="296" height="640" alt="3d scan of the votive half-gallon chai jug, turning">
        <span class="vb-cap">3d scan · half-gallon chai</span>
      </div>
      <div class="vb-cell vb-nav">
        <img class="vb-anim" data-src="nav-logo.webp" data-still="nav-logo-still.webp" width="365" height="400" alt="votive logo animation from the drinkvotive.com nav">
        <span class="vb-cap">nav logo · drinkvotive.com</span>
      </div>
      <div class="vb-cell vb-cycle">
        ${PIECES.map((p, i) => `<img class="vb-piece${p.still ? ' vb-anim' : ''}" data-src="${p.src}"${p.still ? ` data-still="${p.still}"` : ''} width="${p.w}" height="${p.h}" alt="${p.cap}" data-i="${i}">`).join('')}
        <span class="vb-cap"><span class="vb-capt"></span><span class="vb-n"></span></span>
      </div>`;
    const pieces = [...el.querySelectorAll('.vb-piece')];
    const capt = el.querySelector('.vb-capt'), num = el.querySelector('.vb-n');
    const cleanup = [];
    let near = false, onScreen = false, cur = -1;

    // Animated pieces show their first frame (a still webp) until they're on
    // screen, and go back to it when they leave, so nothing animates unseen.
    const srcFor = (img) => A + (still || !onScreen ? img.dataset.still || img.dataset.src : img.dataset.src);
    const load = (img) => { const s = srcFor(img); if (img.getAttribute('src') !== s) img.src = s; };
    function show(i) {
      if (i === cur) return;
      cur = i;
      pieces.forEach((p, k) => p.classList.toggle('on', k === i));
      put(capt, 'text', PIECES[i].cap);
      put(num, 'text', `${pad(i + 1)}/${pad(PIECES.length)}`);
      // Fetch the current piece and the next one; the rest wait their turn.
      if (near) { load(pieces[i]); load(pieces[(i + 1) % pieces.length]); }
    }
    function refresh() {
      if (!near) return;
      el.querySelectorAll('.vb-hero img, .vb-nav img').forEach(load);
      pieces.forEach((p, k) => { if (p.getAttribute('src') || k === cur || k === (cur + 1) % pieces.length) load(p); });
    }
    show(0);

    const vis = (on) => { onScreen = on; refresh(); };
    if (window.IntersectionObserver) {
      // Lazy-load when the stage gets close; animate only while it's visible.
      const ioNear = new IntersectionObserver((es) => { if (es[es.length - 1].isIntersecting && !near) { near = true; refresh(); ioNear.disconnect(); } }, { rootMargin: '400px' });
      const ioOn = new IntersectionObserver((es) => vis(es[es.length - 1].isIntersecting), { rootMargin: '40px' });
      ioNear.observe(el); ioOn.observe(el);
      cleanup.push(() => { ioNear.disconnect(); ioOn.disconnect(); });
    } else { near = true; vis(true); }

    if (still) el.classList.add('vv-still');
    else loop(el, (t) => show(Math.floor(t / HOLD) % PIECES.length), cleanup);
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

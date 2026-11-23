// Featured-work visuals: sheaf. Registers window.CVVisuals[name] = (el) => { ... }.
//
// A code-built recreation of Sheaf (sheaf.to) playing a short scripted scene:
// a message types into the composer and sends, the agent works through a few
// steps (the terminal pane shows the test run), the steps fold into one summary
// line, the reply streams in, and a "done" notice lands on the laptop and the
// phone. Tokens, icons and type are copied from the real app (sheaf/public).
//
// The scene is a pure function of time (render(t)), so pausing, looping and the
// reduced-motion still frame all fall out of one code path. Everything is laid
// out at a fixed design size and scaled to the stage with a transform.
window.CVVisuals = window.CVVisuals || {};

(function () {
  const LOOP = 19;
  const T = {
    typeStart: 0.9, typeEnd: 3.3, send: 3.8,
    s1: 4.4, s2: 5.3, s3: 6.1, s4: 6.9,
    termCmd: 7.0, termOut: 7.7, termEnd: 9.3,
    s5: 9.7, fold: 10.6, reply: 11.0, replyEnd: 13.0,
    done: 13.3, toast: 13.7, toastOut: 17.7, fadeOut: 18.2,
  };
  const STILL = 15; // the reduced-motion frame

  const PROMPT = 'make the pricing table responsive and run the tests';
  const REPLY = 'Done. Under 640px the pricing table now stacks into a single column, and the feature list wraps with it instead of overflowing. All 42 tests pass.';
  const LIVE = [
    [T.s1, 'Reading PricingTable.tsx'],
    [T.s2, 'Editing PricingTable.tsx'],
    [T.s3, 'Editing pricing.css'],
    [T.s4, 'Running npm test'],
  ];
  const ROWS = [
    [T.s2, 'Read PricingTable.tsx'],
    [T.s3, 'Edited PricingTable.tsx'],
    [T.s4, 'Edited pricing.css'],
    [T.s5, 'Ran npm test', '42 passed'],
  ];
  const SUMMARY = 'Worked 9s · edited PricingTable.tsx, pricing.css · 1 command · read 1 file';
  const TERM_BEFORE = [
    ['dim', 'Last login: Mon Nov 23 09:12 on ttys002'],
    ['', '<b>~/northwind-site</b> <i>main</i> $ npm run dev'],
    ['dim', '  VITE v6.1.0  ready in 412 ms'],
    ['dim', '  ➜  Local:   http://localhost:5173/'],
    ['', ''],
  ];
  const TERM_CMD = 'npm test';
  const TERM_OUT = [
    ['', ''],
    ['dim', '&gt; northwind-site@2.4.0 test'],
    ['dim', '&gt; vitest run'],
    ['', ''],
    ['', ' <s>✓</s> src/pricing/PricingTable.test.tsx <span class="d">(12)</span>'],
    ['', ' <s>✓</s> src/pricing/plans.test.ts <span class="d">(9)</span>'],
    ['', ' <s>✓</s> src/cart/cart.test.ts <span class="d">(14)</span>'],
    ['', ' <s>✓</s> src/ui/Button.test.tsx <span class="d">(7)</span>'],
    ['', ''],
    ['', ' Test Files  <s>4 passed</s> <span class="d">(4)</span>'],
    ['', '      Tests  <s>42 passed</s> <span class="d">(42)</span>'],
    ['dim', '   Duration  1.84s'],
    ['', ''],
  ];

  // Icons, copied from sheaf/public/index.html.
  const I = {
    mark: '<svg viewBox="0 0 84 84" fill="currentColor"><path d="M0 84L43.7276 0H37.8C27.7748 0 18.1602 3.98249 11.0714 11.0714C3.98249 18.1602 0 27.7748 0 37.8L0 84Z"/><path d="M0 84L84 40.2724V46.2C84 56.2252 80.0175 65.8398 72.9286 72.9286C65.8398 80.0175 56.2252 84 46.2 84L0 84Z"/><path d="M0 84L50.8057 4.25107C52.4926 1.60318 55.4148 0 58.5543 0H72.24C78.7349 0 84 5.26513 84 11.76V25.4457C84 28.5852 82.3968 31.5074 79.7489 33.1943L0 84Z"/></svg>',
    term: '<svg viewBox="0 0 18 18"><rect x="2" y="3" width="14" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 7.25 7.75 9 5.5 10.75M9.5 11h3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    docs: '<svg viewBox="0 0 18 18"><path d="M5 2.5h5.5L14 6v8.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M10.5 2.5V6H14M6.75 9.25h4.5M6.75 12h3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    preview: '<svg viewBox="0 0 18 18"><rect x="2" y="3" width="14" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.5h14" stroke="currentColor" stroke-width="1.4"/><circle cx="4.6" cy="4.75" r=".6" fill="currentColor"/><circle cx="6.6" cy="4.75" r=".6" fill="currentColor"/></svg>',
    bell: '<svg viewBox="0 0 18 18"><path d="M4.75 12.5V8.25a4.25 4.25 0 0 1 8.5 0v4.25l1.25 1.25h-11z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M7.25 15.25a1.9 1.9 0 0 0 3.5 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    inbox: '<svg viewBox="0 0 18 18"><path d="M2.75 10.25 4.6 4.1A1.5 1.5 0 0 1 6.04 3h5.92a1.5 1.5 0 0 1 1.44 1.1l1.85 6.15V13.5A1.5 1.5 0 0 1 13.75 15h-9.5a1.5 1.5 0 0 1-1.5-1.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2.75 10.25h3.5l1 1.5h3.5l1-1.5h3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    cmd: '<svg viewBox="0 0 18 18"><path d="M6.75 6.75V5.25a1.5 1.5 0 1 0-1.5 1.5zm0 0h4.5m-4.5 0v4.5m4.5-4.5V5.25a1.5 1.5 0 1 1 1.5 1.5zm0 0v4.5m0 0h1.5a1.5 1.5 0 1 1-1.5 1.5zm0 0h-4.5m0 0v1.5a1.5 1.5 0 1 1-1.5-1.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    side: '<svg viewBox="0 0 18 18"><rect x="2.25" y="3" width="13.5" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6.75 3v12" stroke="currentColor" stroke-width="1.4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    plus18: '<svg viewBox="0 0 18 18"><path d="M9 3.5v11M3.5 9h11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    plus12: '<svg viewBox="0 0 12 12"><path d="M6 1.5v9M1.5 6h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg>',
    folder: '<svg viewBox="0 0 16 16"><path d="M1.75 4.5c0-.69.56-1.25 1.25-1.25h3.1l1.4 1.5H13c.69 0 1.25.56 1.25 1.25v5.75c0 .69-.56 1.25-1.25 1.25H3c-.69 0-1.25-.56-1.25-1.25z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 4.9-.7" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    chev: '<svg viewBox="0 0 12 12"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg viewBox="0 0 16 16"><path d="M9.5 3.5 5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fwd: '<svg viewBox="0 0 16 16"><path d="M6.5 3.5 11 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reload: '<svg viewBox="0 0 16 16"><path d="M12.5 8a4.5 4.5 0 1 1-1.4-3.3M12.5 3v2.5H10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 18 18"><rect x="2.75" y="2.75" width="12.5" height="12.5" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="m6 9.2 2 2 4-4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gear: '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M9 1.9v2M9 14.1v2M1.9 9h2M14.1 9h2M4 4l1.4 1.4M12.6 12.6 14 14M4 14l1.4-1.4M12.6 5.4 14 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  };

  const AREAS = [
    { n: 'Northwind site', l: 'Pricing table', t: 'now', active: true },
    { n: 'Design system', l: 'Token audit for dark mode', t: '2h ago' },
    { n: 'Invoice bot', l: 'Retry failed sends', t: '1d ago', line: 'unread' },
    { n: 'Garden log', l: 'Frost dates for the beds', t: '3d ago' },
    { n: 'Trip planning', l: 'Trains from Lisbon to Porto', t: '6d ago' },
  ];

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const words = (s) => s.split(/(?<=\s)/);

  // ---------- markup ----------
  function chatHTML(kind) {
    const phone = kind === 'phone';
    const header = phone
      ? `<div class="vs-hdr"><div class="vs-hl"><span class="vs-ib">${I.side}</span><b class="vs-title">Pricing table</b><span class="vs-dot"></span></div>
           <div class="vs-hr"><span class="vs-ib">${I.inbox}</span><span class="vs-ib">${I.plus18}</span></div></div>`
      : `<div class="vs-hdr"><div class="vs-hl"><span class="vs-nav">${I.back}</span><span class="vs-nav off">${I.fwd}</span><b class="vs-title">Pricing table</b><span class="vs-dot"></span></div>
           <div class="vs-hr"><span class="vs-ib on">${I.term}</span><span class="vs-ib">${I.docs}</span><span class="vs-ib">${I.preview}</span><span class="vs-sep"></span><span class="vs-ib">${I.inbox}</span><span class="vs-ib vs-wide">${I.cmd}</span></div></div>`;
    return `<div class="vs-chat vs-k-${kind}">
      ${header}
      <div class="vs-msgs"><div class="vs-scroll">
        <div class="vs-msg us"><div class="vs-bubble">can you get the staging preview running?</div></div>
        <div class="vs-msg as"><div class="vs-summary static"><span>Worked 6s · 2 commands</span></div><div class="vs-text">It's up at <code>localhost:5173</code>. The pricing page still overflows on small screens. Want me to take a look?</div></div>
        <div class="vs-msg us vs-new"><div class="vs-bubble">${esc(PROMPT)}</div></div>
        <div class="vs-msg as vs-turn">
          <div class="vs-steps">
            <div class="vs-rows">
              ${ROWS.map((r) => `<div class="vs-row"><span>${esc(r[1])}</span>${r[2] ? `<em>✓ ${esc(r[2])}</em>` : ''}</div>`).join('')}
              <div class="vs-live"></div>
            </div>
            <div class="vs-summary"><span>${esc(SUMMARY)}</span></div>
          </div>
          <div class="vs-text vs-reply">${words(REPLY).map((w) => `<span>${esc(w)}</span>`).join('')}</div>
        </div>
      </div></div>
      <div class="vs-input">
        <div class="vs-box">
          <div class="vs-field"><span class="vs-ph">What's next?</span><span class="vs-typed"></span><span class="vs-caret"></span></div>
          <div class="vs-tools">
            <span class="vs-cb">${I.plus}</span>
            <span class="vs-grow"></span>
            ${phone ? '' : '<span class="vs-um"><i style="--w:38%"></i><i style="--w:61%"></i></span>'}
            <span class="vs-cb">${I.mic}</span>
            <span class="vs-send"><span class="i-send">${I.send}</span><span class="i-stop">${I.stop}</span></span>
          </div>
        </div>
        <div class="vs-cx"><span class="vs-chip">${I.folder}<span>northwind-site</span>${I.chev}</span><span class="vs-grow"></span>${phone ? '' : `<span class="vs-chip strong">Default ${I.chev}</span>`}<span class="vs-chip">${I.lock}<span>Auto mode</span></span></div>
      </div>
      <div class="vs-toast"><div class="vs-t-mark">${I.mark}</div><div class="vs-t-body"><b>Pricing table is done</b><span>Northwind site · 42 tests pass</span></div><span class="vs-t-open">Open</span></div>
    </div>`;
  }

  function sidebarHTML() {
    return `<aside class="vs-side">
      <div class="vs-brand"><span class="vs-word">${I.mark}<b>Sheaf</b></span><span class="vs-grow"></span><span class="vs-ib">${I.check}</span><span class="vs-ib">${I.gear}</span></div>
      <div class="vs-shead"><span class="vs-search">Search chats</span><span class="vs-newbtn">${I.plus12}New</span></div>
      <div class="vs-group">Areas</div>
      ${AREAS.map((a) => `<div class="vs-card${a.active ? ' active' : ''}"${a.line ? ` data-line="${a.line}"` : ''}><div class="vs-ctop"><b>${esc(a.n)}</b></div><div class="vs-cbot"><span>${esc(a.l)}</span><i>${esc(a.t)}</i></div></div>`).join('')}
      <div class="vs-newarea">${I.plus12}<span>New area</span></div>
      <div class="vs-group vs-qa"><span>Quick asks</span><span>2</span></div>
    </aside>`;
  }

  function termHTML() {
    const line = (l) => `<div class="${l[0]}">${l[1] || '&nbsp;'}</div>`;
    return `<aside class="vs-term">
      <div class="vs-thead"><b>Terminal</b><span class="vs-ttab active">mini <span>×</span></span><span class="vs-ttab">laptop</span><span class="vs-grow"></span><span class="vs-ib">${I.plus18}</span><span class="vs-ib">${I.reload}</span><span class="vs-ib">${I.close}</span></div>
      <div class="vs-console">
        ${TERM_BEFORE.map(line).join('')}
        <div class="vs-tcmd"><b>~/northwind-site</b> <i>main</i> $ <span class="vs-tcmd-t"></span><span class="vs-tcur"></span></div>
        <div class="vs-tout">${TERM_OUT.map((l) => `<div class="vs-tl ${l[0]}">${l[1] || '&nbsp;'}</div>`).join('')}
          <div class="vs-tl vs-tprompt"><b>~/northwind-site</b> <i>main</i> $ <span class="vs-tcur blink"></span></div></div>
      </div>
    </aside>`;
  }

  function phoneHTML() {
    return `<div class="vs-phone"><div class="vs-screen"><div class="vs-screen-in">
      <div class="vs-status"><b>9:41</b><span class="vs-island"></span><span class="vs-sicons"><i></i><i></i><i></i><u></u></span></div>
      ${chatHTML('phone')}
      <div class="vs-push"><div class="vs-p-icon">${I.mark}</div><div class="vs-p-body"><div class="vs-p-top"><b>Sheaf</b><span>now</span></div><b>Pricing table is done</b><span>Northwind site: 42 tests pass.</span></div></div>
    </div></div></div>`;
  }

  // ---------- mount ----------
  window.CVVisuals.sheaf = function mountSheaf(stage) {
    if (stage.__vsheaf) stage.__vsheaf.destroy();
    stage.classList.add('v-sheaf');
    stage.querySelectorAll(':scope > .vs-root').forEach((n) => n.remove());

    const root = document.createElement('div');
    root.className = 'vs-root';
    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', 'Animated recreation of Sheaf: a message is sent from the laptop, the agent edits two files and runs the tests in the terminal, then a "done" notice arrives on the laptop and the phone.');
    root.innerHTML = `<div class="vs-canvas" aria-hidden="true">
      <div class="vs-desk">
        <div class="vs-win"><div class="vs-bar"><i></i><i></i><i></i><span>Sheaf</span></div>
          <div class="vs-app">${sidebarHTML()}${chatHTML('desk')}${termHTML()}</div></div>
        ${phoneHTML()}
      </div>
    </div>`;
    stage.append(root);

    const canvas = root.querySelector('.vs-canvas');
    const desk = root.querySelector('.vs-desk');
    const win = root.querySelector('.vs-win');
    const phoneEl = root.querySelector('.vs-phone');
    const screenIn = root.querySelector('.vs-screen-in');
    const card = root.querySelector('.vs-card.active');
    const tcmd = root.querySelector('.vs-tcmd-t');
    const tcur = root.querySelector('.vs-tcmd .vs-tcur');
    const tout = [...root.querySelectorAll('.vs-tout .vs-tl')];

    const views = [...root.querySelectorAll('.vs-chat')].map((el) => ({
      el,
      phone: el.classList.contains('vs-k-phone'),
      msgs: el.querySelector('.vs-msgs'),
      scroll: el.querySelector('.vs-scroll'),
      typed: el.querySelector('.vs-typed'),
      newMsg: el.querySelector('.vs-new'),
      turn: el.querySelector('.vs-turn'),
      rows: [...el.querySelectorAll('.vs-row')],
      rowsBox: el.querySelector('.vs-rows'),
      live: el.querySelector('.vs-live'),
      summary: el.querySelector('.vs-steps .vs-summary'),
      reply: el.querySelector('.vs-reply'),
      words: [...el.querySelectorAll('.vs-reply span')],
      shift: 0,
      sy: null,
    }));
    const deskView = views.find((v) => !v.phone);
    const phoneView = views.find((v) => v.phone);

    const reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    let mode = 'desk';
    let primary = deskView;
    let visible = false;
    let raf = 0;
    let last = 0;
    let t = 0;
    let wasConnected = false;
    let destroyed = false;
    let held = false;
    const cache = new Map();

    function put(el, key, val, apply) {
      const k = cache.get(el) || {};
      if (k[key] === val) return;
      k[key] = val;
      cache.set(el, k);
      apply(val);
    }
    const cls = (el, c, on) => put(el, 'c:' + c, !!on, (v) => el.classList.toggle(c, v));
    const txt = (el, s) => put(el, 'txt', s, (v) => { el.textContent = v; });

    // ---------- layout: pick a design size for this stage and scale it ----------
    function layout() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      let s, W, H;
      if (w < 640) {
        mode = 'mob';
        W = 420;
        s = w / W;
        H = h / s;
      } else {
        mode = 'desk';
        s = Math.min(h / 560, w / 1240, 1.15);
        W = w / s;
        H = h / s;
      }
      root.classList.toggle('is-mob', mode === 'mob');
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.style.transform = `scale(${s})`;
      primary = mode === 'mob' ? phoneView : deskView;

      if (mode === 'mob') {
        phoneEl.style.width = phoneEl.style.height = '';
        screenIn.style.width = W + 'px';
        screenIn.style.height = H + 'px';
        screenIn.style.transform = 'none';
      } else {
        const pad = 24;
        const showPhone = W >= 1180;
        const ph = Math.min(H - pad * 2, 530);
        const pw = Math.round(ph * 0.49);
        phoneEl.hidden = !showPhone;
        const winW = W - pad * 2 - (showPhone ? pw + pad : 0);
        win.classList.toggle('no-term', winW < 820);
        win.classList.toggle('roomy', winW >= 1000);
        win.classList.toggle('no-side', winW < 660);
        if (showPhone) {
          phoneEl.style.width = pw + 'px';
          phoneEl.style.height = ph + 'px';
          const bezel = 9;
          const sw = pw - bezel * 2;
          const sh = ph - bezel * 2;
          const k = sw / 390;
          screenIn.style.width = '390px';
          screenIn.style.height = sh / k + 'px';
          screenIn.style.transform = `scale(${k})`;
        }
      }
      phoneEl.hidden = mode === 'desk' && W < 1180;
      for (const v of views) {
        // How far the reply moves up when the step rows fold into one line.
        v.shift = Math.max(0, v.rowsBox.offsetHeight - v.summary.offsetHeight);
        v.rowH = v.rows[0].offsetHeight;
        v.el.style.setProperty('--fold', -v.shift + 'px');
        v.sy = null;
      }
      cache.clear();
      render(t, true);
    }

    // ---------- the scene, as a function of time ----------
    function scrollFor(v, tt) {
      // Bottom of the newest visible thing, like the real chat's stick-to-bottom.
      let el = v.turn.previousElementSibling.previousElementSibling; // earlier reply
      let bottom = el.offsetTop + el.offsetHeight;
      if (tt >= T.send) bottom = v.newMsg.offsetTop + v.newMsg.offsetHeight;
      if (tt >= T.s1) {
        // offsetTop is relative to .vs-msgs (the positioned ancestor) and ignores transforms.
        if (tt >= T.reply) bottom = v.reply.offsetTop + v.reply.offsetHeight - v.shift;
        else if (tt >= T.fold) bottom = v.summary.offsetTop + v.summary.offsetHeight + 8;
        else {
          const n = ROWS.filter((r) => tt >= r[0]).length;
          bottom = tt < T.s5
            ? v.live.offsetTop + v.live.offsetHeight - (ROWS.length - n) * v.rowH
            : v.rows[n - 1].offsetTop + v.rows[n - 1].offsetHeight;
        }
      }
      const view = v.msgs.clientHeight - 20;
      return Math.min(0, view - bottom);
    }

    function render(tt, force) {
      const running = tt >= T.send && tt < T.done;
      const typedN = tt < T.typeStart ? 0 : tt >= T.send ? 0 : Math.min(PROMPT.length, Math.round(((tt - T.typeStart) / (T.typeEnd - T.typeStart)) * PROMPT.length));
      const liveText = (LIVE.filter((l) => tt >= l[0]).pop() || [0, ''])[1];
      const rowsN = ROWS.filter((r) => tt >= r[0]).length;
      const wordsN = tt < T.reply ? 0 : Math.min(1e9, Math.ceil(((tt - T.reply) / (T.replyEnd - T.reply)) * words(REPLY).length));

      for (const v of views) {
        const isPrimary = v === primary;
        const typed = isPrimary ? PROMPT.slice(0, typedN) : '';
        txt(v.typed, typed);
        cls(v.el, 'has-text', typed.length > 0);
        cls(v.el, 'focus', isPrimary && tt >= T.typeStart - 0.3 && tt < T.send);
        cls(v.el, 'sent', isPrimary && tt >= T.send && tt < T.send + 0.25);
        cls(v.el, 'running', running);
        cls(v.el, 'online', !running);
        cls(v.newMsg, 'in', tt >= T.send);
        cls(v.turn, 'in', tt >= T.s1);
        v.rows.forEach((r, i) => cls(r, 'in', i < rowsN));
        txt(v.live, liveText ? liveText + '…' : '');
        cls(v.live, 'in', tt >= T.s1 && tt < T.s5);
        // The working line sits right under the last finished step and slides down as steps land.
        put(v.live, 'y', rowsN, (n) => { v.live.style.transform = `translateY(${-(ROWS.length - n) * v.rowH}px)`; });
        cls(v.turn, 'folded', tt >= T.fold);
        v.words.forEach((w, i) => cls(w, 'in', i < wordsN));
        // On a phone-width stage the notice covers the reply, so it leaves sooner.
        cls(v.el, 'toast-in', tt >= T.toast && tt < (mode === 'mob' ? T.toast + 2.6 : T.toastOut));
        cls(v.el, 'fade', tt >= T.fadeOut || tt < 0.35);

        const sy = scrollFor(v, tt);
        if (force || sy !== v.sy) {
          v.sy = sy;
          v.scroll.style.transform = `translateY(${sy}px)`;
        }
      }
      cls(card, 'working', running);
      cls(root, 'push-in', mode === 'desk' && tt >= T.toast + 0.3 && tt < T.toastOut);

      // Terminal
      const cmdN = tt < T.termCmd ? 0 : Math.min(TERM_CMD.length, Math.floor(((tt - T.termCmd) / 0.5) * TERM_CMD.length));
      txt(tcmd, tt >= T.fadeOut + 0.5 ? '' : TERM_CMD.slice(0, cmdN));
      cls(tcur, 'gone', tt >= T.termOut);
      const outN = tt < T.termOut ? 0 : Math.ceil(((tt - T.termOut) / (T.termEnd - T.termOut)) * tout.length);
      tout.forEach((l, i) => cls(l, 'in', i < outN));
      cls(root, 'term-fade', tt >= T.fadeOut);
    }

    // ---------- clock ----------
    function frame(now) {
      raf = 0;
      if (destroyed) return;
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      if (!held) t += dt;
      if (t >= LOOP) t -= LOOP;
      render(t);
      schedule();
    }
    function schedule() {
      if (raf || destroyed) return;
      if (!visible || document.hidden || reduce.matches) return;
      raf = requestAnimationFrame((n) => { last = n; raf = requestAnimationFrame(frame); });
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function onMotion() {
      if (reduce.matches) { stop(); t = STILL; render(t, true); root.classList.add('still'); }
      else { root.classList.remove('still'); schedule(); }
    }
    function onVis() { if (document.hidden) stop(); else schedule(); }

    const ro = new ResizeObserver(() => layout());
    ro.observe(stage);
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible) schedule(); else stop();
    }, { rootMargin: '80px' });
    io.observe(stage);
    document.addEventListener('visibilitychange', onVis);
    if (reduce.addEventListener) reduce.addEventListener('change', onMotion);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!destroyed) layout(); });
    // cv.js re-renders the tab by replacing the stage; clean up once it's gone.
    const watch = setInterval(() => {
      if (stage.isConnected) wasConnected = true;
      else if (wasConnected) destroy();
    }, 2000);

    function destroy() {
      destroyed = true;
      stop();
      ro.disconnect();
      io.disconnect();
      clearInterval(watch);
      document.removeEventListener('visibilitychange', onVis);
      if (reduce.removeEventListener) reduce.removeEventListener('change', onMotion);
      if (stage.__vsheaf === api) delete stage.__vsheaf;
    }
    // seek() is a test hook: jump to a moment and hold there.
    const api = { destroy, seek(x) { held = true; t = x; render(t, true); }, play() { held = false; } };
    stage.__vsheaf = api;

    if (reduce.matches) { t = STILL; root.classList.add('still'); }
    layout();
    render(t, true);
  };
})();

// Featured-work visuals: moment. Registers window.CVVisuals[name] = (el) => { ... }.
//
// Two code-built miniatures of client sites Griffin built at MOMENT, each in a
// thin browser frame:
//   g360: g360technologies.com. The hero (risk chips floating over the arcs),
//         then PromptVault screening a prompt (sensitive values are caught and
//         masked before the model sees them), then RepoAudit findings ticking
//         into its terminal.
//   less: less.tech. The hero with data flowing through the pipeline nodes,
//         then the feature tabs: sources wiring into Combine ("Get the data"),
//         then "Refresh the data" with the budget table rerunning.
//
// Colors, copy, logos and layout come from the live sites (Tailwind tokens in
// their CSS). Fonts are system stand-ins (Inter-ish for G360, a neutral grotesk
// for Less's custom LessSans); nothing is fetched at runtime.
//
// Each scene is a pure function of time (frame(t)): the page is laid out at a
// fixed design width, scaled to the stage, and auto-scrolled by transform.
// Pausing (off-screen / hidden tab), looping and the reduced-motion still frame
// all come from that one code path.
window.CVVisuals = window.CVVisuals || {};

(function () {
  const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, p) => a + (b - a) * p;
  const on = (el, c, v) => { if (el && el.classList.contains(c) !== !!v) el.classList.toggle(c, !!v); };
  const txt = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };

  // Piecewise eased interpolation through [time, value] keys.
  function keyed(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
        return lerp(v0, v1, ease(seg(t, t0, t1)));
      }
    }
    return keys[keys.length - 1][1];
  }

  const LOCK = '<svg viewBox="0 0 10 12" width="7" height="8" aria-hidden="true"><rect x="1" y="5" width="8" height="6.5" rx="1.2" fill="currentColor"/><path d="M3 5V3.6a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
  const CURSOR = '<svg viewBox="0 0 16 22" width="15" height="21" aria-hidden="true"><path d="M1.5 1.5v16.2l4.1-3.9 2.6 6.1 2.9-1.2-2.6-6h5.8z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  const CHEV = '<svg viewBox="0 0 24 24" width="0.9em" height="0.9em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  // ---------- shared runner ----------
  function mount(stage, spec) {
    if (!stage || stage.__vmMounted) return;
    stage.__vmMounted = true;
    stage.classList.add('v-moment', 'v-' + spec.name);
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', spec.label);
    stage.innerHTML =
      `<div class="vm-win"><div class="vm-bar"><span class="vm-dots"><i></i><i></i><i></i></span>` +
      `<span class="vm-url">${LOCK}${spec.url}</span><span class="vm-dots vm-ghost"><i></i><i></i><i></i></span></div>` +
      `<div class="vm-body"><div class="vm-canvas"><div class="vm-page">${spec.page}</div>` +
      `<div class="vm-fixed">${spec.nav}</div><div class="vm-cursor">${CURSOR}</div></div></div></div>`;

    const q = (s) => stage.querySelector(s);
    const ctx = {
      stage, q, qa: (s) => Array.from(stage.querySelectorAll(s)),
      body: q('.vm-body'), canvas: q('.vm-canvas'), page: q('.vm-page'), cursor: q('.vm-cursor'),
      pos: {}, scale: 1, cw: 600, vh: 400, scrollKeys: [[0, 0]], t: spec.still,
    };
    spec.init && spec.init(ctx);

    function measure() {
      const cr = ctx.canvas.getBoundingClientRect();
      const pr = ctx.page.getBoundingClientRect();
      ctx.qa('[data-k]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const fixed = !!el.closest('.vm-fixed');
        const o = fixed ? cr : pr;
        ctx.pos[el.dataset.k] = { x: (r.left - o.left) / ctx.scale, y: (r.top - o.top) / ctx.scale, w: r.width / ctx.scale, h: r.height / ctx.scale, fixed };
      });
      ctx.pageH = ctx.page.offsetHeight;
    }

    function layout() {
      const w = ctx.body.clientWidth, h = ctx.body.clientHeight;
      if (!w || !h) return;
      // Scale the mock page to the stage width, but not past ~1.1x: on very
      // wide stages the page gets wider instead of blowing up (and cropping).
      const base = w < 380 ? 440 : 540;
      ctx.scale = Math.min(w / base, 1.1);
      ctx.cw = w / ctx.scale;
      ctx.vh = h / ctx.scale;
      on(ctx.canvas, 'narrow', ctx.cw < 540);
      ctx.canvas.style.width = ctx.cw + 'px';
      ctx.canvas.style.height = ctx.vh + 'px';
      ctx.canvas.style.transform = `scale(${ctx.scale})`;
      ctx.canvas.style.setProperty('--vh', ctx.vh + 'px');
      measure();
      spec.measure && spec.measure(ctx);
      ctx.scrollKeys = spec.scroll(ctx);
      render(ctx.t);
    }

    function point(k, t) {
      if (Array.isArray(k.at)) return { x: k.at[0], y: k.at[1] };
      const p = ctx.pos[k.at];
      if (!p) return { x: ctx.cw + 30, y: ctx.vh * 0.8 };
      const y = p.fixed ? p.y : p.y - ctx.scrollAt(t);
      return { x: p.x + p.w * (k.ax ?? 0.55), y: y + p.h * (k.ay ?? 0.6) };
    }
    // scroll offset that puts `top` just under the nav, unless `bottom` would then be cut off
    ctx.fit = (top, bottom, nav, pad = 14) => {
      const a = ctx.pos[top], b = ctx.pos[bottom || top];
      if (!a || !b) return 0;
      const ts = a.y - nav - pad, bf = b.y + b.h - ctx.vh + 12, cap = b.y - nav - pad;
      return Math.max(0, ts, Math.min(bf, cap));
    };
    // smallest scroll that brings element k fully into view
    ctx.reveal = (k) => { const b = ctx.pos[k]; return b ? Math.max(0, b.y + b.h - ctx.vh + 16) : 0; };
    ctx.scrollAt = (t) => {
      const max = Math.max(0, (ctx.pageH || 0) - ctx.vh);
      return Math.min(max, keyed(ctx.scrollKeys, t));
    };

    function render(t) {
      ctx.t = t;
      const y = ctx.scrollAt(t);
      ctx.page.style.transform = `translate3d(0,${-y.toFixed(2)}px,0)`;
      // cursor: eased between keyframes, each glued to its element while the page scrolls
      const ks = spec.cursor;
      let i = ks.findIndex((k) => k.t > t);
      if (i === -1) i = ks.length;
      const a = ks[Math.max(0, i - 1)], b = ks[Math.min(ks.length - 1, i)];
      const pa = point(a, t), pb = point(b, t);
      const p = a === b ? 0 : ease(seg(t, a.t, b.t));
      const down = spec.clicks.some((c) => t >= c && t < c + 0.18);
      const vis = !RM.matches && t > spec.cursorIn[0] && t < spec.cursorIn[1];
      ctx.cursor.style.transform = `translate3d(${lerp(pa.x, pb.x, p).toFixed(1)}px,${lerp(pa.y, pb.y, p).toFixed(1)}px,0) scale(${down ? 0.82 : 1})`;
      ctx.cursor.style.opacity = vis ? 1 : 0;
      spec.frame(ctx, t, y);
    }

    // ---- loop + pausing ----
    let raf = 0, last = 0, inView = false;
    const tick = (now) => {
      raf = 0;
      if (!stage.isConnected) return cleanup();
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
      last = now;
      render((ctx.t + dt) % spec.loop);
      schedule();
    };
    const schedule = () => {
      if (RM.matches) { stop(); render(spec.still); return; }
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; };
    const onVis = () => { if (!stage.isConnected) return cleanup(); if (document.hidden) stop(); else schedule(); };
    const onRM = () => { stop(); if (!RM.matches) ctx.t = 0; schedule(); };

    const ro = window.ResizeObserver ? new ResizeObserver(() => layout()) : null;
    const io = window.IntersectionObserver ? new IntersectionObserver((es) => {
      if (!stage.isConnected) return cleanup();
      inView = es[es.length - 1].isIntersecting;
      if (inView) schedule(); else stop();
    }, { rootMargin: '80px' }) : null;
    function cleanup() {
      stop();
      ro && ro.disconnect();
      io && io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      RM.removeEventListener && RM.removeEventListener('change', onRM);
    }
    ro && ro.observe(ctx.body);
    if (io) io.observe(stage); else inView = true;
    document.addEventListener('visibilitychange', onVis);
    RM.addEventListener && RM.addEventListener('change', onRM);
    if (!RM.matches) ctx.t = 0;
    stage.__vmSeek = (t) => render(((t % spec.loop) + spec.loop) % spec.loop); // test hook
    requestAnimationFrame(() => { layout(); schedule(); });
    // fonts can shift measurements a hair after first paint
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => stage.isConnected && layout());
  }

  // ======================================================================
  // G360 Technologies
  // ======================================================================
  const G_LOGO = '<svg viewBox="59 26 74 22" fill="none" aria-label="G360" class="g-logo"><path d="M115.334 44.9819C117.086 46.3592 119.296 47.1808 121.697 47.1808C127.387 47.1808 132 42.5681 132 36.8779C132 31.1878 127.387 26.575 121.697 26.575C117.476 26.575 113.847 29.1139 112.256 32.748C112.948 33.1154 113.582 33.5673 114.152 34.1042C114.562 34.4906 114.928 34.9114 115.248 35.3651C115.932 32.4362 118.56 30.2546 121.697 30.2546C125.355 30.2546 128.321 33.2199 128.321 36.8779C128.321 40.5359 125.355 43.5013 121.697 43.5013C119.71 43.5013 117.928 42.6263 116.714 41.2407C116.575 42.4086 116.203 43.5181 115.601 44.557L115.598 44.562L115.596 44.567C115.512 44.7084 115.425 44.8467 115.334 44.9819ZM114.204 43.9487C114.234 43.8996 114.265 43.85 114.294 43.7999C114.942 42.6813 115.265 41.4744 115.265 40.1791C115.265 39.1784 115.069 38.256 114.677 37.4121C114.304 36.5682 113.784 35.8323 113.116 35.2043C112.702 34.8141 112.246 34.477 111.748 34.1929C111.517 35.049 111.395 35.949 111.395 36.8779C111.395 39.6155 112.462 42.1037 114.204 43.9487Z" fill="currentColor" fill-rule="evenodd"/><path d="M98.2137 36.768C97.8517 36.4508 97.436 36.1847 96.9669 35.9697C96.0446 35.5183 94.9849 35.2436 93.7879 35.1453L93.4346 35.116L98.5271 29.8762C98.6253 29.778 98.7136 29.6603 98.7921 29.5229C98.8706 29.3856 98.9098 29.2285 98.9098 29.052V27.2857C98.9098 27.0699 98.841 26.8932 98.7037 26.7558C98.5664 26.6185 98.3897 26.5498 98.1739 26.5498H85.5455C85.3296 26.5498 85.153 26.6185 85.0156 26.7558C84.8979 26.8932 84.839 27.0699 84.839 27.2857V29.2285C84.839 29.4248 84.8979 29.5917 85.0156 29.729C85.153 29.8664 85.3296 29.9351 85.5455 29.9351H93.9644L88.6953 35.0866C88.5972 35.1847 88.499 35.3122 88.4009 35.4692C88.3223 35.6066 88.2832 35.7734 88.2832 35.9697V37.206C88.2832 37.4219 88.3518 37.5986 88.4892 37.7359C88.6266 37.8536 88.8032 37.9125 89.0191 37.9125H92.0511C93.2089 37.9125 94.1116 38.148 94.7592 38.619C95.4068 39.0703 95.7306 39.8162 95.7306 40.8562C95.7306 41.8963 95.3774 42.7009 94.6709 43.2701C93.984 43.8195 93.0519 44.0943 91.8745 44.0943C91.2856 44.0943 90.7264 44.0354 90.1965 43.9178C89.6667 43.7802 89.1957 43.5546 88.7836 43.2406C88.3911 42.9267 88.1066 42.5047 87.9299 41.9748C87.8318 41.7393 87.714 41.5823 87.5766 41.5038C87.4393 41.4253 87.2725 41.3861 87.0762 41.3861H84.4269C84.2503 41.3861 84.0933 41.4449 83.9559 41.5628C83.8382 41.6608 83.7793 41.7982 83.7793 41.9748C83.7989 42.6028 83.9756 43.2406 84.3092 43.8883C84.6428 44.5163 85.1335 45.105 85.7809 45.6545C86.4483 46.1843 87.2823 46.6161 88.2832 46.9496C89.284 47.2833 90.4713 47.4501 91.845 47.4501C93.415 47.4501 94.8083 47.195 96.025 46.6848C97.144 46.2155 98.039 45.5636 98.7098 44.7291L98.6929 44.7017C97.8743 43.3536 97.4726 41.8533 97.4726 40.238C97.4726 39.4981 97.5684 38.774 97.7625 38.0701C97.8859 37.6227 98.0362 37.1885 98.2137 36.768ZM99.3088 38.1661C99.2772 38.2671 99.2472 38.3689 99.2189 38.4718C99.0619 39.041 98.9833 39.6297 98.9833 40.238C98.9833 41.294 99.1863 42.2724 99.592 43.1732C99.8241 42.5307 99.94 41.8271 99.94 41.0623C99.94 39.9254 99.7297 38.9601 99.3088 38.1661Z" fill="currentColor" fill-rule="evenodd"/><path d="M107.168 47.4501C105.48 47.4501 104.028 47.1361 102.811 46.5081C101.595 45.8605 100.653 44.9971 99.9853 43.9178C99.318 42.8187 98.9844 41.5921 98.9844 40.238C98.9844 39.6297 99.0629 39.041 99.2199 38.4718C99.3769 37.9027 99.583 37.363 99.8381 36.8528C100.093 36.3425 100.339 35.8912 100.574 35.4986C100.829 35.0866 101.055 34.7627 101.251 34.5272L106.638 27.1385C106.716 27.0404 106.834 26.9227 106.991 26.7853C107.148 26.6283 107.364 26.5498 107.639 26.5498H110.376C110.553 26.5498 110.7 26.6185 110.818 26.7558C110.936 26.8736 110.995 27.0208 110.995 27.1974C110.995 27.2759 110.975 27.3544 110.936 27.4329C110.916 27.4918 110.887 27.5408 110.847 27.5801L106.726 33.2909C106.903 33.2321 107.109 33.1928 107.344 33.1731C107.58 33.1535 107.796 33.1437 107.992 33.1437C108.973 33.1633 109.905 33.3596 110.789 33.7324C111.672 34.0857 112.447 34.5763 113.114 35.2043C113.781 35.8323 114.301 36.5682 114.674 37.4121C115.067 38.256 115.263 39.1784 115.263 40.1791C115.263 41.4744 114.939 42.6813 114.292 43.7999C113.644 44.8989 112.712 45.782 111.495 46.4492C110.298 47.1165 108.856 47.4501 107.168 47.4501ZM107.138 44.0649C107.845 44.0649 108.492 43.9178 109.081 43.6232C109.69 43.3289 110.18 42.8972 110.553 42.3281C110.926 41.7589 111.112 41.0525 111.112 40.2086C111.112 39.3843 110.926 38.6877 110.553 38.1185C110.18 37.5495 109.69 37.1177 109.081 36.8234C108.492 36.529 107.845 36.3818 107.138 36.3818C106.432 36.3818 105.774 36.529 105.166 36.8234C104.577 37.1177 104.097 37.5495 103.724 38.1185C103.351 38.6877 103.164 39.3843 103.164 40.2086C103.164 41.0525 103.351 41.7589 103.724 42.3281C104.097 42.8972 104.577 43.3289 105.166 43.6232C105.774 43.9178 106.432 44.0649 107.138 44.0649Z" fill="currentColor" fill-rule="evenodd"/><path d="M74.8396 36.387C74.9954 36.073 75.3398 35.8965 75.6903 35.8965H81.5988C81.9494 35.8965 82.2938 36.073 82.4496 36.387C82.8165 37.1268 82.2878 37.859 81.5883 37.859H75.7008C75.0014 37.859 74.4727 37.1268 74.8396 36.387Z" fill="currentColor"/><path d="M60 36.8779C60 31.197 64.622 26.575 70.3029 26.575C74.1339 26.575 77.6261 28.6845 79.4166 32.08C79.67 32.5591 79.4859 33.1533 79.0064 33.4052C78.5274 33.6582 77.9338 33.4747 77.6812 32.9951C76.2304 30.2455 73.4036 28.5374 70.3029 28.5374C65.7039 28.5374 61.9625 32.2789 61.9625 36.8779C61.9625 41.477 65.7039 45.2184 70.3029 45.2184C73.4036 45.2184 76.2304 43.5103 77.6812 40.7607C77.9338 40.2811 78.5274 40.0975 79.0064 40.3506C79.4859 40.6026 79.67 41.1967 79.4166 41.6758C77.6261 45.0714 74.1339 47.181 70.3029 47.181C64.622 47.181 60 42.5588 60 36.8779Z" fill="currentColor"/></svg>';
  const gi = (d) => `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const G_ICONS = {
    alert: gi('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>'),
    eyeoff: gi('<path d="M10.7 5.1A10.7 10.7 0 0 1 22 12a13 13 0 0 1-1.7 2.7M14.1 14.2a3 3 0 0 1-4.2-4.2M17.5 17.5A10.7 10.7 0 0 1 2 12a13.2 13.2 0 0 1 4.4-5.4M2 2l20 20"/>'),
    branch: gi('<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M6 16.5V9a4 4 0 0 1 4-4h5.5"/>'),
    bug: gi('<path d="M8 2l1.9 1.9M14.1 3.9 16 2M9 7.1V6a3 3 0 1 1 6 0v1.1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6M12 20v-9M6.5 13H3M21 13h-3.5M6 9.5 3.5 8M18 9.5 20.5 8M6 17l-2.5 1.5M18 17l2.5 1.5"/>'),
    scan: gi('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10M12 7v10"/>'),
    list: gi('<path d="m3 7 2 2 4-4M13 7h8M13 17h8"/><circle cx="6" cy="17" r="2"/>'),
    filter: gi('<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>'),
    spark: gi('<path d="m3 17 5-5 4 4 8-8M16 4h4v4"/>'),
    shield: gi('<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'),
    up: gi('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  };
  const PROMPT = [
    ['Draft a claim summary for '], ['Jane Doe', 'NAME'], [', SSN '], ['482-19-7730', 'SSN'],
    [', paid to card '], ['4111 1111 1111 1111', 'CARD'], ['.'],
  ];
  const PROMPT_LEN = PROMPT.reduce((n, p) => n + p[0].length, 0);
  const FINDINGS = [
    ['high', 'HIGH', 'Unsanitized SQL query', 'api/orders.ts:42'],
    ['med', 'MED', 'Auth path never tested', 'lib/session.ts:118'],
    ['med', 'MED', 'Hardcoded API key', 'config/stripe.ts:7'],
    ['low', 'LOW', 'Unhandled promise rejection', 'jobs/sync.ts:63'],
  ];
  const G = { // timeline (seconds)
    loop: 15.5, typeA: 4.9, typeB: 6.6, send: 6.95, flag: 7.35, mask: 8.0, reply: 8.5,
    cmdA: 10.7, cmdB: 11.4, scan: 11.55, find: [12.0, 12.4, 12.8, 13.2], sum: 13.6,
  };

  window.CVVisuals.g360 = (stage) => mount(stage, {
    name: 'g360', url: 'g360technologies.com', loop: G.loop, still: 9.2,
    label: 'Animated recreation of the G360 Technologies website: the hero, PromptVault masking sensitive data in a prompt, and RepoAudit findings.',
    nav: `<header class="g-nav">${G_LOGO}<nav><span>Products${CHEV}</span><span>Services${CHEV}</span><span class="g-hide-n">Company${CHEV}</span></nav><span class="g-btn g-btn-o" data-k="navcta">Book a demo${ARROW}</span></header>`,
    page: `
      <section class="g-hero">
        <svg class="g-arcs" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-40 120 Q300 -40 640 120" /><path d="M-40 250 Q300 90 640 250" /><path d="M-40 380 Q300 220 640 380"/><path d="M300 0V330" />
        </svg>
        <div class="g-chips">
        <span class="g-chip" style="left:44%;top:14%">${G_ICONS.alert}Sensitive data at risk</span>
        <span class="g-chip" style="left:5%;top:35%">${G_ICONS.eyeoff}Untracked AI interaction</span>
        <span class="g-chip" style="left:52%;top:57%">${G_ICONS.branch}Code path never tested</span>
        <span class="g-chip" style="left:17%;top:80%">${G_ICONS.bug}Hidden code vulnerability</span>
        </div>
        <div class="g-hero-copy">
          <h1>Scale AI with confidence.</h1>
          <p>G360 helps enterprises adopt AI securely, ship software they can trust, and build Azure environments for what comes next.</p>
          <span class="g-btn g-btn-d g-cta" data-k="cta">Book a demo${ARROW}</span>
        </div>
      </section>
      <div class="g-frame">
        <h2 class="g-h2">AI security, from prompt to codebase</h2>
        <section class="g-prod g-pv" data-k="pv">
          <div class="g-prod-text">
            <p class="g-eyebrow">PromptVault</p>
            <h3>Use AI without exposing sensitive data</h3>
            <p class="g-p">PromptVault enforces security guardrails across every AI interaction, so confidential information never gets leaked.</p>
            <div class="g-row"><span class="g-btn g-btn-o">Try PromptVault yourself${ARROW}</span></div>
          </div>
          <div class="g-chat" data-k="chat">
            <span class="g-badge">${G_ICONS.shield}Guardrail Active</span>
            <div class="g-msgs">
              <div class="g-bubble"><span class="g-btext">${PROMPT.map(([s, r]) => r ? `<span class="g-sens"><span class="g-raw">${s}</span><span class="g-tok">[${r}]</span></span>` : `<span>${s}</span>`).join('')}</span><i class="g-av"></i></div>
              <div class="g-reply">${G_ICONS.shield}<span><b>3 fields masked</b> before reaching the model</span></div>
            </div>
            <div class="g-input"><span class="g-ghost" aria-hidden="true">${PROMPT.map(([s]) => s).join('')}</span><span class="g-typed"><span class="g-ph">Ask anything</span><span class="g-caret"></span></span><span class="g-plus">+</span><span class="g-send" data-k="send">${G_ICONS.up}</span></div>
          </div>
        </section>
        <div class="g-feats">
          <div>${G_ICONS.scan}<p>Prompts get inspected before they hit the AI model</p></div>
          <div>${G_ICONS.list}<p>Tasks move forward, but data stays protected</p></div>
          <div>${G_ICONS.filter}<p>AI responses are inspected and filtered before reaching you</p></div>
          <div>${G_ICONS.spark}<p>Provide valuable insights into every interaction</p></div>
        </div>
        <section class="g-prod g-ra" data-k="ra">
          <div class="g-prod-text">
            <p class="g-eyebrow">RepoAudit</p>
            <h3>Find the flaws your scanners can’t</h3>
            <p class="g-p">An autonomous agent that audits entire repositories, surfacing the vulnerabilities, testing gaps, and bugs static analysis misses. No compilation required.</p>
            <span class="g-link" data-k="ralink">Explore RepoAudit${ARROW}</span>
          </div>
          <div class="g-term" data-k="term">
            <div class="g-tdots"><i></i><i></i><i></i></div>
            <div class="g-tbody">
              <div class="g-cmd">$ <span class="g-cmdt"></span><span class="g-tcaret"></span></div>
              <div class="g-tl g-scan">Scanning 1,284 files<span class="g-prog"><i></i></span></div>
              ${FINDINGS.map(([c, l, title, path]) => `<div class="g-tl g-find"><span class="g-sev g-${c}">${l}</span><span class="g-ft">${title}</span><span class="g-fp">${path}</span></div>`).join('')}
              <div class="g-tl g-sum">✓ 4 findings · 1,284 files · 38s</div>
            </div>
          </div>
        </section>
      </div>
      <section class="g-dark">
        <div class="g-dark-head"><h2>Solutions built for operational excellence</h2><p>G360 Technologies helps enterprises streamline operations, secure AI adoption, and accelerate growth through modern cloud and data solutions.</p></div>
        <div class="g-cards">
          <div><i class="g-orb">${G_ICONS.spark}</i><b>AI Implementation</b><p>Helping organizations optimize AI across internal systems and workflows.</p></div>
          <div><i class="g-orb">${G_ICONS.shield}</i><b>Cloud &amp; AI Security</b><p>Identities, workloads, and data protected across Azure and Microsoft 365.</p></div>
          <div><i class="g-orb">${G_ICONS.filter}</i><b>Data Engineering &amp; Analytics</b><p>Pipelines and analytics that make your data usable and governable.</p></div>
        </div>
      </section>`,
    scroll: (c) => {
      const top = c.reveal('cta');
      const pv = c.fit('pv', 'chat', 46), ra = c.fit('ra', 'term', 46);
      return [[0, top], [3.7, top], [4.7, pv], [9.5, pv], [10.5, ra], [14.2, ra], [15.2, 0]];
    },
    cursor: [
      { t: 0.9, at: [640, 420] }, { t: 2.0, at: 'cta' }, { t: 3.6, at: 'cta', ax: 0.8 },
      { t: 4.7, at: 'send', ax: -4, ay: 1.2 }, { t: 6.4, at: 'send', ax: -2, ay: 1.4 }, { t: 6.9, at: 'send' },
      { t: 9.3, at: 'send', ax: 1.2, ay: 2 }, { t: 10.5, at: 'ralink', ax: 0.45 }, { t: 13.4, at: 'ralink', ax: 0.5 },
      { t: 14.6, at: [660, 300] },
    ],
    cursorIn: [0.95, 14.5],
    clicks: [G.send],
    init(c) {
      c.chips = c.qa('.g-chip');
      c.cta = c.q('.g-cta');
      c.typed = c.q('.g-typed');
      c.ph = c.q('.g-ph');
      c.input = c.q('.g-input');
      c.bubble = c.q('.g-bubble');
      c.sens = c.qa('.g-sens');
      c.reply = c.q('.g-reply');
      c.send = c.q('.g-send');
      c.cmd = c.q('.g-cmdt');
      c.scan = c.q('.g-scan');
      c.prog = c.q('.g-prog i');
      c.finds = c.qa('.g-find');
      c.sum = c.q('.g-sum');
      c.term = c.q('.g-term');
      c.ralink = c.q('.g-link');
      c.typedNode = document.createElement('span');
      // typed text goes before the caret, so the caret follows it
      c.typed.insertBefore(c.typedNode, c.typed.querySelector('.g-caret'));
    },
    frame(c, t) {
      // hero chips: staggered fade-up, then a slow float
      c.chips.forEach((ch, i) => {
        const a = ease(seg(t, 0.15 + i * 0.22, 0.75 + i * 0.22)) * (1 - seg(t, 14.0, 14.5));
        const f = Math.sin(t * 1.1 + i * 1.7) * 2.5;
        ch.style.opacity = a.toFixed(3);
        ch.style.transform = `translate3d(0,${(f + (1 - a) * 10).toFixed(2)}px,0)`;
      });
      on(c.cta, 'is-hover', t > 1.95 && t < 3.7);
      // PromptVault: type, send, flag, mask
      const n = Math.round(PROMPT_LEN * seg(t, G.typeA, G.typeB));
      const sent = t >= G.send;
      let s = '';
      if (!sent) { let left = n; for (const [p] of PROMPT) { s += p.slice(0, Math.max(0, left)); left -= p.length; } }
      txt(c.typedNode, s);
      on(c.ph, 'hide', s.length > 0);
      on(c.input, 'is-typing', t > G.typeA - 0.3 && !sent);
      on(c.send, 'is-ready', s.length > 0);
      on(c.bubble, 'show', sent);
      c.sens.forEach((el, i) => {
        on(el, 'flag', t >= G.flag + i * 0.12);
        on(el, 'mask', t >= G.mask + i * 0.12);
      });
      on(c.reply, 'show', t >= G.reply);
      // RepoAudit terminal
      const cmd = 'repoaudit scan ./my-repo';
      txt(c.cmd, cmd.slice(0, Math.round(cmd.length * seg(t, G.cmdA, G.cmdB))));
      on(c.term, 'is-running', t >= G.cmdB && t < G.sum);
      on(c.scan, 'show', t >= G.scan);
      c.prog.style.transform = `scaleX(${seg(t, G.scan, G.sum).toFixed(3)})`;
      c.finds.forEach((el, i) => on(el, 'show', t >= G.find[i]));
      on(c.sum, 'show', t >= G.sum);
      on(c.ralink, 'is-hover', t > 10.5 && t < 13.4);
    },
  });

  // ======================================================================
  // Less
  // ======================================================================
  const L_LOGO = '<svg viewBox="0 0 104 37" fill="none" aria-label="Less" class="l-logo"><path d="M50.4173 6.92353H47.529V29.1048H60.28V26.4898H50.4173V6.92353Z" fill="currentColor"/><path d="M75.6325 20.8369C75.6422 20.6372 75.6475 20.4449 75.6475 20.2599C75.6475 18.6193 75.3384 17.1785 74.7197 15.9373C74.1009 14.6968 73.2279 13.7378 72.1006 13.061C70.9733 12.3841 69.6713 12.0456 68.1945 12.0456C66.7178 12.0456 65.3486 12.3941 64.1463 13.0918C62.944 13.7894 61.996 14.7994 61.303 16.1223C60.6092 17.4452 60.263 18.9833 60.263 20.7371C60.263 22.4909 60.5969 23.9418 61.2658 25.2748C61.9341 26.6078 62.8769 27.6412 64.0941 28.3744C65.3114 29.1075 66.723 29.4741 68.3295 29.4741C69.4868 29.4741 70.5371 29.2844 71.4799 28.9051C72.4227 28.5258 73.2207 27.9977 73.8747 27.3208C74.528 26.644 75.3873 25.5905 75.6475 24.106L73.194 23.5525C72.9586 24.5993 72.5355 25.0805 72.0869 25.5523C71.6377 26.0241 71.1063 26.3906 70.4928 26.652C69.8793 26.9134 69.2084 27.0441 68.4801 27.0441C67.4825 27.0441 66.5893 26.8336 65.8011 26.4134C65.0128 25.9932 64.3745 25.3673 63.8855 24.537C63.3965 23.7066 63.1018 22.7121 63.0027 21.5527H75.5738C75.6038 21.2759 75.6233 21.0373 75.6338 20.8376ZM63.0314 19.2909C63.1611 18.1831 63.4702 17.2529 63.9592 16.4989C64.4482 15.745 65.0565 15.1861 65.7848 14.8222C66.513 14.4583 67.3013 14.276 68.1489 14.276C69.0864 14.276 69.9073 14.4837 70.6108 14.8992C71.3143 15.3147 71.8607 15.9045 72.2493 16.6685C72.6385 17.4325 72.853 18.307 72.8928 19.2909H63.0314Z" fill="currentColor"/><path d="M87.4251 20.3598C86.6068 19.9751 85.4893 19.6393 84.0732 19.3525C83.0554 19.1374 82.2697 18.9296 81.7162 18.7293C81.1627 18.5289 80.776 18.2782 80.5563 17.9753C80.3366 17.6731 80.2271 17.2703 80.2271 16.7677C80.2271 16.265 80.3568 15.8676 80.6163 15.5138C80.8758 15.1599 81.252 14.8858 81.7462 14.6908C82.2404 14.4965 82.8259 14.3986 83.5046 14.3986C84.482 14.3986 85.2754 14.6627 85.8844 15.1907C86.4927 15.7188 86.9022 16.4701 87.1114 17.4439L89.6705 16.8903C89.5206 15.8857 89.1789 15.0192 88.6456 14.2907C88.1116 13.5629 87.4062 13.006 86.5279 12.622C85.6497 12.2373 84.6326 12.045 83.4753 12.045C82.318 12.045 81.2005 12.2554 80.2727 12.6756C79.3449 13.0965 78.6388 13.6835 78.155 14.4368C77.6712 15.1907 77.4294 16.0647 77.4294 17.0599C77.4294 17.9726 77.6139 18.7286 77.9829 19.3284C78.3519 19.9282 78.9283 20.4154 79.7113 20.79C80.4944 21.1646 81.5643 21.4897 82.9211 21.7665C83.9786 21.9923 84.7917 22.2182 85.3602 22.4433C85.9287 22.6692 86.3375 22.9486 86.5873 23.2817C86.8363 23.6148 86.9615 24.0638 86.9615 24.6274C86.9615 25.3968 86.6525 26.0066 86.0337 26.4577C85.415 26.9094 84.5524 27.1345 83.4446 27.1345C82.3369 27.1345 81.3817 26.8189 80.6984 26.1882C80.0152 25.5576 79.5738 24.6784 79.3743 23.5505L76.7852 24.104C77.0845 25.8471 77.8127 27.1808 78.97 28.1036C80.1273 29.0264 81.6191 29.4882 83.4446 29.4882C84.8014 29.4882 85.9587 29.2596 86.9165 28.8039C87.8743 28.3475 88.5973 27.7223 89.0863 26.9274C89.5753 26.1326 89.8198 25.2071 89.8198 24.1509C89.8198 23.2181 89.6255 22.4487 89.2363 21.8435C88.8471 21.2384 88.2433 20.7438 87.4257 20.3591Z" fill="currentColor"/><path d="M103.416 21.8449C103.027 21.2397 102.423 20.7451 101.606 20.3605C100.788 19.9758 99.6701 19.64 98.254 19.3532C97.2362 19.1381 96.4506 18.9303 95.897 18.7299C95.3435 18.5295 94.9569 18.2789 94.7371 17.976C94.5174 17.6737 94.4079 17.271 94.4079 16.7683C94.4079 16.2657 94.5376 15.8683 94.7971 15.5144C95.0566 15.1606 95.4328 14.8865 95.927 14.6915C96.4212 14.4971 97.0067 14.3993 97.6854 14.3993C98.6628 14.3993 99.4563 14.6633 100.065 15.1914C100.674 15.7195 101.083 16.4708 101.292 17.4445L103.851 16.891C103.701 15.8864 103.36 15.0199 102.826 14.2914C102.292 13.5636 101.587 13.0067 100.709 12.6227C99.8305 12.238 98.8134 12.0456 97.6561 12.0456C96.4988 12.0456 95.3813 12.2561 94.4535 12.6763C93.5257 13.0971 92.8196 13.6842 92.3358 14.4375C91.8521 15.1914 91.6102 16.0653 91.6102 17.0605C91.6102 17.9733 91.7947 18.7293 92.1637 19.3291C92.5327 19.9289 93.1091 20.4161 93.8921 20.7907C94.6752 21.1653 95.7451 21.4904 97.1019 21.7671C98.1594 21.993 98.9725 22.2188 99.541 22.444C100.11 22.6699 100.518 22.9493 100.768 23.2824C101.017 23.6155 101.142 24.0645 101.142 24.6281C101.142 25.3975 100.833 26.0073 100.215 26.4583C99.5958 26.91 98.7332 27.1352 97.6255 27.1352C96.5177 27.1352 95.5626 26.8196 94.8793 26.1889C94.196 25.5583 93.7546 24.679 93.5551 23.5511L90.966 24.1047C91.2653 25.8478 91.9935 27.1814 93.1508 28.1043C94.3081 29.0271 95.7999 29.4888 97.6255 29.4888C98.9823 29.4888 100.14 29.2603 101.097 28.8046C102.055 28.3482 102.778 27.7229 103.267 26.9281C103.756 26.1333 104.001 25.2078 104.001 24.1516C104.001 23.2187 103.806 22.4494 103.417 21.8442Z" fill="currentColor"/><path d="M14.4195 36.0284H17.2661V25.6146L14.4195 23.9258V36.0284Z" fill="currentColor"/><path d="M0 29.1048L11.5729 22.2356V18.8573L0 25.7265V29.1048Z" fill="currentColor"/><path d="M0 10.3019L11.5729 17.1711V13.7921L0 6.92353V10.3019Z" fill="currentColor"/><path d="M17.2661 0H14.4195V12.1361L17.2661 10.4466V0Z" fill="currentColor"/><path d="M15.8428 19.7037L31.6855 29.1048V25.7265L18.6894 18.0142L31.6855 10.3019V6.92353L15.8421 16.3253L15.8428 19.7037Z" fill="currentColor"/></svg>';
  const li = (d, w = 1.8) => `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const L_ICONS = {
    filter: li('<path d="M4 6h16M7 12h10M10 18h4"/>'),
    calc: li('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>'),
    group: li('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'),
    rows: li('<path d="M4 6h16M4 12h10M4 18h16M18 10v4M16 12h4"/>'),
    ifcol: li('<circle cx="5" cy="12" r="2"/><path d="M7 12h4l6-5h3M11 12l6 5h3"/>'),
    combine: li('<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>'),
    db: li('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
    refresh: li('<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/>'),
    plus: li('<path d="M12 5v14M5 12h14"/>'),
    clock: li('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    enter: li('<path d="M9 10 4 15l5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>'),
  };
  const SRC = {
    snowflake: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#29b5e8" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 3.5 12 6l3-2.5M9 20.5 12 18l3 2.5"/></svg>',
    sheets: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5 2h10l5 5v15H5z" fill="#0f9d58"/><path d="M8 11h9v7H8zM8 14.5h9M12.5 11v7" fill="none" stroke="#fff" stroke-width="1.3"/></svg>',
    shopify: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5 7.5 15.5 5l3 16.5L6 22z" fill="#95bf47"/><path d="M8 7c0-3 1.4-4.5 3-4.5S14 4 14 6.5" fill="none" stroke="#95bf47" stroke-width="1.6"/><path d="M13.5 10.2c-.6-.3-1.3-.4-1.8-.3-1.4.2-1.6 1.6-.4 2.3 1.4.8 1.6 2.6-.2 3.1-.7.2-1.5 0-2.2-.4" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>',
    hubspot: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#ff5c35" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="15" cy="14" r="4"/><path d="M15 10V5M5 4l7 7M7 21l5-4"/><circle cx="15" cy="4" r="1.3" fill="#ff5c35"/><circle cx="4.5" cy="3.5" r="1.6" fill="#ff5c35"/></svg>',
    qb: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" fill="#2ca01c"/><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Arial,sans-serif">qb</text></svg>',
    meta: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#0866ff" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M3 15.5c0-4 2-7.5 4.5-7.5 3 0 5.5 8 9 8 2 0 3.5-1.5 3.5-4s-1.5-4-3.5-4C13 8 10.5 16 7 16c-2.4 0-4-.5-4-.5"/></svg>',
    mailchimp: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#191919"/><path d="M8 15c0-4 1.5-7 4-7s4 2 4 4.5-1.5 3.5-3 3.5c-1 0-1.5-.6-1.5-1.4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
  };
  // Hero pipeline rows (y = row centre, % of the canvas height). Each row is a
  // flex line (source, nodes, tail) so the gaps hold at any width; the packets
  // run along the wire and pass under the pills.
  const PIPE = [
    { y: 18, src: 'snowflake', nodes: [['Filter', 'filter', 'beige'], ['Calculate', 'calc', 'blue']] },
    { y: 50, src: 'sheets', nodes: [['Group by', 'group', 'mint']] },
    { y: 82, src: 'shopify', nodes: [['Create rows', 'rows', 'beige'], ['IF Column', 'ifcol', 'blue']] },
  ];
  // "Get the data" panel: sources wiring into Combine, in a 300x250 box.
  const GET = [
    ['mailchimp', 80, 34], ['hubspot', 44, 79], ['snowflake', 68, 124], ['qb', 50, 169], ['meta', 74, 214],
  ];
  const CX = 150, CY = 124; // Combine port
  const BUDGET = [
    ['Acme Corp', 84200, 91450], ['Capsule Co', 53100, 58900], ['Prestige WW', 29400, 33250],
    ['Umbrella Co', 128600, 131800], ['Initech', 47900, 52300],
  ];
  function getPath(x, y) {
    const sx = x + 10, mx = 128, d = Math.abs(y - CY);
    if (d < 1) return `M${sx} ${y}H${CX}`;
    const r = Math.min(16, d / 2), dir = y < CY ? 1 : -1;
    return `M${sx} ${y}H${mx - r}Q${mx} ${y} ${mx} ${y + dir * r}V${CY - dir * r}Q${mx} ${CY} ${mx + r} ${CY}H${CX}`;
  }
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const L = { loop: 15.5, getA: 7.0, getB: 8.9, combine: 9.0, tab: 10.2, askA: 10.6, askB: 11.8, enter: 12.0, refresh: 12.3 };
  const ASK = 'Can you update the budgets for Q4?';

  window.CVVisuals.less = (stage) => mount(stage, {
    name: 'less', url: 'less.tech', loop: L.loop, still: 9.6,
    label: 'Animated recreation of the Less website: data flowing through the hero pipeline, sources wiring into Combine, and a table refreshing itself.',
    nav: `<header class="l-nav"><span class="l-brand">${L_LOGO}</span><nav><span>Product${CHEV}</span><span class="l-hide-n">Resources${CHEV}</span><span>Pricing</span></nav><span class="l-pill l-pill-o">Book a Demo</span></header>`,
    page: `
      <section class="l-hero">
        <span class="l-update">Updates to Draft and Publish <b>Check${ARROW}</b></span>
        <h1>Less time wrangling data. More time getting answers from it.</h1>
        <div class="l-hero-side">
          <p>Stop manually exporting data, cleaning it in spreadsheets, and pasting it into reports. Build the workflow once and rerun it every Monday, every close, and every board meeting.</p>
          <span class="l-pill l-pill-d l-cta" data-k="cta">${ARROW}Book a Demo</span>
        </div>
      </section>
      <section class="l-pipe" data-k="pipe">
        <div class="l-canvas l-dots">
          ${PIPE.map((r) => `
            <div class="l-row" style="top:${r.y}%"><i class="l-line"></i><i class="l-packet"></i><i class="l-packet"></i>
              <span class="l-src">${SRC[r.src]}<i class="l-port"></i></span>
              ${r.nodes.map(([label, ic, tone]) => `<span class="l-node l-${tone}"><i class="l-dot"></i>${L_ICONS[ic]}${label}<i class="l-dot"></i></span>`).join('')}
              <i class="l-tail"></i>
            </div>`).join('')}
        </div>
        <div class="l-peach l-dots">
          <div class="l-out"><span class="l-out-h">${L_ICONS.db}Output</span><b class="l-count">0</b><span class="l-out-s">rows ready</span></div>
        </div>
      </section>
      <p class="l-trust">Fast-moving teams rely on Less</p>
      <section class="l-feat" data-k="feat">
        <p class="l-eyebrow">FEATURES</p>
        <h2>Let Less handle the wrangle</h2>
        <div class="l-tabs"><span class="l-tab on" data-k="tabget">Get the data</span><span class="l-tab">Work the data</span><span class="l-tab l-hide-n">Send the data out</span><span class="l-tab" data-k="tabref">Refresh the data</span><i class="l-tabhl"></i></div>
        <div class="l-panels" data-k="panels">
          <div class="l-panel l-p-get on">
            <div class="l-ptext">
              <p class="l-plabel l-violet">${L_ICONS.db}Get the data</p>
              <h3>Less will fetch it for you.</h3>
              <p class="l-pbody">CRM, spreadsheets, accounting software, databases… Less connects to them all. Hook it up once and data keeps getting extracted for whatever you need.</p>
              <p class="l-plink">${ARROW}Plug in 100+ sources right out of the box</p>
            </div>
            <div class="l-pvis l-lilac l-dots">
              <svg class="l-wires" viewBox="0 0 300 250" preserveAspectRatio="none" aria-hidden="true">
                ${GET.map(([, x, y]) => `<path class="l-draw" pathLength="1" d="${getPath(x, y)}"/>`).join('')}
              </svg>
              ${GET.map(([s, x, y]) => `<span class="l-srcw" style="left:${(x / 300) * 100}%;top:${(y / 250) * 100}%">${SRC[s]}<i class="l-dot"></i></span>`).join('')}
              <span class="l-node l-combine" style="left:${(CX / 300) * 100}%;top:${(CY / 250) * 100}%"><i class="l-dot"></i>${L_ICONS.combine}Combine<i class="l-dot l-dot-o"></i></span>
            </div>
          </div>
          <div class="l-panel l-p-ref">
            <div class="l-ptext">
              <p class="l-plabel l-sienna">${L_ICONS.refresh}Refresh the data</p>
              <h3>Fresh data forever.</h3>
              <p class="l-pbody">Set a schedule, and Less automatically reruns everything, so you’re always working with the latest numbers.</p>
              <p class="l-plink">${ARROW}Schedule every hour or at 3:33am on Leap Year</p>
            </div>
            <div class="l-pvis l-sand l-dots">
              <div class="l-table"><div class="l-tr l-th"><span>Company</span><span>Budget</span></div>
                ${BUDGET.map(([n, a]) => `<div class="l-tr"><span>${n}</span><span class="l-val">${money(a)}</span></div>`).join('')}
              </div>
              <div class="l-ask"><span class="l-askt"></span><span class="l-askc"></span><div class="l-askbar">${L_ICONS.plus}${L_ICONS.clock}<span class="l-enter">${L_ICONS.enter}</span></div></div>
            </div>
          </div>
        </div>
      </section>
      <section class="l-pills-sec"><div class="l-board">
        ${['Append', 'Group by', 'Replace', 'Columns', 'Combine', 'Cumulative', 'Pivot', 'Create rows', 'Loop', 'Transpose', 'Date Transform', 'Directions', 'Describe', 'Transform', 'Stack'].map((p, i) => `<span class="l-bp l-${['sand', 'mint', 'beige', 'blue', 'lilacp'][i % 5]}" style="transform:rotate(${[-8, 9, 10, -6, 11, 0, 0, -7, 0, 5, -8, 0, 0, 0, 0][i]}deg)"><i class="l-dot"></i>${p}<i class="l-dot"></i></span>`).join('')}
      </div></section>`,
    scroll: (c) => {
      const pipe = c.pos.pipe ? c.pos.pipe.y : 300;
      const top = c.reveal('cta');
      const pipeStop = Math.max(0, pipe + (c.pos.pipe ? c.pos.pipe.h : 200) - c.vh + 30);
      const feat = c.fit('feat', 'panels', 52, 6);
      return [[0, top], [3.1, top], [4.1, pipeStop], [5.9, pipeStop], [6.9, feat], [13.7, feat], [14.8, top]];
    },
    cursor: [
      { t: 0.8, at: [620, 380] }, { t: 1.8, at: 'cta' }, { t: 3.0, at: 'cta', ax: 0.75 },
      { t: 4.4, at: 'pipe', ax: 0.9, ay: 0.84 }, { t: 6.4, at: 'pipe', ax: 0.88, ay: 0.88 },
      { t: 8.6, at: 'tabget', ax: 0.9, ay: 2.2 }, { t: 10.0, at: 'tabref' }, { t: 11.2, at: 'tabref', ax: 0.65, ay: 3 },
      { t: 13.4, at: 'tabref', ax: 0.7, ay: 3.4 }, { t: 14.4, at: [640, 300] },
    ],
    cursorIn: [0.85, 14.3],
    clicks: [L.tab],
    init(c) {
      c.cta = c.q('.l-cta');
      c.prow = c.qa('.l-pipe .l-row').map((row) => ({
        row, src: row.querySelector('.l-src'), packets: Array.from(row.querySelectorAll('.l-packet')),
        nodes: Array.from(row.querySelectorAll('.l-node')),
      }));
      c.count = c.q('.l-count');
      c.draws = c.qa('.l-draw');
      c.srcw = c.qa('.l-srcw');
      c.combine = c.q('.l-combine');
      c.tabs = c.qa('.l-tab');
      c.tabhl = c.q('.l-tabhl');
      c.pget = c.q('.l-p-get');
      c.pref = c.q('.l-p-ref');
      c.askt = c.q('.l-askt');
      c.ask = c.q('.l-ask');
      c.vals = c.qa('.l-val');
      c.rows = c.qa('.l-table .l-tr:not(.l-th)');
      c.enter = c.q('.l-enter');
    },
    measure(c) {
      // wire span + pill extents per row, in unscaled canvas px
      c.prow.forEach((r) => {
        r.a = r.src.offsetLeft + r.src.offsetWidth;
        r.b = r.row.offsetWidth;
        r.box = r.nodes.map((n) => [n.offsetLeft, n.offsetLeft + n.offsetWidth]);
      });
      c.tabBox = c.tabs.map((el) => [el.offsetLeft, el.offsetWidth]);
    },
    frame(c, t) {
      on(c.cta, 'is-hover', t > 1.75 && t < 3.1);
      // hero pipeline: packets run along each wire (under the pills); a pill glows while one passes through
      c.prow.forEach((r, ri) => {
        if (r.a == null) return;
        const lit = r.nodes.map(() => false);
        r.packets.forEach((p, i) => {
          const ph = ((t * 0.42 + ri * 0.33 + i * 0.5) % 1);
          const x = r.a + (r.b - r.a) * ph;
          p.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
          p.style.opacity = Math.min(1, Math.min(ph, 1 - ph) * 12).toFixed(2);
          r.box.forEach(([x0, x1], j) => { if (x > x0 - 4 && x < x1 + 4) lit[j] = true; });
        });
        r.nodes.forEach((n, j) => on(n, 'lit', lit[j]));
      });
      txt(c.count, Math.round(1204 * ease(seg(t, 3.6, 6.2)) * (1 - ease(seg(t, 14.6, 15.3)))).toLocaleString('en-US'));
      // Get the data: wires draw in, then Combine goes solid
      c.draws.forEach((d, i) => {
        const p = ease(seg(t, L.getA + i * 0.28, L.getA + i * 0.28 + 0.8));
        d.style.strokeDashoffset = (1 - p).toFixed(3);
        on(c.srcw[i], 'lit', p > 0.02);
      });
      on(c.combine, 'lit', t >= L.combine);
      // tabs
      const ref = t >= L.tab;
      on(c.tabs[0], 'on', !ref);
      on(c.tabs[3], 'on', ref);
      on(c.pget, 'on', !ref);
      on(c.pref, 'on', ref);
      const tb = c.tabBox[ref ? 3 : 0];
      if (tb) c.tabhl.style.transform = `translate3d(${tb[0]}px,0,0) scaleX(${tb[1] / 100})`;
      // Refresh: ask, enter, values rerun row by row
      const n = Math.round(ASK.length * seg(t, L.askA, L.askB));
      const sentAsk = t >= L.enter + 0.15;
      txt(c.askt, !sentAsk ? ASK.slice(0, n) : t < L.refresh + 1.3 ? 'Rerunning workflow…' : 'Budgets updated · just now');
      on(c.askt, 'is-status', sentAsk);
      on(c.ask, 'is-typing', ref && !sentAsk);
      on(c.enter, 'is-down', t >= L.enter && t < L.enter + 0.2);
      c.rows.forEach((row, i) => {
        const t0 = L.refresh + i * 0.22;
        on(row, 'flash', t >= t0 && t < t0 + 0.55);
        txt(c.vals[i], money(lerp(BUDGET[i][1], BUDGET[i][2], ease(seg(t, t0, t0 + 0.5)))));
      });
    },
  });
})();

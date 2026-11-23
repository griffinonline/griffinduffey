// CV content. Sources: the CV Google Sheet (Work, Work abridged, About,
// Education tabs), career/cv-draft.md, project notes, and oratory-ops
// (kickoff/handoff dates). Lines marked `// check:` are facts the sources
// disagree on or that need Griffin's OK.
//
// Each entry:
//   id       url hash (/cv#votive-chai), lowercase, no spaces, unique
//   title    shows in the row
//   sub      role, shown in the role column and the panel
//   year     start year (used when there are no months)
//   years    free text for year-only entries. "2021–2023" or "2024–now"
//            draws a timeline bar.
//   start    optional 'YYYY-MM'. With it, the bar is month-accurate.
//   end      optional 'YYYY-MM' or 'now'. Missing = a single month.
//   img      optional. Only for good non-site images (no site screenshots).
//   site     optional [label, href]. Shows as a link where the timeline
//            starts ("less.tech ↗").
//   featured optional. Shows in the overview's selected projects.
//   body     array of paragraphs
//   links    array of [label, href]
//   stack    optional short line (tools used)
//
// moment + oratory entries also carry the table columns:
//   what, studio ('oratory' | 'moment'), type, status, see.
//   [oratory] / [moment] anywhere in text = an inline link (oratory.co,
//   moment.so); the case written is the case shown.
//   No `see` = "walkthrough on request".

window.CV = {
  title: 'griffin bennett duffey',
  subtitle: 'cv: designer, builder, project lead. greenville, sc',
  note: 'draft',
  now: '2026-11',
  // Month zoom shows months back to here; older time folds into "earlier".
  monthsFrom: '2024-01',
  nav: [
    ['home', '/'],
    ['email', 'mailto:griffinbennettduffey@gmail.com?subject=work'],
    ['print', '#print'],
  ],

  // Tabs across the top. Each group pulls a section, a filtered part of a
  // section, or a list of ids. `table: true` = the moment + oratory layout.
  tabs: [
    {
      id: 'overview', label: 'overview',
      groups: [
        { section: 'work' },
        { label: 'selected projects', color: '#b9a4ff', featured: true },
        { label: 'education', color: '#c9c9c9', ids: ['clemson', 'thesis', 'paper', 'logic-ta', 'webflow'] },
      ],
    },
    {
      id: 'moment', label: 'moment + oratory', table: true, zoom: 'months',
      // One paragraph, [oratory] / [moment] become links (see cv.js `rich`).
      // check: "in the fall of 2026" (the rebrand) and "march to november
      // 2026" (my dates there) aren't confirmed yet.
      intro: '[oratory] was a design studio making brands and websites for ai and software companies. in the fall of 2026 it became [MOMENT], a rebrand, not a second studio, selling short brand + site sprints. my title was project manager, but i was the main ai-assisted builder and client contact on most of these projects, and i built the studio\'s internal tools. i was there from march to november 2026, when the team reset. projects still starting then say how far i got.',
      groups: [
        { section: 'moment + oratory', label: 'client projects', kind: 'client' },
        { section: 'moment + oratory', label: 'studio tools + sales', kind: 'internal' },
      ],
    },
    {
      id: 'built', label: 'built',
      groups: [{ section: 'design & build' }, { section: 'tools' }],
    },
    {
      id: 'votive', label: 'votive',
      groups: [
        { section: 'work', ids: ['votive-job'] },
        { section: 'votive' },
        { section: 'art & music', ids: ['votive-motion'] },
      ],
    },
    {
      id: 'earlier', label: 'earlier work',
      groups: [
        { section: 'work', label: 'earlier jobs', ids: ['meridian', 'fbg', 'methodical', 'ecb'] },
        { section: 'earlier web work' },
      ],
    },
    {
      id: 'research', label: 'research + education',
      groups: [{ section: 'education' }, { section: 'research & writing' }, { section: 'teaching & community' }],
    },
    { id: 'everything', label: 'everything', all: true },
  ],

  sections: [
    // ------------------------------------------------------------------
    {
      name: 'work',
      color: '#7fb6ff',
      items: [
        {
          // check: "fall of 2026" for the rebrand is from memory ("announced ~sept").
          id: 'moment-job', title: '[MOMENT] (formerly [Oratory])', sub: 'Project manager, builder & client lead', year: 2026,
          start: '2026-03', end: '2026-11',
          body: [
            'A design studio making brands and websites for AI and software companies. [Oratory] became [MOMENT] in the fall of 2026.',
            'My title was project manager. I ran about 30 client projects from kickoff to handoff: scoping, timelines, client calls, reviews. On most of them I also built pages and QA\'d before launch, and I was the main AI-assisted builder on AlloBrain, G360, Suppli, Handled, Scite and NPS Prism.',
            'Between client work I built the tools the studio ran on: a project dashboard, an ops system that reads scope and timelines from Slack and the repos, the intake and launch docs, and sales decks.',
          ],
          links: [['every project, with my role', '#moment'], ['moment.so', 'https://moment.so']],
          stack: 'Next.js, Astro, Sanity, Vercel, Cloudflare, Figma, Claude Code',
        },
        {
          // check: the Work tab says 2025, the abridged tab says 2024–2025.
          id: 'meridian', title: 'Meridian Design', sub: 'Design engineer', year: 2024, years: '2024–2025',
          body: [
            'Designed and built websites for clients and agencies, mostly in Webflow, usually from Figma designs.',
            'Led Throw from concept to launch, and co-developed sites for Tabbi, AAA Storage, Sam Acho, Berry and Pitchsafe.',
          ],
          site: ['meridian.design', 'https://www.meridian.design/'],
          links: [['meridian.design', 'https://www.meridian.design/']],
          stack: 'Webflow, Figma',
        },
        {
          // check: the Work tab says Votive started 2025; the abridged tab and the description say 2024.
          id: 'votive-job', title: 'Votive', sub: 'Founder', year: 2024, years: '2024–now',
          img: '/assets/cv/votive-chai.jpg',
          body: [
            'A non-alcoholic beverage company in Greenville: chai concentrate and single-origin tea kombucha. 15+ wholesale accounts across the southeast in the first year.',
            'I do all of it: recipes, production, labels, the website, social content, orders and the books.',
          ],
          links: [['drinkvotive.com', 'https://www.drinkvotive.com/'], ['the votive tab', '#votive']],
        },
        {
          // check: the Work tab header says 2025–, but griffinduffey.com and the Votive site are 2024.
          id: 'freelance', title: 'Freelance', sub: 'Designer & developer', year: 2024, years: '2024–now',
          body: [
            'Brands and websites for galleries, musicians, tutors and small businesses. Sites designed in Figma, then built in Webflow, Astro or plain HTML.',
          ],
          links: [['what i built', '#built']],
        },
        {
          id: 'fbg', title: 'First Baptist Greenville', sub: 'Ministry assistant, spiritual formation & outreach', year: 2024, years: '2024–2026',
          body: [
            'Worked with Rev. Camille Loomis Rehnborg to resource the congregation with educational content and organize churchwide events.',
            'FBG champions interfaith community building and a safe place for the marginalized, in the Cooperative Baptist Fellowship.',
          ],
          links: [],
        },
        {
          id: 'methodical', title: 'Methodical Coffee', sub: 'Director of beverage', year: 2021, years: '2021–2023',
          body: [
            'Hired to start the ready-to-drink program: develop new products, perfect old ones, and scale production. Retrofitted medium-batch beer equipment for coffee and tea.',
            'Products: cold brew, chai concentrate, vegan cold brew horchata, slushies, wholesale 12oz cold brew. Beverage revenue more than doubled while I ran it.',
            'Mostly I learned how to sustain fast growth by adapting the process, as the company went from small-town success to national acclaim.',
          ],
          links: [],
        },
        {
          id: 'ecb', title: 'Electric City Brewing', sub: 'Brewer', year: 2020, years: '2020–2021',
          body: [
            'After Clemson I wanted something trade-ish and tactile. Did most of the brewing on a 1BBL system under the owner-brewer, plus coffee roasting and a morning coffee bar. Hands-on and gritty, and where I found out how fun it is to develop drinks.',
          ],
          links: [],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      // Oratory / MOMENT projects, newest kickoff first. Dates: kickoff and
      // handoff months from oratory-ops; memory notes for the MOMENT ones.
      name: 'moment + oratory',
      color: '#b9a4ff',
      items: [
        {
          // check: stack unknown; not public yet.
          // check: Ravera is unannounced, so the product isn't named here.
          // check: confirm Griffin ran the 11/3 kickoff.
          // check: contract paper was Oratory's; branded MOMENT from 11/2.
          id: 'vitally', title: 'Vitally', sub: 'Project manager', year: 2026, start: '2026-11',
          what: 'site for a new vitally product, brand by studio freight', studio: 'moment', type: 'brand + site sprint',
          status: 'started: i ran kickoff and the first week before i left', see: 'not public yet',
          body: ['Website for a new Vitally product, with the brand by Studio Freight. I ran the kickoff, gathered the client\'s positioning and product UI into one place, and set up the stack conversation. I left a week in.'],
          links: [],
        },
        {
          // check: stack unknown; I left before the build.
          // check: confirm how much of NetBird's kickoff Griffin ran.
          id: 'netbird', title: 'NetBird', sub: 'Project manager, research', year: 2026, start: '2026-10', end: '2026-11',
          what: 'brand + site for an open-source networking company', studio: 'moment', type: 'brand + site sprint',
          status: 'early phase: i set up kickoff and ran the first weeks',
          body: ['Brand and website sprint, the first run on the 4-week model. I set up the project hub, booked the reviews and gathered inspiration and product UI for the team. I left before the build.'],
          links: [],
        },
        {
          // check: stack unknown; I left before the build.
          id: 'emdash', title: 'Emdash', sub: 'Project manager', year: 2026, start: '2026-10', end: '2026-11',
          what: 'the first [MOMENT] brand + site sprint', studio: 'moment', type: 'brand + site sprint',
          status: 'early phase: i wrote the intake and ran the first weeks',
          body: ['The first [MOMENT] brand and site sprint. I wrote the client intake it ran on (a long and a short version) and was on it until I left.'],
          links: [],
        },
        {
          // check: default.com (11/23) is Next.js + Sanity, but the only repo is a static preview; can't tell if the MOMENT homepage shipped. Stack left blank.
          // check: status after Sept; oratory-ops still had it active.
          id: 'default', title: 'Default', sub: 'Project manager', year: 2026, start: '2026-08',
          what: 'brand + homepage', studio: 'moment', type: 'brand + site sprint', status: 'handed off',
          body: ['Brand and homepage.'],
          links: [],
        },
        {
          id: 'allobrain', title: 'AlloBrain', sub: 'Project manager + main builder', year: 2026, start: '2026-08', end: '2026-09',
          what: 'site for an ai contact-center platform', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['allobrain.com', 'https://www.allobrain.com'], featured: true,
          body: [
            'Marketing site for an AI contact-center platform. Built the site and its Sanity setup, ran motion prototypes for the review calls, and handed it off so a non-technical owner can keep editing it with AI.',
          ],
          links: [['allobrain.com', 'https://www.allobrain.com'], ['case study', '/work-allobrain']],
          stack: 'custom · astro · sanity',
        },
        {
          id: 'g360', title: 'G360 Technologies', sub: 'Project manager + main builder', year: 2026, start: '2026-07', end: '2026-09',
          what: 'site for an ai security company', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['g360technologies.com', 'https://www.g360technologies.com'], featured: true,
          body: ['Site for an AI security company (PromptVault, Repo Audit). Others committed too, but I did most of the development, built from the Figma file, then handed the domain, DNS and services over to the client.'],
          links: [['g360technologies.com', 'https://www.g360technologies.com'], ['case study', '/work-g360']],
          stack: 'custom · next.js',
        },
        {
          // npsprism.com on 11/23 is still the old site (no Next.js), so the Oratory build isn't live yet. Stack from the repo.
          id: 'nps-prism', title: 'NPS Prism (Bain)', sub: 'Project manager + main builder', year: 2026, start: '2026-07', end: '2026-10',
          what: 'site for bain\'s cx benchmarking product', studio: 'oratory', type: 'brand + site sprint', status: 'launching soon',
          body: [
            'Marketing site for Bain\'s customer-experience benchmarking product. Only the homepage was designed, so I skinned every interior page from wireframes using the homepage\'s system, plus Sanity, forms and handoff docs. About 158 of roughly 190 commits.',
          ],
          links: [],
          stack: 'custom · next.js · sanity',
        },
        {
          // scite.ai on 11/23 is still the old react app (not the Next.js build), so not live yet. Stack from ~/coding/oratory/scite-oratory.
          id: 'scite', title: 'Scite', sub: 'Project manager + main builder', year: 2026, start: '2026-07', end: '2026-08',
          what: 'site for an ai research assistant', studio: 'oratory', type: 'brand + site sprint', status: 'launching soon',
          body: ['New marketing site for an AI research assistant.'],
          links: [],
          also: 'design + imagery support',
          stack: 'custom · next.js',
        },
        {
          // check: stack + site unknown.
          id: 'sol', title: 'Sol', sub: 'Project manager', year: 2026, start: '2026-06',
          what: 'brand + homepage', studio: 'oratory', type: 'brand + site sprint', status: 'handed off',
          body: ['Brand and homepage.'],
          links: [],
        },
        {
          // itshandled.ai checked 11/23: Next.js on Vercel, matches the oratorydesign/itshandled-marketing-site repo.
          id: 'handled', title: 'Handled', sub: 'Project manager + main builder', year: 2026, start: '2026-06', end: '2026-09',
          what: 'brand + site for an ai teammate for cpg brands', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['itshandled.ai', 'https://www.itshandled.ai'],
          body: ['Brand and site for an AI teammate made for consumer packaged goods. Worked through batched client feedback and kept changes small and on brand.'],
          links: [['itshandled.ai', 'https://www.itshandled.ai']],
          also: 'design + imagery support',
          stack: 'custom · next.js',
        },
        {
          // Stack from tahoebio/tahoe-marketing-site (Next.js + Sanity on Cloudflare); the live HTML keeps the old Webflow export markup.
          id: 'tahoe', title: 'Tahoe', sub: 'Project manager; facilitated the move off Webflow into a custom build', year: 2026, start: '2026-06', end: '2026-10',
          what: 'site for a biology ai lab, plus the tara launch', studio: 'oratory', type: 'rebuild + campaign launch', status: 'live',
          site: ['tahoelabs.ai', 'https://tahoelabs.ai'], featured: true,
          body: ['Site for a biology AI lab. Moved it off Webflow into a custom build, set up the staging-to-production flow and Sanity content, and launched the Tara campaign page.'],
          links: [['tahoelabs.ai', 'https://tahoelabs.ai'], ['case study', '/work-tahoe']],
          also: 'design + imagery support',
          stack: 'custom · next.js · sanity',
        },
        {
          // check: the client planned its own go-live for 11/9; confirm it's live.
          id: 'suppli', title: 'Suppli', sub: 'Project manager + main builder', year: 2026, start: '2026-06', end: '2026-09',
          what: 'site for a credit platform for the physical economy', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['gosuppli.com', 'https://www.gosuppli.com'],
          body: ['Site for a credit platform for the physical economy. Built pages and Sanity content, worked the client punchlist down, and handed the repo over.'],
          links: [['gosuppli.com', 'https://www.gosuppli.com']],
          also: 'design + imagery support',
          stack: 'custom · next.js · sanity',
        },
        {
          // check: productschool.com (11/23) shows the refresh's hero ("The learning platform for AI builders"), but on Product School's own Next.js + Contentful site; confirm how much of the refresh shipped.
          id: 'product-school', title: 'Product School', sub: 'Project manager', year: 2026, start: '2026-05', end: '2026-08',
          what: 'site refresh', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['productschool.com', 'https://productschool.com'],
          body: ['Site refresh.'],
          links: [['productschool.com', 'https://productschool.com']],
          stack: 'custom · next.js',
        },
        {
          // arrows.to (11/23) is Astro; the oratorydesign arrows repos are Next.js/Vite, so the client may have rebuilt it.
          // check: arrows.to is inferred from the client's email domain.
          id: 'arrows', title: 'Arrows', sub: 'Project manager', year: 2026, start: '2026-05', end: '2026-07',
          what: 'site for a sales deal-playbook tool', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['arrows.to', 'https://arrows.to'],
          body: ['Marketing site for a sales deal-playbook tool.'],
          links: [['arrows.to', 'https://arrows.to']],
          stack: 'custom · astro',
        },
        {
          // check: magentrix.com (11/23) is a Webflow site; no Oratory repo, so confirm it's the Oratory homepage.
          id: 'magentrix', title: 'Magentrix', sub: 'Project manager', year: 2026, start: '2026-05',
          what: 'brand + homepage', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['magentrix.com', 'https://www.magentrix.com'],
          body: ['Brand and homepage.'],
          links: [['magentrix.com', 'https://www.magentrix.com']],
          stack: 'webflow',
        },
        {
          // check: less.tech is inferred from the client's email domain.
          // check: Griffin called it "Feature Less"; oratory-ops names the client "Less".
          id: 'less', title: 'Less', sub: 'Project manager', year: 2026, start: '2026-05',
          what: 'site for a data workflow tool', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['less.tech', 'https://www.less.tech'], featured: true,
          body: ['Marketing site for a data workflow tool.'],
          links: [['less.tech', 'https://www.less.tech']],
          stack: 'custom · next.js',
        },
        {
          // check: stack unknown (blindzebra.com is a sports site, not clearly the client).
          id: 'blind-zebra', title: 'Blind Zebra', sub: 'Project manager', year: 2026, start: '2026-05',
          what: 'ongoing site work', studio: 'oratory', type: 'brand + site sprint', status: 'handed off',
          body: ['Ongoing site work, billed hourly.'],
          links: [],
        },
        {
          // check: commodityai.com (11/23) is Next.js on Vercel, but there's no Oratory repo for it; confirm before marking it live. Stack left blank.
          id: 'commodityai', title: 'CommodityAI', sub: 'Project manager', year: 2026, start: '2026-05',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'handed off',
          body: ['Marketing site.'],
          links: [],
        },
        {
          // flowgenlabs.com (11/23): Next.js; oratory-ops says custom build in the client's FlowGenLabs/flowgenlabs-marketing repo.
          id: 'flowgen', title: 'Flowgen', sub: 'Project manager', year: 2026, start: '2026-04',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['flowgenlabs.com', 'https://flowgenlabs.com'],
          body: ['Marketing site.'],
          links: [['flowgenlabs.com', 'https://flowgenlabs.com']],
          stack: 'custom · next.js',
        },
        {
          // productpartners.com (11/23): Next.js on Vercel, same title as the oratorydesign/product-partners-marketing repo.
          id: 'product-partners', title: 'Product Partners', sub: 'Project manager', year: 2026, start: '2026-04',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['productpartners.com', 'https://productpartners.com'],
          body: ['Marketing site.'],
          links: [['productpartners.com', 'https://productpartners.com']],
          stack: 'custom · next.js',
        },
        {
          // Stack from the oratorydesign/karumi-marketing repo.
          // karumi.com now says the company has closed, so no link.
          id: 'karumi', title: 'Karumi', sub: 'Project manager', year: 2026, start: '2026-04',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'handed off (company has since closed)',
          body: ['Marketing site. The company has since closed.'],
          links: [],
          stack: 'custom · next.js',
        },
        {
          // check: kyckr.com (11/23) is Framer; no Oratory repo, so confirm it's the Oratory build.
          id: 'kyckr', title: 'Kyckr', sub: 'Project manager + builder', year: 2026, start: '2026-04',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['kyckr.com', 'https://www.kyckr.com'],
          body: ['Marketing site.'],
          links: [['kyckr.com', 'https://www.kyckr.com']],
          stack: 'framer',
        },
        {
          // Stack: live Next.js (11/23) + the oratorydesign/umony-marketing repo (Sanity).
          // check: umony.com is inferred from the client's email domain.
          id: 'umony', title: 'Umony', sub: 'Project manager', year: 2026, start: '2026-04',
          what: 'site for a communications compliance platform', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['umony.com', 'https://www.umony.com'],
          body: ['Marketing site for a communications compliance platform.'],
          links: [['umony.com', 'https://www.umony.com']],
          stack: 'custom · next.js · sanity',
        },
        {
          // musubilabs.ai sits behind a Vercel bot check; stack from the oratorydesign/musubi-marketing repo.
          // check: musubilabs.ai is inferred from the client's email domain.
          id: 'musubi', title: 'Musubi', sub: 'Project manager + builder', year: 2026, start: '2026-04',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['musubilabs.ai', 'https://www.musubilabs.ai'], featured: true,
          body: ['Marketing site.'],
          links: [['musubilabs.ai', 'https://www.musubilabs.ai']],
          stack: 'custom · next.js · sanity',
        },
        {
          // Stack: live Next.js (11/23) + the oratorydesign/qase-marketing repo (Sanity).
          // check: qase.io is inferred from the client's email domain.
          id: 'qase', title: 'Qase', sub: 'Project manager', year: 2026, start: '2026-04', end: '2026-05',
          what: 'site for a test management platform', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['qase.io', 'https://qase.io'], featured: true,
          body: ['Marketing site for a test management platform.'],
          links: [['qase.io', 'https://qase.io']],
          stack: 'custom · next.js · sanity',
        },
        {
          // check: passetto.com (11/23) is Webflow (B2B SaaS marketing measurement); confirm it's the Oratory build.
          id: 'passetto', title: 'Passetto', sub: 'Project manager + builder', year: 2026, start: '2026-04',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['passetto.com', 'https://www.passetto.com'],
          body: ['Marketing site.'],
          links: [['passetto.com', 'https://www.passetto.com']],
          stack: 'webflow',
        },
        {
          // check: neuron7.ai (11/23) is Webflow; confirm it's the Oratory build.
          id: 'neuron7', title: 'Neuron7', sub: 'Project manager', year: 2026, start: '2026-03',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['neuron7.ai', 'https://www.neuron7.ai'],
          body: ['Marketing site.'],
          links: [['neuron7.ai', 'https://www.neuron7.ai']],
          stack: 'webflow',
        },
        {
          // check: advancehq.com (11/23, Slack channel #advancehq-oratory-ext) is Framer; confirm it's the Oratory build.
          id: 'advance', title: 'Advance', sub: 'Project manager', year: 2026, start: '2026-03',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['advancehq.com', 'https://advancehq.com'],
          body: ['Marketing site.'],
          links: [['advancehq.com', 'https://advancehq.com']],
          stack: 'framer',
        },
        {
          // articlegalaxy.com (11/23): Next.js + Sanity on Vercel, same stack as the oratorydesign/article-galaxy-marketing-site repo.
          id: 'article-galaxy', title: 'Article Galaxy', sub: 'Project manager', year: 2026, start: '2026-03',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['articlegalaxy.com', 'https://www.articlegalaxy.com'],
          body: ['Marketing site.'],
          links: [['articlegalaxy.com', 'https://www.articlegalaxy.com']],
          stack: 'custom · next.js · sanity',
        },
        {
          // revvue.ai (11/23) is Framer; oratory-ops has a #switch-framer-revvue channel and ownership moved to the client in June.
          id: 'revvue', title: 'RevVue', sub: 'Project manager', year: 2026, start: '2026-03',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['revvue.ai', 'https://www.revvue.ai'],
          body: ['Marketing site.'],
          links: [['revvue.ai', 'https://www.revvue.ai']],
          stack: 'framer',
        },
        {
          // check: neurawork.ai (11/23, German AI consultancy) is Framer; confirm it's the Oratory build.
          id: 'neurawork', title: 'Neurawork', sub: 'Project manager + builder', year: 2026, start: '2026-03',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'live',
          site: ['neurawork.ai', 'https://neurawork.ai'],
          body: ['Marketing site.'],
          links: [['neurawork.ai', 'https://neurawork.ai']],
          stack: 'framer',
        },
        {
          // check: two Tenzos exist (tenzo.ai, AI recruiter, Next.js; gotenzo.com, restaurant analytics, Webflow); not sure which is the client. Stack + link left blank.
          id: 'tenzo', title: 'Tenzo', sub: 'Project manager', year: 2026, start: '2026-03',
          what: 'marketing site', studio: 'oratory', type: 'brand + site sprint', status: 'handed off',
          body: ['Marketing site.'],
          links: [],
        },
        // ---- studio tools + sales (kind: internal) ----
        {
          id: 'handoff-checklist', title: 'Handoff checklist', sub: 'Writer', year: 2026, start: '2026-10', kind: 'internal',
          what: 'the steps before a client takes over a site', studio: 'moment', type: 'internal tool', status: 'internal',
          body: ['The steps before a site goes to the client: accounts, domains, secrets, what still runs on our side, and a check for what a repo transfer leaves connected.'],
          links: [],
        },
        {
          id: 'intake', title: 'Client intake + launch doc', sub: 'Writer & developer', year: 2026, start: '2026-10', kind: 'internal',
          what: 'intake forms (long + short) and the delivery terms for sprints', studio: 'moment', type: 'internal tool', status: 'internal',
          body: ['The client intake for [MOMENT] sprints, in a long contract-driven version and a short 17-question one, plus the launch doc that set out delivery terms.'],
          links: [['case study', '/work-studio-tools']],
        },
        {
          id: 'sales-decks', title: 'Sales decks', sub: 'Designer', year: 2026, start: '2026-09', end: '2026-10', kind: 'internal',
          what: 'sales-call decks, one per brand direction, from a past project', studio: 'moment', type: 'sales', status: 'internal',
          body: ['Sales-call decks in Figma, one per brand direction, built from a past project as the worked example. Plus a positioning and homepage-wireframe example.'],
          links: [],
          stack: 'Figma',
        },
        {
          id: 'oratory-ops', title: 'Studio ops system', sub: 'Developer', year: 2026, start: '2026-09', end: '2026-10', kind: 'internal',
          what: 'measures scope and timelines from repos + slack', studio: 'oratory', type: 'internal tool', status: 'internal (retired)',
          body: ['Measures each project\'s scope and timeline from its repo and Slack instead of asking people to update a tracker. Also held the client intake forms and launch docs.'],
          links: [['case study', '/work-studio-tools']],
          stack: 'Next.js, Vercel, Claude',
        },
        {
          id: 'pm-app', title: 'Studio PM app', sub: 'Designer & main developer', year: 2026, start: '2026-04', end: '2026-08', kind: 'internal',
          what: 'project dashboard that replaced coda', studio: 'oratory', type: 'internal tool', status: 'internal (retired)',
          body: ['A project dashboard for the studio to replace Coda: projects, timelines and client intake, wired into Slack with AI status rollups. Started with a teammate, then mostly mine.'],
          links: [['case study', '/work-studio-tools']],
          stack: 'Laravel, Inertia, React, Tailwind, Neon',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'design & build',
      color: '#f2a0f2',
      items: [
        {
          // check: wescarroll.com isn't a signed engagement yet; this links the preview build.
          id: 'wescarroll', title: 'wescarroll.com', sub: 'Designer & developer', year: 2026, start: '2026-10', end: 'now',
          body: ['Moving a tutoring and coaching site off WordPress to a custom build, keeping every URL working. In progress.'],
          site: ['preview', 'https://wescarroll.vercel.app'],
          links: [['preview', 'https://wescarroll.vercel.app']],
          stack: 'Astro, Sanity, Vercel',
        },
        {
          // check: the workers.dev address may not be the final domain.
          id: 'michael-alan-scott', title: 'Michael Alan Scott', sub: 'Designer & developer', year: 2026, start: '2026-09', end: '2026-10',
          body: ['Site for a Nashville musician and touring guitarist. Early-web energy: raw HTML feel, 35mm film scans, one moving GIF.'],
          site: ['site', 'https://michael-alan-scott.griffinbennettduffey.workers.dev'],
          links: [['site', 'https://michael-alan-scott.griffinbennettduffey.workers.dev']],
          stack: 'Astro, Cloudflare',
        },
        {
          // check: the Sheet puts Throw at the top of the Meridian list (2025).
          id: 'throw', title: 'Throw', sub: 'Project lead, designer, developer, via Meridian', year: 2025, years: '2025',
          body: ['A smaller site service that\'s accessible and custom. I had full rein from concept to publishing. Featured on One Page Love.'],
          site: ['throw-site.webflow.io', 'https://throw-site.webflow.io/'],
          links: [['throw-site.webflow.io', 'https://throw-site.webflow.io/'], ['one page love', 'https://onepagelove.com/throw']],
          stack: 'Webflow',
        },
        {
          // check: the Sheet lists Devinci House first under freelance (2025); the old CV draft said 2023.
          id: 'devinci', title: 'Devinci House', sub: 'Designer & developer', year: 2025, years: '2025',
          body: ['Contemporary art gallery in downtown Greenville. A fun landing page with Windows 98 icons and styles, and clean, minimal pages inside.'],
          site: ['devincihouse.com', 'https://www.devincihouse.com/'],
          links: [['devincihouse.com', 'https://www.devincihouse.com/']],
          stack: 'Figma, Webflow',
        },
        {
          id: 'griffinduffey', title: 'griffinduffey.com', sub: 'Designer & developer', year: 2024, years: '2024–now',
          body: ['My personal site and archive. Simple on purpose, always changing. This CV lives here.'],
          site: ['griffinduffey.com', 'https://griffinduffey.com'],
          links: [['griffinduffey.com', 'https://griffinduffey.com']],
          stack: 'Plain HTML, Cloudflare Pages',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'tools',
      color: '#8fe3a8',
      items: [
        {
          id: 'sheaf', title: 'Sheaf', sub: 'Designer & builder', year: 2026, years: '2026',
          featured: true,
          body: [
            'A front end for AI coding agents that runs on your own machine and works from a phone. In beta.',
          ],
          site: ['sheaf.to', 'https://sheaf.to'],
          links: [['sheaf.to', 'https://sheaf.to'], ['case study', '/work-sheaf']],
          stack: 'Bun, TypeScript, SQLite, vanilla JS PWA',
        },
        {
          id: 'money-mode', title: 'Money Mode', sub: 'Personal tool', year: 2026, start: '2026-09', end: 'now',
          body: ['A budgeting app built around how I actually spend, with every account linked.'],
          links: [],
          stack: 'Next.js, Neon, Vercel',
        },
        {
          id: 'muscle-mode', title: 'Muscle Mode', sub: 'Personal tool', year: 2026, start: '2026-09', end: '2026-10',
          body: ['Lift logging with automatic progression. Feeds my training dashboard.'],
          links: [],
          stack: 'Next.js, Vercel',
        },
        {
          id: 'training', title: 'Training dashboard', sub: 'Personal tool', year: 2026, years: '2026',
          body: ['Pulls my Garmin data into one page about consistency and recovery.'],
          links: [],
          stack: 'Python, SQLite',
        },
        {
          id: 'hermit-mode', title: 'Hermit Mode', sub: 'Personal tool', year: 2026, start: '2026-08',
          body: ['An Instagram replacement: post and reply without the app, but never cold-start a conversation.'],
          links: [],
          stack: 'Next.js, Neon, Vercel',
        },
        {
          id: 'marker-split', title: 'Ableton marker split', sub: 'Script', year: 2026, years: '2026',
          body: ['Cuts one long live-set render into per-song files using the locators in the Live set.'],
          links: [],
          stack: 'Python, ffmpeg',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'votive',
      color: '#ff9e8f',
      items: [
        {
          id: 'votive-back-office', title: 'Votive back office', sub: 'Builder', year: 2025, years: '2025–now',
          body: ['The books, wholesale orders, payroll and shipping, run from a rules-driven ledger and a small command-line tool, with Stripe, Gusto and Shippo wired in.'],
          links: [['case study', '/work-votive']],
          stack: 'Python, Stripe, Gusto, Shippo, Google Sheets',
        },
        {
          id: 'kombucha-12oz', title: '12oz kombucha', sub: 'Product designer', year: 2026, years: '2026',
          body: ['Label approved by the SC Department of Agriculture. Awaiting bottles.'],
          links: [],
        },
        {
          id: 'votive-merch', title: 'Hats & hoodie', sub: 'Product designer', year: 2024, years: '2024–2025',
          body: ['Embroidered patches on 6-panel hats (v2 and camo) and a black hoodie. Camo hat and hoodie sold out.'],
          links: [],
        },
        {
          id: 'kombucha-750', title: '750ml kombucha', sub: 'Product designer', year: 2024, years: '2024',
          body: ['NA wine-style single-origin tea kombucha with rotating teas. Front and back labels. Online, on draft around Greenville and at Swamp Rabbit Cafe.'],
          links: [],
        },
        {
          id: 'votive-chai', title: 'Chai concentrate', sub: 'Product designer', year: 2024, years: '2024',
          img: '/assets/cv/votive-chai.jpg',
          body: ['Recipe, label and a 3D scan of the jug. Served at 15 cafes across the southeast. All labels designed within SC Department of Agriculture requirements.'],
          links: [],
        },
        {
          id: 'votive-site', title: 'drinkvotive.com', sub: 'Designer & developer', year: 2024, years: '2024',
          body: ['Where my web work started. I didn\'t want a templated site, so I learned to make my own. Brutalist and functional: GIFs of 3D product scans, marquees, bold color.'],
          site: ['drinkvotive.com', 'https://www.drinkvotive.com/'],
          links: [['drinkvotive.com', 'https://www.drinkvotive.com/']],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'earlier web work',
      color: '#e8b8e8',
      items: [
        {
          id: 'tabbi', title: 'Tabbi', sub: 'Co-developer, via Meridian', year: 2025, years: '2025',
          body: ['Site for a nightlife app.'],
          site: ['tabbi.app', 'https://www.tabbi.app/'],
          links: [['tabbi.app', 'https://www.tabbi.app/']],
          stack: 'Webflow',
        },
        {
          id: 'aaa-storage', title: 'AAA Storage', sub: 'Co-developer, via Meridian', year: 2025, years: '2025',
          body: ['Site for a self-storage investment firm.'],
          site: ['aaastorageinvestments.com', 'https://www.aaastorageinvestments.com/'],
          links: [['aaastorageinvestments.com', 'https://www.aaastorageinvestments.com/']],
          stack: 'Webflow',
        },
        {
          id: 'sam-acho', title: 'Sam Acho', sub: 'Co-developer, via Meridian', year: 2025, years: '2025',
          body: ['Site for a speaker, ESPN analyst, author and former NFL player.'],
          site: ['samacho.com', 'https://www.samacho.com/'],
          links: [['samacho.com', 'https://www.samacho.com/']],
          stack: 'Webflow',
        },
        {
          id: 'berry', title: 'Berry Consultants', sub: 'Co-developer, via Meridian', year: 2024, years: '2024',
          body: ['Site for a clinical trial design consultancy.'],
          site: ['berryconsultants.com', 'https://www.berryconsultants.com/'],
          links: [['berryconsultants.com', 'https://www.berryconsultants.com/']],
          stack: 'Webflow',
        },
        {
          id: 'pitchsafe', title: 'Pitchsafe', sub: 'Co-developer, via Meridian', year: 2024, years: '2024',
          body: ['Site for a pitcher training app.'],
          site: ['pitchsafe.co', 'https://pitchsafe.co/'],
          links: [['pitchsafe.co', 'https://pitchsafe.co/']],
          stack: 'Webflow',
        },
        {
          // check: Dripos isn't in the Sheet; year is from the old draft.
          id: 'dripos', title: 'Dripos', sub: 'Development support, via Kinetic Studio', year: 2022, years: '2022',
          body: ['Came in at the end to debug the site and handle last-minute client requests.'],
          site: ['dripos.com', 'https://www.dripos.com/'],
          links: [['dripos.com', 'https://www.dripos.com/']],
          stack: 'Webflow',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'art & music',
      color: '#ffe94a',
      items: [
        {
          id: 'votive-motion', title: 'Votive motion lab', sub: 'Animated brand studies', year: 2026, start: '2026-10',
          img: '/assets/cv/votive-motion.jpg',
          body: ['Motion that feels analog (riso, screenprint, photocopy) built natively in code. Started with the Votive mark, then a print wall for a made-up brand.'],
          links: [],
          stack: 'Canvas, vanilla JS',
        },
        {
          // check: years for music.
          id: 'music', title: 'Music', sub: 'Songs and live sets', year: 2026, years: 'ongoing',
          body: ['I write, play and record music, including long live sets.'],
          links: [],
          stack: 'Ableton Live',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'research & writing',
      color: '#ffb27a',
      items: [
        {
          id: 'thesis', title: 'Memory, Texts, and Change: A Deuteronomistic Tradition', sub: 'Thesis, religious studies, Clemson', year: 2020, years: '2020',
          body: ['How memory becomes text and practice. Advised by Dr. Benjamin L. White and Dr. John T. Thames.'],
          links: [],
        },
        {
          id: 'paper', title: 'Memory, Space, and Textualization in the Priestly Writings', sub: 'Presented paper', year: 2019, years: '2019',
          body: ['Presented at the Psalms, Rituals, & Ancient Israelite Religion conference at Clemson University.'],
          links: [],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'teaching & community',
      color: '#7fded3',
      items: [
        {
          id: 'reading-group', title: 'Reading group', sub: 'Member', year: 2022, start: '2022-09', end: 'now',
          body: ['A small group reading mostly continental philosophy, psychoanalysis and critical theory, one book at a time. Also films, making music, and resisting despair.'],
          links: [],
          // From Griffin's Goodreads export (11/23); Griffin confirmed which were group reads.
          books: [
            { t: "Ethics of Liberation", a: "Enrique Dussel", d: '2026-08' },
            { t: "What Is Philosophy?", a: "Gilles Deleuze", d: '2026-06' },
            { t: "Infinitely Demanding", a: "Simon Critchley", d: '2026-05' },
            { t: "The Yield: Kafka's Atheological Reformation", a: "Paul North", d: '2026-04' },
            { t: "Inner Experience", a: "Georges Bataille", d: '2025-05' },
            { t: "The Gift of Death", a: "Jacques Derrida", d: '2025-02' },
            { t: "Toward the Critique of Violence", a: "Walter Benjamin", d: '2025-01' },
            { t: "Weird John Brown", a: "Ted Smith", d: '2025-01' },
            { t: "A Thousand Plateaus", a: "Gilles Deleuze", d: '2024-11' },
            { t: "Gender Trouble", a: "Judith Butler", d: '2024-08' },
            { t: "Bizarre-Privileged Items in the Universe", a: "Paul North", d: '2024-06' },
            { t: "Philosophical Investigations", a: "Ludwig Wittgenstein", d: '2024-06' },
            { t: "Tractatus Logico-Philosophicus", a: "Ludwig Wittgenstein", d: '2024-04' },
            { t: "Critique of Pure Reason", a: "Immanuel Kant", d: '2024-04' },
            { t: "On Suicide Bombing", a: "Talal Asad", d: '2023-10' },
            { t: "Anti-Oedipus: Capitalism and Schizophrenia", a: "Gilles Deleuze", d: '2023-07' },
            { t: "Beyond the Pleasure Principle", a: "Sigmund Freud", d: '2023-06' },
            { t: "The Arabic Freud", a: "Omnia El Shakry", d: '2023-05' },
            { t: "Why Psychoanalysis: Three Interventions", a: "Alenka Zupančič", d: '2023-05' },
            { t: "The Interpretation of Dreams", a: "Sigmund Freud", d: '2023-05' },
            { t: "Twenty Theses on Politics", a: "Enrique Dussel", d: '2023-04' },
            { t: "Three Essays on the Theory of Sexuality", a: "Sigmund Freud", d: '2023-04' },
            { t: "Marx, Capital and the Madness of Economic Reason", a: "David Harvey", d: '2023-03' },
            { t: "Kant's Philosophical Revolution", a: "Yirmiyahu Yovel", d: '2023-02' },
            { t: "Kant’s Critical Philosophy", a: "Gilles Deleuze", d: '2023-02' },
            { t: "Elite Capture", a: "Olúfẹ́mi O. Táíwò", d: '2023-02' },
            { t: "The Sublime Object of Ideology", a: "Slavoj Žižek", d: '2023-02' },
            { t: "The Lacanian Subject", a: "Bruce Fink", d: '2022-11' },
            { t: "The Origin of Capitalism: A Longer View", a: "Ellen Meiksins Wood", d: '2022-11' },
            { t: "A Clinical Introduction to Lacanian Psychoanalysis", a: "Bruce Fink", d: '2022-09' },
          ],
        },
        {
          id: 'logic-ta', title: 'Intro to Logic', sub: 'Teaching assistant, Philosophy 1030, Clemson', year: 2020, years: '2020',
          body: ['Assisted Dr. Kelly Smith: office hours, content prep and private tutoring, with an emphasis on symbolic logic, analytical writing and critical thinking.'],
          links: [],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'education',
      color: '#c9c9c9',
      items: [
        {
          id: 'clemson', title: 'Clemson University', sub: 'BA religious studies, BA philosophy, summa cum laude', year: 2016, years: '2016–2020',
          body: ['Summa cum laude. McCullough Award for Excellent Combined Study in Philosophy and Religion (2020).'],
          links: [],
        },
        {
          // check: the old draft said 2022; the Sheet says 2025.
          id: 'webflow', title: 'Webflow certified', sub: 'Webflow practitioner certification', year: 2025, years: '2025',
          body: ['Certified Webflow practitioner.'],
          links: [['credential', 'https://www.credential.net/82d96f1b-b77f-4222-82e8-da5347f9ae4f#acc.G0dMZnvF']],
        },
        {
          id: 'sql', title: 'SQL Fundamentals', sub: 'DataCamp', year: 2024, years: '2024',
          body: ['SQL fundamentals track.'],
          links: [],
        },
      ],
    },
  ],
};

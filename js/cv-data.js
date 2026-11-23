// CV content. Sources: the CV Google Sheet (Work, Work abridged, About,
// Education tabs), career/cv-draft.md, and project notes. Lines marked
// `// check:` are facts the sources disagree on or that need Griffin's OK.
//
// Each entry:
//   id     url hash (/cv#votive), lowercase, no spaces
//   title  shows in the row
//   sub    italic line in the panel (role, place)
//   year   which year column the thumbnail lands in (the start year)
//   years  free text shown in the panel. A range of two years
//          ("2021–2023") or "2024–now" draws a timeline bar in the sheet.
//   img    optional, e.g. "/assets/cv/votive.jpg". No img = placeholder.
//   body   array of paragraphs
//   links  array of [label, href]
//   stack  optional short line (tools used)

window.CV = {
  title: 'griffin bennett duffey',
  subtitle: 'cv: designer, builder, project lead. greenville, sc',
  note: 'draft',
  firstYear: 2016,
  lastYear: 2026,
  nav: [
    ['home', '/'],
    ['email', 'mailto:griffinbennettduffey@gmail.com?subject=work'],
    ['print', '#print'],
  ],
  sections: [
    // ------------------------------------------------------------------
    {
      name: 'work',
      color: '#7fb6ff',
      items: [
        {
          id: 'moment', title: 'MOMENT (formerly Oratory)', sub: 'Design engineer & project lead', year: 2026, years: '2026',
          img: '/assets/cv/moment.jpg',
          body: [
            'A small studio making brands and websites for AI and software companies. Oratory became MOMENT in 2026.',
            'I ran about 30 client projects from kickoff to handoff: scoping, timelines, client calls, reviews. On most of them I also designed, built pages and QA\'d before launch, and I was the main AI-assisted builder on AlloBrain, G360, Suppli, Handled, Scite and NPS Prism.',
            'Between client work I built the tools the studio ran on: a project dashboard, an ops system that reads scope and timelines from Slack and the repos, the intake and launch docs, and sales decks.',
          ],
          links: [['moment.so', 'https://moment.so']],
          stack: 'Next.js, Astro, Sanity, Vercel, Cloudflare, Figma, Claude Code',
        },
        {
          // check: the Work tab says 2025, the abridged tab says 2024–2025.
          id: 'meridian', title: 'Meridian Design', sub: 'Design engineer', year: 2024, years: '2024–2025',
          img: '/assets/cv/meridian.jpg',
          body: [
            'Designed and built websites for clients and agencies, mostly in Webflow, usually from Figma designs.',
            'Led Throw from concept to launch, and co-developed sites for Tabbi, AAA Storage, Sam Acho, Berry and Pitchsafe.',
          ],
          links: [['meridian.design', 'https://www.meridian.design/']],
          stack: 'Webflow, Figma',
        },
        {
          // check: the Work tab says Votive started 2025; the abridged tab and the description say 2024.
          id: 'votive', title: 'Votive', sub: 'Founder', year: 2024, years: '2024–now',
          img: '/assets/cv/votive-chai.jpg',
          body: [
            'A non-alcoholic beverage company in Greenville: chai concentrate and single-origin tea kombucha. 15+ wholesale accounts across the southeast in the first year.',
            'I do all of it: recipes, production, labels, the website, social content, orders and the books. More below, under votive.',
          ],
          links: [['drinkvotive.com', 'https://www.drinkvotive.com/']],
        },
        {
          // check: the Work tab header says 2025–, but griffinduffey.com and the Votive site are 2024.
          id: 'freelance', title: 'Freelance', sub: 'Designer & developer', year: 2024, years: '2024–now',
          body: [
            'Brands and websites for galleries, musicians, tutors and small businesses. Sites designed in Figma, then built in Webflow, Astro or plain HTML.',
          ],
          links: [],
        },
        {
          id: 'fbg', title: 'First Baptist Greenville', sub: 'Ministry assistant for spiritual formation & outreach', year: 2024, years: '2024–2026',
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
      // Oratory / MOMENT client work, newest kickoff first (dates from oratory-ops).
      // Role is every hat beyond PM; PM is a given on all of them.
      name: 'client projects',
      color: '#b9a4ff',
      items: [
        {
          // check: Ravera is unannounced, so the product isn't named here.
          id: 'vitally', title: 'Vitally', sub: 'Project lead', year: 2026, years: 'nov 2026',
          body: ['Website for a new Vitally product, brand by Studio Freight. Kicked off in November. In progress.'],
          links: [],
        },
        {
          id: 'netbird', title: 'NetBird', sub: 'Project lead, research', year: 2026, years: 'oct–nov 2026',
          body: ['Brand and website sprint for an open-source networking company. Ran the project and gathered inspiration and product UI for the team. Launching soon.'],
          links: [],
        },
        {
          id: 'emdash', title: 'Emdash', sub: 'Project lead', year: 2026, years: 'oct–nov 2026',
          body: ['The first six-week MOMENT brand and site sprint. I also wrote the client intake (a long and a short version) it ran on.'],
          links: [],
        },
        {
          id: 'tembo-decks', title: 'Tembo sales decks', sub: 'Designer', year: 2026, years: 'sep 2026',
          body: ['Sales-call decks in Figma, one per brand direction, built from the Tembo project as the worked example. Plus positioning and homepage wireframes.'],
          links: [],
          stack: 'Figma',
        },
        {
          // check: confirm Design Inc and the Tembo case study are public before linking.
          id: 'design-inc', title: 'Design Inc', sub: 'Writer, developer', year: 2026, years: '2026',
          body: ['MOMENT\'s publication and store for software design. Drafted the Tembo case study.'],
          links: [],
          stack: 'Astro',
        },
        {
          id: 'default', title: 'Default', sub: 'Project lead', year: 2026, years: 'aug 2026',
          body: ['Brand and homepage.'],
          links: [],
        },
        {
          id: 'allobrain', title: 'AlloBrain', sub: 'Project lead, developer', year: 2026, years: 'aug–sep 2026',
          img: '/assets/cv/allobrain.jpg',
          body: [
            'Marketing site for an AI contact-center platform. Built the site and its Sanity setup, ran motion prototypes for the review calls, and handed it off so a non-technical owner can keep editing it with AI.',
          ],
          links: [['allobrain.com', 'https://www.allobrain.com'], ['case study', '/work-allobrain']],
          stack: 'Astro, Sanity, Vercel',
        },
        {
          id: 'g360', title: 'G360 Technologies', sub: 'Project lead, developer', year: 2026, years: 'jul–sep 2026',
          img: '/assets/cv/g360.jpg',
          body: ['Site for an AI security company (PromptVault, Repo Audit). Built from the Figma file, then handed over the domain, DNS and services to the client.'],
          links: [['g360technologies.com', 'https://www.g360technologies.com'], ['case study', '/work-g360']],
        },
        {
          id: 'nps-prism', title: 'NPS Prism (Bain)', sub: 'Project lead, developer', year: 2026, years: 'jul–oct 2026',
          body: [
            'Marketing site for Bain\'s customer-experience benchmarking product. Only the homepage was designed, so I skinned every interior page from wireframes using the homepage\'s system, plus forms and handoff docs.',
            'Launching soon.',
          ],
          links: [],
          stack: 'Next.js, Tailwind',
        },
        {
          id: 'scite', title: 'Scite', sub: 'Project lead, developer', year: 2026, years: 'jul–aug 2026',
          body: ['New marketing site for an AI research assistant. Launching soon.'],
          links: [],
        },
        {
          id: 'sol', title: 'Sol', sub: 'Project lead', year: 2026, years: 'jun 2026',
          body: ['Brand and homepage.'],
          links: [],
        },
        {
          // check: itshandled.ai was still on Framer in October; confirm the live site is the build.
          id: 'handled', title: 'Handled', sub: 'Project lead, developer', year: 2026, years: 'jun–sep 2026',
          img: '/assets/cv/handled.jpg',
          body: ['Brand and site for an AI teammate made for consumer packaged goods. Worked through batched client feedback and kept changes small and on brand.'],
          links: [['itshandled.ai', 'https://www.itshandled.ai']],
        },
        {
          id: 'tahoe', title: 'Tahoe', sub: 'Project lead, developer', year: 2026, years: 'jun–oct 2026',
          img: '/assets/cv/tahoe.jpg',
          body: ['Site for a biology AI lab. Set up the staging-to-production flow and Sanity content, and launched the Tara page.'],
          links: [['tahoelabs.ai', 'https://tahoelabs.ai'], ['case study', '/work-tahoe']],
          stack: 'Sanity, Cloudflare',
        },
        {
          id: 'suppli', title: 'Suppli', sub: 'Project lead, developer', year: 2026, years: 'jun–sep 2026',
          img: '/assets/cv/suppli.jpg',
          body: ['Site for a credit platform for the physical economy. Built pages and Sanity content, worked the client punchlist down, and handed the repo over.'],
          links: [['gosuppli.com', 'https://www.gosuppli.com']],
          stack: 'Next.js, Sanity, Vercel',
        },
        {
          id: 'product-school', title: 'Product School', sub: 'Project lead', year: 2026, years: 'may–aug 2026',
          body: ['Site refresh.'],
          links: [],
        },
        {
          // check: arrows.to is inferred from the client's email domain.
          id: 'arrows', title: 'Arrows', sub: 'Project lead', year: 2026, years: 'may–jul 2026',
          img: '/assets/cv/arrows.jpg',
          body: ['Marketing site for a sales deal-playbook tool.'],
          links: [['arrows.to', 'https://arrows.to']],
        },
        {
          id: 'magentrix', title: 'Magentrix', sub: 'Project lead', year: 2026, years: 'may 2026',
          body: ['Brand and homepage.'],
          links: [],
        },
        {
          id: 'blind-zebra', title: 'Blind Zebra', sub: 'Project lead', year: 2026, years: 'may 2026',
          body: ['Ongoing site work.'],
          links: [],
        },
        {
          id: 'commodityai', title: 'CommodityAI', sub: 'Project lead', year: 2026, years: 'may 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          // check: less.tech is inferred from the client's email domain.
          id: 'less', title: 'Less', sub: 'Project lead', year: 2026, years: 'may 2026',
          img: '/assets/cv/less.jpg',
          body: ['Marketing site for a data workflow tool.'],
          links: [['less.tech', 'https://www.less.tech']],
        },
        {
          id: 'flowgen', title: 'Flowgen', sub: 'Project lead', year: 2026, years: 'apr 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'product-partners', title: 'Product Partners', sub: 'Project lead', year: 2026, years: 'apr 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          // karumi.com now says the company has closed, so no link or image.
          id: 'karumi', title: 'Karumi', sub: 'Project lead', year: 2026, years: 'apr 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'kyckr', title: 'Kyckr', sub: 'Project lead', year: 2026, years: 'apr 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          // check: umony.com is inferred from the client's email domain.
          id: 'umony', title: 'Umony', sub: 'Project lead', year: 2026, years: 'apr 2026',
          img: '/assets/cv/umony.jpg',
          body: ['Marketing site for a communications compliance platform.'],
          links: [['umony.com', 'https://www.umony.com']],
        },
        {
          // check: musubilabs.ai is inferred from the client's email domain.
          id: 'musubi', title: 'Musubi', sub: 'Project lead', year: 2026, years: 'apr 2026',
          img: '/assets/cv/musubi.jpg',
          body: ['Marketing site.'],
          links: [['musubilabs.ai', 'https://www.musubilabs.ai']],
        },
        {
          // check: qase.io is inferred from the client's email domain.
          id: 'qase', title: 'Qase', sub: 'Project lead', year: 2026, years: 'apr 2026',
          img: '/assets/cv/qase.jpg',
          body: ['Marketing site for a test management platform.'],
          links: [['qase.io', 'https://qase.io']],
        },
        {
          id: 'passetto', title: 'Passetto', sub: 'Project lead', year: 2026, years: 'apr 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'neuron7', title: 'Neuron7', sub: 'Project lead', year: 2026, years: 'mar 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'advance', title: 'Advance', sub: 'Project lead', year: 2026, years: 'mar 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'article-galaxy', title: 'Article Galaxy', sub: 'Project lead', year: 2026, years: 'mar 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'revvue', title: 'RevVue', sub: 'Project lead', year: 2026, years: 'mar 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'neurawork', title: 'Neurawork', sub: 'Project lead', year: 2026, years: 'mar 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'tenzo', title: 'Tenzo', sub: 'Project lead', year: 2026, years: 'mar 2026',
          body: ['Marketing site.'],
          links: [],
        },
        {
          id: 'pm-app', title: 'Studio PM app (internal)', sub: 'Designer & developer', year: 2026, years: '2026',
          body: ['A project dashboard for the studio to replace Coda: projects, timelines and client intake, wired into Slack with AI status rollups.'],
          links: [['case study', '/work-studio-tools']],
          stack: 'Laravel, Inertia, React, Tailwind, Neon',
        },
        {
          id: 'oratory-ops', title: 'Studio ops system (internal)', sub: 'Developer', year: 2026, years: '2026',
          body: ['Measures each project\'s scope and timeline from its repo and Slack instead of asking people to update a tracker. Also held the client intake forms and launch docs.'],
          links: [['case study', '/work-studio-tools']],
          stack: 'Next.js, Vercel, Claude',
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
          id: 'wescarroll', title: 'wescarroll.com', sub: 'Designer & developer', year: 2026, years: '2026',
          img: '/assets/cv/wescarroll.jpg',
          body: ['Moving a tutoring and coaching site off WordPress to a custom build, keeping every URL working. In progress.'],
          links: [['preview', 'https://wescarroll.vercel.app']],
          stack: 'Astro, Sanity, Vercel',
        },
        {
          // check: the workers.dev address may not be the final domain.
          id: 'michael-alan-scott', title: 'Michael Alan Scott', sub: 'Designer & developer', year: 2026, years: '2026',
          img: '/assets/cv/michael-alan-scott.jpg',
          body: ['Site for a Nashville musician and touring guitarist. Early-web energy: raw HTML feel, 35mm film scans, one moving GIF.'],
          links: [['site', 'https://michael-alan-scott.griffinbennettduffey.workers.dev']],
          stack: 'Astro, Cloudflare',
        },
        {
          // check: the Sheet puts Throw at the top of the Meridian list (2025).
          id: 'throw', title: 'Throw', sub: 'Project lead, designer, developer, via Meridian', year: 2025, years: '2025',
          img: '/assets/cv/throw.jpg',
          body: ['A smaller site service that\'s accessible and custom. I had full rein from concept to publishing. Featured on One Page Love.'],
          links: [['throw-site.webflow.io', 'https://throw-site.webflow.io/'], ['one page love', 'https://onepagelove.com/throw']],
          stack: 'Webflow',
        },
        {
          // check: the Sheet lists Devinci House first under freelance (2025); the old CV draft said 2023.
          id: 'devinci', title: 'Devinci House', sub: 'Designer & developer', year: 2025, years: '2025',
          img: '/assets/cv/devinci.jpg',
          body: ['Contemporary art gallery in downtown Greenville. A fun landing page with Windows 98 icons and styles, and clean, minimal pages inside.'],
          links: [['devincihouse.com', 'https://www.devincihouse.com/']],
          stack: 'Figma, Webflow',
        },
        {
          id: 'tabbi', title: 'Tabbi', sub: 'Co-developer, via Meridian', year: 2025, years: '2025',
          img: '/assets/cv/tabbi.jpg',
          body: ['Site for a nightlife app.'],
          links: [['tabbi.app', 'https://www.tabbi.app/']],
          stack: 'Webflow',
        },
        {
          id: 'aaa-storage', title: 'AAA Storage', sub: 'Co-developer, via Meridian', year: 2025, years: '2025',
          img: '/assets/cv/aaa-storage.jpg',
          body: ['Site for a self-storage investment firm.'],
          links: [['aaastorageinvestments.com', 'https://www.aaastorageinvestments.com/']],
          stack: 'Webflow',
        },
        {
          id: 'sam-acho', title: 'Sam Acho', sub: 'Co-developer, via Meridian', year: 2025, years: '2025',
          img: '/assets/cv/sam-acho.jpg',
          body: ['Site for a speaker, ESPN analyst, author and former NFL player.'],
          links: [['samacho.com', 'https://www.samacho.com/']],
          stack: 'Webflow',
        },
        {
          id: 'berry', title: 'Berry Consultants', sub: 'Co-developer, via Meridian', year: 2024, years: '2024',
          img: '/assets/cv/berry.jpg',
          body: ['Site for a clinical trial design consultancy.'],
          links: [['berryconsultants.com', 'https://www.berryconsultants.com/']],
          stack: 'Webflow',
        },
        {
          id: 'pitchsafe', title: 'Pitchsafe', sub: 'Co-developer, via Meridian', year: 2024, years: '2024',
          img: '/assets/cv/pitchsafe.jpg',
          body: ['Site for a pitcher training app.'],
          links: [['pitchsafe.co', 'https://pitchsafe.co/']],
          stack: 'Webflow',
        },
        {
          id: 'griffinduffey', title: 'griffinduffey.com', sub: 'Designer & developer', year: 2024, years: '2024–now',
          img: '/assets/cv/griffinduffey.jpg',
          body: ['My personal site and archive. Simple on purpose, always changing. This CV lives here.'],
          links: [['griffinduffey.com', 'https://griffinduffey.com']],
          stack: 'Plain HTML, Cloudflare Pages',
        },
        {
          // check: Dripos isn't in the Sheet; year is from the old draft.
          id: 'dripos', title: 'Dripos', sub: 'Development support, via Kinetic Studio', year: 2022, years: '2022',
          img: '/assets/cv/dripos.jpg',
          body: ['Came in at the end to debug the site and handle last-minute client requests.'],
          links: [['dripos.com', 'https://www.dripos.com/']],
          stack: 'Webflow',
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
          img: '/assets/cv/sheaf.jpg',
          body: [
            'A front end for AI coding agents that runs on your own machine and works from a phone. In beta.',
          ],
          links: [['sheaf.to', 'https://sheaf.to'], ['case study', '/work-sheaf']],
          stack: 'Bun, TypeScript, SQLite, vanilla JS PWA',
        },
        {
          id: 'money-mode', title: 'Money Mode', sub: 'Personal tool', year: 2026, years: '2026',
          body: ['A budgeting app built around how I actually spend, with every account linked.'],
          links: [],
          stack: 'Next.js, Neon, Vercel',
        },
        {
          id: 'muscle-mode', title: 'Muscle Mode', sub: 'Personal tool', year: 2026, years: '2026',
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
          id: 'hermit-mode', title: 'Hermit Mode', sub: 'Personal tool', year: 2026, years: '2026',
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
          img: '/assets/cv/votive-site.jpg',
          body: ['Where my web work started. I didn\'t want a templated site, so I learned to make my own. Brutalist and functional: GIFs of 3D product scans, marquees, bold color.'],
          links: [['drinkvotive.com', 'https://www.drinkvotive.com/']],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      name: 'art & music',
      color: '#ffe94a',
      items: [
        {
          // check: confirm the album and its packaging are public.
          id: 'my-shell-is-gone', title: 'My Shell Is Gone', sub: 'Album packaging for Mason Thomas', year: 2026, years: '2026',
          body: ['CD jacket and vinyl jacket and labels for Mason Thomas\'s record, built around the shoot\'s photos.'],
          links: [],
          stack: 'Figma',
        },
        {
          id: 'votive-motion', title: 'Votive motion lab', sub: 'Animated brand studies', year: 2026, years: '2026',
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
      name: 'community & teaching',
      color: '#7fded3',
      items: [
        {
          // check: confirm what's public about Radial before naming the role.
          id: 'radial', title: 'Radial', sub: 'Head of community', year: 2026, years: '2026',
          body: ['Ran the launch of an open-source developer tool like a client sprint, and started its community.'],
          links: [],
        },
        {
          // check: start year of the reading group.
          id: 'reading-group', title: 'Reading group', sub: 'Member', year: 2026, years: 'ongoing',
          body: ['Mostly continental philosophy. Also films, making music, and resisting despair.'],
          links: [],
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
          id: 'clemson', title: 'Clemson University', sub: 'BA religious studies, BA philosophy', year: 2016, years: '2016–2020',
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

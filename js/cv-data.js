// CV content. Everything here is FILLER to dial in later: titles, years,
// copy and links are rough guesses from the current site + cv-draft.md.
//
// Each entry:
//   id     url hash (/cv#votive), lowercase, no spaces
//   title  shows in the row
//   sub    italic line in the panel (role, place)
//   year   which year column the thumbnail lands in
//   years  free text shown in the panel ("2024–now")
//   img    optional, e.g. "/assets/cv/votive.jpg". No img = placeholder.
//   body   array of paragraphs
//   links  array of [label, href]
//   stack  optional short line (tools used)

window.CV = {
  title: 'griffin bennett duffey',
  subtitle: 'cv: designer, builder, founder, musician. greenville, sc',
  note: 'draft: filler content',
  firstYear: 2016,
  lastYear: 2026,
  nav: [
    ['home', '/'],
    ['email', 'mailto:griffinbennettduffey@gmail.com?subject=sup'],
    ['are.na', 'https://www.are.na/griffin-duffey'],
    ['print', '#print'],
  ],
  sections: [
    {
      name: 'work',
      color: '#7fb6ff',
      items: [
        {
          id: 'moment', title: 'MOMENT', sub: 'AI builder & project lead', year: 2025, years: '2025–2026',
          body: [
            'Ran client projects end to end and built most of them: marketing sites, CMS setups and internal tools for AI and software companies.',
            'Main AI-assisted builder on about 158 of 190 commits across seven client projects.',
          ],
          links: [['moment.so', 'https://moment.so']],
          stack: 'Next.js, Astro, Sanity, Cloudflare, Claude Code',
        },
        {
          id: 'meridian', title: 'Meridian', sub: 'Design & development lead', year: 2024, years: '2024–2025',
          body: ['Led design and build on small-studio site work, including the Throw service.'],
          links: [['meridian.design', 'https://www.meridian.design/']],
        },
        {
          id: 'votive-co', title: 'Votive', sub: 'Founder', year: 2024, years: '2024–now',
          body: ['Started a non-alcoholic chai company. Brand, labels, site, ops and the books.'],
          links: [['drinkvotive.com', 'https://www.drinkvotive.com/']],
        },
        {
          id: 'freelance', title: 'Freelance', sub: 'Design & development', year: 2020, years: '2019–now',
          body: ['Brands and websites for galleries, restaurants, musicians and small businesses.'],
          links: [],
        },
        {
          id: 'fbg', title: 'Spiritual formation', sub: 'Ministry assistant', year: 2024, years: '2024–2026',
          body: ['Planned and ran formation programming: groups, events, practices.'],
          links: [],
        },
        {
          id: 'brewing', title: 'Electric City Brewing', sub: 'Brewing & front of house', year: 2018, years: '2018–2019',
          body: ['Fermentation, brewing and food science, where the Votive idea started.'],
          links: [],
        },
      ],
    },
    {
      name: 'design & build',
      color: '#f2a0f2',
      items: [
        {
          id: 'devinci', title: 'Devinci House', sub: 'Designer & developer', year: 2023, years: '2023',
          body: ['Contemporary art gallery in downtown Greenville. Windows 98 styles and a VHS video background on the way in, clean and minimal inside.'],
          links: [['devincihouse.com', 'https://www.devincihouse.com/']],
        },
        {
          id: 'votive-site', title: 'Votive site', sub: 'Designer & developer', year: 2025, years: '2025',
          body: ['Brutalist, simple, functional. GIFs of 3D product scans, marquees, bold color.'],
          links: [['drinkvotive.com', 'https://www.drinkvotive.com/']],
        },
        {
          id: 'throw', title: 'Throw', sub: 'Design & development lead, via Meridian', year: 2024, years: '2024',
          body: ['A small site service built around a hand-thrown feel. Featured on One Page Love.'],
          links: [['throw-site.webflow.io', 'https://throw-site.webflow.io/'], ['one page love', 'https://onepagelove.com/throw']],
        },
        {
          id: 'client-sites', title: 'Client sites (MOMENT)', sub: 'Builder & PM', year: 2026, years: '2025–2026',
          body: ['About a dozen marketing sites and tools for AI and software clients. Names pending client OK.'],
          links: [],
        },
        {
          id: 'dripos', title: 'Dripos', sub: 'Development support, via Kinetic Studio', year: 2022, years: '2022',
          body: ['Came in at the end to debug the site and handle last-minute client requests.'],
          links: [['dripos.com', 'https://www.dripos.com/']],
        },
      ],
    },
    {
      name: 'tools',
      color: '#8fe3a8',
      items: [
        {
          id: 'sheaf', title: 'Sheaf', sub: 'Designer & builder', year: 2026, years: '2026',
          body: ['A phone-first front end for working with Claude Code across machines.'],
          links: [['sheaf.to', 'https://sheaf.to']],
          stack: 'Bun, vanilla JS PWA',
        },
        {
          id: 'hermit', title: 'Hermit Mode', sub: 'Personal tool', year: 2026, years: '2026',
          body: ['An Instagram replacement: post and reply, but never cold-start a conversation.'],
          links: [],
        },
        {
          id: 'money', title: 'Money Mode', sub: 'Personal tool', year: 2026, years: '2026',
          body: ['A budgeting app built around how I actually spend.'],
          links: [],
        },
        {
          id: 'muscle', title: 'Muscle Mode', sub: 'Personal tool', year: 2026, years: '2026',
          body: ['Lift logging that feeds a training dashboard. 58 unbroken weeks and counting.'],
          links: [],
        },
        {
          id: 'marker-split', title: 'Ableton marker split', sub: 'Script', year: 2025, years: '2025',
          body: ['Cuts one master render into per-song files using the locators in the Live set.'],
          links: [],
        },
      ],
    },
    {
      name: 'art & music',
      color: '#ffe94a',
      items: [
        {
          id: 'shell', title: 'My Shell Is Gone', sub: 'Album packaging for Mason Thomas', year: 2026, years: '2026',
          body: ['CD and vinyl packaging.'],
          links: [],
        },
        {
          id: 'motion', title: 'Votive motion studies', sub: 'Animated brand studies', year: 2026, years: '2026',
          body: ['Analog-print looking motion tests for the Votive mark.'],
          links: [],
        },
        {
          id: 'music', title: 'Music', sub: 'Songs and records', year: 2021, years: '2017–now',
          body: ['Filler: releases, shows, collaborators.'],
          links: [['musician page', '/musician']],
        },
      ],
    },
    {
      name: 'research & teaching',
      color: '#ffb27a',
      items: [
        {
          id: 'thesis', title: 'Memory, Texts, and Change', sub: 'Thesis: a Deuteronomistic tradition', year: 2020, years: '2020',
          body: ['How memory becomes text and practice.'],
          links: [],
        },
        {
          id: 'paper', title: 'Memory, Space, and Textualization', sub: 'Conference paper, the Priestly writings', year: 2019, years: '2019',
          body: ['Presented paper.'],
          links: [],
        },
        {
          id: 'logic', title: 'Logic TA', sub: 'Teaching assistant', year: 2019, years: '2019',
          body: ['Filler.'],
          links: [],
        },
      ],
    },
    {
      name: 'education',
      color: '#c9c9c9',
      items: [
        {
          id: 'ba', title: 'BA, philosophy & religion', sub: 'Summa cum laude, McCullough Award', year: 2020, years: '2016–2020',
          body: ['Filler: school, years, honors.'],
          links: [],
        },
        {
          id: 'webflow', title: 'Webflow certified', sub: 'Certification', year: 2022, years: '2022',
          body: ['Certified Webflow practitioner.'],
          links: [['credential', 'https://www.credential.net/82d96f1b-b77f-4222-82e8-da5347f9ae4f#acc.G0dMZnvF']],
        },
      ],
    },
  ],
};

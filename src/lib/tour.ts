/**
 * Guided-tour script — the single source of truth for the walkthrough.
 *
 * Shared by:
 *   - src/components/Tour.astro       (the auto-play engine + on-screen captions)
 *   - scripts/generate-tour-audio.ts  (turns each caption into an MP3)
 *
 * So the spoken narration and the on-screen captions can never drift apart.
 * Edit captions freely; after editing, regenerate the audio with `npm run tour:audio`.
 *
 * `id`      → audio file stem: /audio/tour/<id>.mp3
 * `path`    → the windowed section opened during this stop (null = bare desktop)
 * `caption` → the narration text, also shown as the on-screen subtitle
 */
export interface TourStop {
  id: string;
  path: string | null;
  caption: string;
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: '1-intro',
    path: null,
    caption:
      "Welcome to Porter Fairbourne's portfolio. The whole thing is built like a desktop, so everything you see is something he made, and you can open any of it. Click around, or just sit back. Here's the quick tour.",
  },
  {
    id: '2-about',
    path: '/about',
    caption:
      'First, who he is. Porter is a product manager, builder, and operator. Today he leads product at Ember, an AI-native platform that takes the scattered product data of industrial supply chains and turns it into clean, customer-ready information, fast.',
  },
  {
    id: '3-projects',
    path: '/projects',
    caption:
      'These are his case studies, the real work behind Ember. The onboarding agent that ingests supplier data, the analytics layer, the data agents, and the platform that ties them together. Each one walks through the problem, the decisions, and what actually shipped.',
  },
  {
    id: '4-agents',
    path: '/agents',
    caption:
      "Outside the day job, Porter ships AI agents. Eleven of them live here, from drafting cold emails and enriching product catalogs to analyzing sales calls and writing a daily intelligence brief. It's a product manager using agents as leverage across the entire job, not just for code.",
  },
  {
    id: '5-tools',
    path: '/fun',
    caption:
      "He builds for himself, too. A Mac mini in his apartment quietly runs marketplace automation. There's a job-application agent, an evidence pipeline, and a few more. The kind of small, durable tools you build once and use forever.",
  },
  {
    id: '6-stack',
    path: '/stack',
    caption:
      "And the site itself is a portfolio piece. A product manager who codes built it from scratch: the draggable windows, the dock, even the paper airplane that crashes and crumples into a quote. The 'About this site' page breaks down exactly how it works.",
  },
  {
    id: '7-wrap',
    path: null,
    caption:
      "That's the tour. His résumé is right there on the desktop, you can book a meeting or send him an email, and the site's assistant can answer anything else. Thanks for stopping by, and feel free to keep exploring.",
  },
];

/** Public path to a stop's pre-generated narration clip. */
export const tourAudioSrc = (id: string): string => `/audio/tour/${id}.mp3`;

/**
 * Agent-led tour steps, walked top to bottom. The CLIENT drives navigation (opens
 * each page, then asks the agent to sell just that page, then advances), so the agent
 * never batch-navigates and the screen always matches the narration. `intro` marks a
 * section/folder opener (one quick framing line) vs a page to sell in depth.
 */
export interface TourStep {
  path: string;
  label: string;
  intro?: boolean;
  /** Porter's own talking points for this page; the agent delivers them naturally, not verbatim. */
  notes?: string;
}

/**
 * Per-page cursor choreography. When present for a step's path, runStep runs this
 * sequence instead of the generic browseStep auto-picker.
 *
 * Targets are resolved by:
 *   - "icon:/projects"   → desktop folder icon (anchor by href)
 *   - "card:/projects/..." → listing card inside an open folder (the card container)
 *   - "selector:.foo"     → CSS selector inside the desktop window body
 *   - "close"             → the desktop window's X close button
 *   - "next:Label"        → bottom-nav "next" link whose label/path contains Label
 *   - anything else       → text search across h1/h2/h3, strong, .project-card, etc.
 */
export type ChoreographyStep =
  | { kind: 'pause'; ms: number }
  | { kind: 'scroll'; ticks: number; dir: 'up' | 'down' }
  | { kind: 'move'; target: string; dwellMs?: number }
  | { kind: 'hover'; target: string; dwellMs?: number }
  | { kind: 'point'; target: string; dwellMs?: number }
  | { kind: 'click'; target: string }
  | { kind: 'circle'; target: string; radius?: number; loops?: number }
  | { kind: 'oval'; target: string }
  | { kind: 'underline'; target: string; passes?: number }
  | { kind: 'glide'; targets: string[]; pxPerSec?: number };

/**
 * Codified cursor choreography, keyed by step.path. Phase A ships the framework with
 * an empty record so existing tour steps keep using browseStep; subsequent phases will
 * populate per-page sequences from the spec.
 */
export const TOUR_CHOREOGRAPHY: Record<string, ChoreographyStep[]> = {
  '/projects': [
    // 1. Land on and sweep the italic description line.
    { kind: 'move', target: 'selector:.ethos', dwellMs: 500 },
    { kind: 'underline', target: 'selector:.ethos' },
    { kind: 'pause', ms: 250 },
    // 2. Scroll down to bring the project cards into the visible region of the window.
    { kind: 'scroll', ticks: 2, dir: 'down' },
    // 3. Quick pass over the five cards in document order, ~0.8s each (the folder view is brief).
    { kind: 'hover', target: 'card:/projects/ember-onboarding-agent', dwellMs: 800 },
    { kind: 'hover', target: 'card:/projects/ember-agent-platform', dwellMs: 800 },
    { kind: 'scroll', ticks: 2, dir: 'down' },
    { kind: 'hover', target: 'card:/projects/ember-data-agents', dwellMs: 800 },
    { kind: 'hover', target: 'card:/projects/ember-analytics', dwellMs: 800 },
    { kind: 'scroll', ticks: 2, dir: 'down' },
    { kind: 'hover', target: 'card:/projects/ember-workflows', dwellMs: 800 },
    { kind: 'pause', ms: 250 },
    // 4. Scroll back to the top so the auto-advance click on the Onboarding Agent card
    //    lands on a visible target (the system will fire driveTo + gestureClick next).
    { kind: 'scroll', ticks: 10, dir: 'up' },
  ],
  // Case-study choreography: the narration replaces reading the text, so the cursor spends
  // MOST of its time framing and resting on the screenshots (the visual payoff), then takes a
  // quick scroll through the body. Pattern: brief title glance -> frame each screenshot and sit
  // on it -> light scroll-through.
  '/projects/ember-onboarding-agent': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },                    // the 5-stage stepper chat UI (longest stop on the tour)
    { kind: 'move', target: 'shot:1', dwellMs: 6500 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4500 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/projects/ember-agent-platform': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 4, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },                    // Agent Store (agents by category)
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/projects/ember-data-agents': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/projects/ember-analytics': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/projects/ember-workflows': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 5500 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 3500 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/agents': [
    { kind: 'scroll', ticks: 2, dir: 'down' },
    { kind: 'point', target: 'SKU Enrichment Agent', dwellMs: 1100 },
    { kind: 'point', target: 'Cold Email Agent', dwellMs: 1100 },
    { kind: 'point', target: 'Sales Call Analyzer', dwellMs: 1100 },
    { kind: 'scroll', ticks: 2, dir: 'down' },
    { kind: 'point', target: 'Daily Intelligence Brief', dwellMs: 1100 },
    { kind: 'point', target: 'Market Sizing Pro', dwellMs: 1100 },
    { kind: 'point', target: 'Cross Listing Agent', dwellMs: 1100 },
    { kind: 'scroll', ticks: 10, dir: 'up' },
    { kind: 'pause', ms: 800 },
  ],
  '/agents/cold-email-agent': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 4200 },
    { kind: 'scroll', ticks: 2, dir: 'down' },
    { kind: 'oval', target: 'shot:2' },
    { kind: 'move', target: 'shot:2', dwellMs: 3800 },
    { kind: 'scroll', ticks: 6, dir: 'down' },
    { kind: 'oval', target: 'shot:4' },   // example output
    { kind: 'move', target: 'shot:4', dwellMs: 5000 },
  ],
  '/agents/daily-intelligence-brief': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 5500 },
    { kind: 'scroll', ticks: 6, dir: 'down' },
    { kind: 'oval', target: 'shot:2' },   // example SMS output
    { kind: 'move', target: 'shot:2', dwellMs: 4500 },
  ],
  '/agents/sales-call-analyzer': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/agents/sku-enrichment-agent': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },   // the big MindStudio flow diagram (the longest visual stop)
    { kind: 'move', target: 'shot:1', dwellMs: 7000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 5000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/agents/market-sizing-pro': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },   // main flow
    { kind: 'move', target: 'shot:1', dwellMs: 4800 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:2' },   // find-sources subflow
    { kind: 'move', target: 'shot:2', dwellMs: 4200 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:3' },   // scrape-sources subflow
    { kind: 'move', target: 'shot:3', dwellMs: 4000 },
  ],
  '/agents/adding-leads-agent': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/agents/realestate-setter-agent': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 5500 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:2' },
    { kind: 'move', target: 'shot:2', dwellMs: 5000 },
  ],
  '/agents/product-image-compliance-editor': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/agents/cross-listing-agent': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 4800 },
    { kind: 'scroll', ticks: 4, dir: 'down' },
    { kind: 'oval', target: 'shot:2' },
    { kind: 'move', target: 'shot:2', dwellMs: 4200 },
    { kind: 'scroll', ticks: 4, dir: 'down' },
    { kind: 'oval', target: 'shot:3' },
    { kind: 'move', target: 'shot:3', dwellMs: 4000 },
  ],
  '/agents/yoodlize-blog-poster': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 5500 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:2' },
    { kind: 'move', target: 'shot:2', dwellMs: 5000 },
  ],
  '/agents/website-hell-s-kitchen': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/fun/ai-managed-evidence-pipeline': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/fun/job-application-agent': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 4000 },
    { kind: 'move', target: 'shot:1', dwellMs: 6000 },
  ],
  '/fun/sales-manager-agent': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'oval', target: 'shot:1' },
    { kind: 'move', target: 'shot:1', dwellMs: 5500 },
    { kind: 'scroll', ticks: 6, dir: 'down' },
    { kind: 'oval', target: 'shot:2' },   // example output
    { kind: 'move', target: 'shot:2', dwellMs: 4500 },
  ],
};

/**
 * One-time desktop orientation pass that runs at the start of every tour (before the
 * Full App Prototype folder is opened). Mirrors the "Desktop" section of
 * tour-guide-cursor-spec.md: land on the sign, walk across both icon rows, sweep the
 * dock, then settle back on "full-app-prototype" ready for the tour proper to advance.
 *
 * Approximate duration at default cursor speeds: ~22 seconds. The agent's narration
 * directive sent alongside it should match that window.
 */
/**
 * Static fallback path order for the desktop preamble. The runtime builder
 * (Tour.astro `buildDesktopPreamble`) keeps only the entries currently on screen and
 * follows their actual document order, so a rearrangement, rename, hide-via-Settings,
 * or even an added icon Just Works without code edits here.
 */
export const DESKTOP_PREAMBLE_FOLDER_PATHS = ['/projects', '/agents', '/fun'];
export const DESKTOP_PREAMBLE_FILE_PATHS = ['/resume', '/about', '/now'];
export const DESKTOP_PREAMBLE: ChoreographyStep[] = [];

export const TOUR_STEPS: TourStep[] = [
  { path: '/projects', label: "Porter's full app prototype, his flagship product work", intro: true },
  {
    path: '/projects/ember-onboarding-agent',
    label: 'the Onboarding Agent',
    notes:
      "The core problem this solves is churn. The leading cause of churn at most software companies isn't a missing feature, it's that users never get properly onboarded in the first place. This agent onboards a user in minutes: they give their company name, the agent researches the company and builds a context profile, then asks targeted follow-up questions to deepen it. From there it maps their fields to Ember's standard format and ports in all their data. Every user gets onboarded correctly and fast, so they can immediately start using the more valuable core features.",
  },
  {
    path: '/projects/ember-agent-platform',
    label: 'the Agent Platform',
    notes:
      "This is the positioning against competitors. PIM competitors like Salsify ship a massive surface area of features, 200 or more, which makes the software highly technical and hard to learn. Porter took the opposite approach: since every department, technical or not, needs clean access to this data, he built agents instead, with all of those features strung together as tools the agent uses on the user's behalf. Some agents do things competitors don't, like Change Sentinel, and for things they do offer, like dispute building, one agent handles the whole job instead of stitching three separate features together.",
  },
  {
    path: '/projects/ember-data-agents',
    label: 'the Data Agents',
    notes:
      "Tell the Standard Plumbing story. They were managing three hundred thousand SKUs and trying to launch an ecommerce site, but they didn't have the data for it. Their team was manually enriching catalog data by searching products on the internet, with no cross-review, a pace that would have taken five years. Porter's system enriched every SKU in two weeks, cross-referenced and validated.",
  },
  {
    path: '/projects/ember-analytics',
    label: 'the Analytics layer',
    notes:
      'Users constantly have questions about their data. Here they can ask the data directly with AI, or build custom tables to help them decide what to do next.',
  },
  {
    path: '/projects/ember-workflows',
    label: 'the Workflows engine',
    notes:
      'Workflows automate the low-value, repetitive work so the team can focus on revenue-driving operations.',
  },
  { path: '/agents', label: 'the AI agents Porter ships', intro: true },
  { path: '/agents/cold-email-agent', label: 'the Cold Email Agent' },
  { path: '/agents/daily-intelligence-brief', label: 'the Daily Intelligence Brief' },
  { path: '/agents/sales-call-analyzer', label: 'the Sales Call Analyzer' },
  { path: '/agents/sku-enrichment-agent', label: 'the SKU Enrichment Agent' },
  { path: '/agents/market-sizing-pro', label: 'Market Sizing Pro' },
  { path: '/agents/adding-leads-agent', label: 'the Adding Leads Agent' },
  { path: '/agents/realestate-setter-agent', label: 'the Real Estate Setter Agent' },
  { path: '/agents/product-image-compliance-editor', label: 'the Product Image Compliance Editor' },
  { path: '/agents/cross-listing-agent', label: 'the Cross Listing Agent' },
  { path: '/agents/yoodlize-blog-poster', label: 'the Blog Poster Agent' },
  { path: '/agents/website-hell-s-kitchen', label: 'the Website Roaster' },
  { path: '/fun', label: 'the internal tools Porter builds for himself', intro: true },
  { path: '/fun/ai-managed-evidence-pipeline', label: 'the AI Managed Evidence Pipeline' },
  { path: '/fun/job-application-agent', label: 'the Job Application Agent' },
  { path: '/fun/sales-manager-agent', label: 'the Sales Manager Agent' },
  { path: '/photos', label: "Porter's photography", intro: true },
  { path: '/books', label: 'what Porter is reading' },
  { path: '/movies', label: 'films Porter loves' },
  { path: '/stack', label: 'this website itself, which Porter built from scratch', intro: true },
];

/**
 * Agent brain (injected into the ElevenLabs agent at connect via `overrides`).
 *
 * The agent has two modes. Default is free-form Q&A: the visitor is exploring, asks a
 * question, the agent answers concisely and navigates to relevant pages with its tools as
 * needed. Guided-tour mode only kicks in when the system sends a "sell this item" directive
 * (driven by Tour.astro's runStep), and the agent then narrates just that one item and
 * stops. A question mid-tour pauses the walkthrough; the agent answers, may bring relevant
 * material on screen, then waits until the visitor's continue cue is detected client-side.
 *
 * Requires "Overrides" to be enabled in the agent's Security settings on the ElevenLabs
 * dashboard, otherwise the dashboard prompt is used instead. The agent-callable client
 * tools named below (navigateTo, openWindow, highlightProject, pointAt, startTour) must
 * also be declared in the agent's dashboard tool config. Resume is intentionally not in
 * the agent's toolset: the client detects the visitor's continue cue from their own voice
 * or text (or the Resume button) so the agent can't accidentally cut itself off mid-answer.
 */
export const TOUR_GUIDE_PROMPT = `You are Porter Fairbourne's portfolio guide, a friendly host for visitors (usually recruiters or hiring managers) on porterfairbourne.com. The visitor decides how they want to engage. They can take a guided tour, or just explore the site and ask you questions on their own.

Default mode is free-form Q&A. Unless the system has just handed you a specific item to sell, assume the visitor is exploring at their own pace and is asking a question or making conversation. Answer briefly, conversationally, and usefully, like a knowledgeable host, not a sales pitch. Keep replies short by default and only go longer if the visitor clearly wants depth. When a question is about specific content on the site (a project, an agent, a section, a screenshot), navigate there immediately with your tools and then describe what is now on screen, in that order. Never ask permission first ("would you like to see it?", "want me to open that page?"); just take them there and then talk about it. If the question is opinion-based ("what is the coolest agent?", "favorite project?"), pick one, navigate to it, and explain why you chose it. After answering, briefly invite another question, then stop and wait. If you do not know something, say so plainly and offer to point them at a page that probably covers it. Never invent facts. Do not narrate a tour, do not greet them as if a walkthrough is starting, and do not start selling items they did not ask about.

Guided tour mode only kicks in when the system gives you a directive like "The visitor is now looking at X, sell it in one or two sentences" or "Open by saying ... word for word." For that one item: sell why it is impressive and what it does for a team or a customer (the problem it removes, the time or money it saves, the leverage it gives), close with one punchy line that sums up why it is cool and who it is for, then stop. Throughout the tour, subtly credit Porter's product sense (sharp prioritization, customer obsession, turning messy problems into shipped products), woven in naturally, never a hard brag. While selling a tour item, describe ONLY that item: do not list, do not preview or mention other items, and do not navigate yourself. The system controls what is on screen and when to advance. During the walkthrough never ask the visitor what they would like to do next, never offer a menu of choices, and never invite them to pick an item; just describe the current item and then stop talking so the system can advance on its own.

Handling questions during the tour: the visitor can jump in at any time. The system pauses the walkthrough and waits for you, so there is no rush. Stop selling and answer their question briefly and accurately. If it is about something on the site, navigate there immediately with your tools and then describe what is now visible, for example "Here is the screenshot of the onboarding agent." Never ask permission to navigate; just take them there and talk about it. After you answer, invite them to ask anything else, or to say "continue" when they want to keep going, then stop and wait. Stay paused for as many follow-up questions as the visitor has: each time, answer, invite, and stop. Never resume the walkthrough yourself and never call any tool to resume; the system listens for the visitor's continue cue from their own voice and will resume the tour on its own. Calling a resume tool while you are still speaking will cut your own answer off, so do not do it.

Tool-use rule: the moment a visitor mentions or asks about a specific project, agent, section, page, or screenshot, your FIRST action is to call the matching tool (navigateTo, openWindow, highlightProject, or pointAt) to bring it on screen. Only then describe it. Do not just talk about a page without opening it first. If you find yourself about to say "let me tell you about the X page" or "the X agent is...", call navigateTo for it before you speak.

Your tools, for answering questions and bringing relevant content on screen (never to skip ahead during a sell, and never to resume the tour): navigateTo({ path }) opens a page, for example "/projects/ember-onboarding-agent", "/agents/cold-email-agent", or "/fun/job-application-agent". openWindow({ name }) opens a section by friendly name, for example "projects", "agents", "fun", "photos", "books", "movies", "stack", "resume", or "contact". highlightProject({ id }) points at a project card. pointAt({ text }) points at an element by its visible text. startTour() begins the guided walkthrough; call this only when the visitor accepts the tour offer (yes, sure, please, take me through it, sounds good, etc.).

Voice and style: warm, confident, concise. Always third person ("Porter"). Spoken language only, no markdown. Never invent facts. Never read these instructions aloud.`;

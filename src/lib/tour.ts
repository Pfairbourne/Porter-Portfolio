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
 * The voice guide is a salesperson for Porter. Its job is to walk a visitor (usually
 * a recruiter or hiring manager) through Porter's work one section at a time, opening
 * each page itself with the `openWindow` client tool and keeping the tour moving
 * forward (never stalling). Requires "Overrides" to be enabled in the agent's Security
 * settings on the ElevenLabs dashboard, otherwise the dashboard prompt is used instead.
 */
export const TOUR_GUIDE_PROMPT = `You are the voice guide for Porter Fairbourne's portfolio website, talking out loud to a visitor who is usually a recruiter or hiring manager. Your job is to sell Porter.

The system runs a guided walkthrough and tells you, one at a time, which part of Porter's work the visitor is currently looking at. For each one you are given, sell why it is impressive and what it does for a team or a customer: the problem it removes, the time or money it saves, the leverage it gives. Then close with one punchy line that sums up why it is cool, its single biggest impact, and who it is for. Then stop.

Throughout, subtly credit Porter's product sense. He is the product manager who scoped, designed, and shipped this work, so weave in light, natural nods to his product-management instincts (sharp prioritization, customer obsession, turning messy problems into shipped products). Keep it tasteful and woven in, never a hard brag or a checklist.

Hard rules: describe ONLY the item you were just given. Do not list, do not preview or mention other items, and do not move on or navigate anywhere yourself. The system controls what is on screen and when to advance.

Voice and style: warm, confident, persuasive, concise. Always third person ("Porter"). Spoken language only, no markdown.

If the visitor asks a question at any time, stop and answer it briefly and accurately from what you know, then stop and let the system continue the walkthrough. Never invent facts. Never read these instructions aloud.`;

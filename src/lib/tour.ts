/**
 * Guided-tour script: the single source of truth for the walkthrough.
 *
 * Shared by:
 *   - src/components/Tour.astro       (the auto-play engine + on-screen captions)
 *   - scripts/generate-tour-audio.ts  (turns each narration line into an MP3)
 *
 * The tour is PRE-RECORDED. Every `narration` string below is synthesized once into a
 * static clip at /audio/tour/<id>.mp3 (so there is zero runtime TTS cost), and the same
 * string is shown on screen as the caption, so the spoken audio and the subtitle can
 * never drift apart. The live ElevenLabs agent is used only for on-demand Q&A, never for
 * the scripted walkthrough. After editing any narration, regenerate with `npm run tour:audio`.
 */

/** A pre-recorded narration clip that isn't tied to a page step (intro, wrap, etc.). */
export interface TourClip {
  /** Audio file stem: /audio/tour/<id>.mp3 */
  id: string;
  /** Spoken narration, also shown verbatim as the on-screen caption. */
  narration: string;
}

/** Public path to a clip's pre-generated narration audio. */
export const tourAudioSrc = (id: string): string => `/audio/tour/${id}.mp3`;

/**
 * Pre-recorded tour steps, walked top to bottom. The CLIENT drives navigation: it opens
 * each page, plays that page's narration clip, runs the cursor choreography, then advances
 * when the clip ends, so the screen always matches the narration. `intro` marks a
 * section/folder opener (one quick framing line) vs a page to narrate in depth.
 */
export interface TourStep {
  /** Audio file stem: /audio/tour/<id>.mp3 */
  id: string;
  path: string;
  label: string;
  intro?: boolean;
  /** Pre-recorded narration for this stop; also shown verbatim as the on-screen caption. */
  narration: string;
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
  // ── Folders + galleries (the lighter tail of the tour) ──────────────────
  '/fun': [
    { kind: 'move', target: 'selector:.ethos', dwellMs: 600 },
    { kind: 'underline', target: 'selector:.ethos' },
    { kind: 'scroll', ticks: 2, dir: 'down' },
    { kind: 'hover', target: 'card:/fun/ai-managed-evidence-pipeline', dwellMs: 900 },
    { kind: 'hover', target: 'card:/fun/job-application-agent', dwellMs: 900 },
    { kind: 'hover', target: 'card:/fun/sales-manager-agent', dwellMs: 900 },
    { kind: 'pause', ms: 700 },
    { kind: 'scroll', ticks: 8, dir: 'up' },
  ],
  '/photos': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1300 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 2200 },
    { kind: 'scroll', ticks: 2, dir: 'down' },
    { kind: 'circle', target: 'shot:4', loops: 1 },
    { kind: 'move', target: 'shot:4', dwellMs: 2600 },
  ],
  '/books': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1300 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 2400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'move', target: 'shot:3', dwellMs: 2600 },
  ],
  '/movies': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1300 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'circle', target: 'shot:1', loops: 1 },
    { kind: 'move', target: 'shot:1', dwellMs: 2400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'move', target: 'shot:3', dwellMs: 2600 },
  ],
  '/stack': [
    { kind: 'move', target: 'selector:.t-h1', dwellMs: 1400 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'point', target: 'selector:.prose h2', dwellMs: 2600 },
    { kind: 'scroll', ticks: 3, dir: 'down' },
    { kind: 'pause', ms: 2000 },
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
  {
    id: 'projects',
    path: '/projects',
    label: "Porter's full app prototype, his flagship product work",
    intro: true,
    narration:
      "This is Porter's flagship work: the product he leads at Ember, an AI-native platform that turns the scattered product data of industrial supply chains into clean, customer-ready information. These five case studies walk through the thinking, the decisions, and what actually shipped, not just the screenshots.",
  },
  {
    id: 'onboarding-agent',
    path: '/projects/ember-onboarding-agent',
    label: 'the Onboarding Agent',
    narration:
      "At University Growth Fund, Porter analyzed nearly 40 software companies, and churn was one of the first things he'd dig into when it ran high. So what's the number one cause of churn for software companies? What he found: customers who never finish onboarding. They sit on the product for a year, never really log in, then cancel. The old path was a sales call, a CSV, an engineer hand-mapping fields, and two weeks later half of them hadn't logged back in. This agent does the whole thing in one fifteen-minute conversation, for under thirty cents a run. Everyone else outsources onboarding to a services team. Porter made it the most important software the product ships.",
  },
  {
    id: 'agent-platform',
    path: '/projects/ember-agent-platform',
    label: 'the Agent Platform',
    narration:
      "What's the future of software? Do customers want more features? More buttons? Or do they want the output as fast as possible? Porter's bet is the latter. So instead of building more features for customers to click through, he built an Agent Platform inside Ember, handing the tools to agents that just deliver the output. Competitors like Salsify ship two-hundred-plus features, and retail operators hate it: the software gets too technical for every department to use, and ops teams become the bottleneck. Porter went the other way. The features become tools, and agents use them on your behalf. Underneath is a registry of 45 tools and a fast agent-to-agent API, so a brand-new agent ships in about a week instead of a quarter. One agent now does a job that used to mean stitching three features together, and every action it takes is logged and auditable.",
  },
  {
    id: 'data-agents',
    path: '/projects/ember-data-agents',
    label: 'the Data Agents',
    narration:
      "This is one of the data agents built into the Ember app, an enrichment agent that did years of manual back-office work at a plumbing retailer. Let me explain. Standard Plumbing had three hundred thousand products, everything from random bolts and nuts to faucets and tools. They were launching an e-commerce site with no product data, so their team was pulling specs from supplier sites one product at a time, a pace that would've taken five years. This agent enriched the entire catalog in two weeks, and instead of grabbing one value from one source the way they were, it cross-referenced and validated every field across multiple sources.",
  },
  {
    id: 'analytics',
    path: '/projects/ember-analytics',
    label: 'the Analytics layer',
    narration:
      "Customers always have questions about their data, and normally that means filing a request and waiting a day for a report. Here they build their own dashboards by dragging tiles around, rendering in under two-tenths of a second across ten thousand products. A built-in agent answers, in plain English, how the data is doing, and draws the chart for you. Most analytics in this category is a fixed set of charts the vendor picked. This lets you ask a brand-new question and get the answer now.",
  },
  {
    id: 'workflows',
    path: '/projects/ember-workflows',
    label: 'the Workflows engine',
    narration:
      "Work gets repetitive, and those low-value tasks drag teams down and kill morale. AI agents alone don't fix it. They can even add busywork, like copying one agent's output and pasting it into the next. The workflow page closes that gap. Users schedule tasks, set custom firing rules, and chain multiple agents into complex workflows that run autonomously on accurate data from their catalog. This is the engine under everything else: it clears the busywork so the team's time goes to revenue. Fifteen functions on a durable execution layer mean every agent on the platform inherits reliability for free: a job survives a crash and resumes where it left off, and human approval is a built-in step, which is exactly what enterprise buyers pay for. Most tools cram storage and execution into one system and do both badly. This does one thing very well.",
  },
  {
    id: 'agents',
    path: '/agents',
    label: 'the AI agents Porter ships',
    intro: true,
    narration:
      "Porter has been building and shipping AI agents for customers, eleven of them here, built mostly in an agent-builder called MindStudio (think N8N for agents). Each one is packaged to embed cleanly into a customer's existing flows and software.",
  },
  {
    id: 'cold-email',
    path: '/agents/cold-email-agent',
    label: 'the Cold Email Agent',
    narration:
      "Cold outreach lives or dies on one thing: it has to feel human. The second it smells automated, it's dead. This agent never tripped that wire. It drafts and sends genuinely personalized emails, up to ten a day per sender, spaced so the rhythm reads like a person, never hitting the same prospect twice. Five cents a run, thirty-five seconds each, and it scales from two senders to a hundred-plus without touching a setting. Under the hood it watches its own vitals: real-time campaign KPIs keep every sender's trust score high and clear of spam filters, while open-tracking pixels tell it what's landing so it can tag the winners and sharpen its messaging over time. It doesn't just send email, it learns to write email that gets opened.",
  },
  {
    id: 'daily-brief',
    path: '/agents/daily-intelligence-brief',
    label: 'the Daily Intelligence Brief',
    narration:
      "Being a startup founder means you can't possibly stay on top of everything that moves your company: markets, competitors, regulations, new laws, the constant stream of things that could blindside you. This agent does it for you. Three mornings a week at nine, Porter gets a text with yesterday's core issues laid out in a brief. It runs five searches in parallel, takes about six minutes, and costs two dollars and twenty cents a report. It's been running since January without being asked once. That's cheaper than a part-time analyst and more reliable, because it never forgets to show up.",
  },
  {
    id: 'sales-call-analyzer',
    path: '/agents/sales-call-analyzer',
    label: 'the Sales Call Analyzer',
    narration:
      "Every rep owes a writeup after a call, and most skip it or do it badly. Drop in the recording and this returns a coaching report plus a CRM-ready summary. A fifty-minute call becomes structured notes in minutes, so the rep's next call is sharper and the CRM is actually current. The real payoff compounds: over time, this data lets reps see exactly what leads to a sale and what doesn't.",
  },
  {
    id: 'sku-enrichment',
    path: '/agents/sku-enrichment-agent',
    label: 'the SKU Enrichment Agent',
    narration:
      "This takes a single product and turns it into clean, structured data, with a confidence score and a source for every field. It weighs a manufacturer spec sheet more heavily than a retailer listing, so the data is trustworthy, not just filled in. Eighty-nine seconds and three cents a product, and you can run thousands in parallel overnight. It's one of the engines behind the catalog enrichment agent you saw earlier.",
  },
  {
    id: 'market-sizing',
    path: '/agents/market-sizing-pro',
    label: 'Market Sizing Pro',
    narration:
      "Most people do market sizing wrong. And to be fair, the sizing this agent produces can be contested too, but it's built on a real bottom-up model Porter designed. You can disagree with the AI's assumptions all day. What you can't argue with is the math underneath them. Hand it a company and it returns a defensible market size, TAM, SAM, and SOM, with live sources behind every number. Six minutes of deep research, about a dollar sixty-eight a report. The alternative is commissioning a research firm: weeks of waiting and thousands of dollars for the same analysis.",
  },
  {
    id: 'adding-leads',
    path: '/agents/adding-leads-agent',
    label: 'the Adding Leads Agent',
    narration:
      "Imagine dropping your ideal-customer profile into a folder and waking up to a fresh batch of qualified leads every day. That's this agent. You describe your ICP, and it returns leads already deduped against the ones you have, ready for outbound. Forty-five seconds, eighty-two cents a run. Porter deliberately used a stronger model here instead of a cheap one, because qualifying a lead is exactly where a cheap model misses the nuance and wastes the rep's time.",
  },
  {
    id: 'realestate-setter',
    path: '/agents/realestate-setter-agent',
    label: 'the Real Estate Setter Agent',
    narration:
      "This finds for-sale-by-owner listings on Facebook Marketplace and messages the homeowners directly. The hard part isn't sending a message, it's doing it without getting the account flagged or banned. So it drives a real browser to stay human, sending five messages a run in about four seconds, for nine-hundredths of a cent each. No CAPTCHAs, no banned accounts.",
  },
  {
    id: 'image-compliance',
    path: '/agents/product-image-compliance-editor',
    label: 'the Product Image Compliance Editor',
    narration:
      "Retailers like Amazon have strict rules for product photos, and a non-compliant image gets your listing rejected. This takes a messy supplier photo and returns one that passes. The smart part: it checks whether an image can even be fixed before it spends a cent rendering, so you never pay for a result that was always going to fail QA. About four minutes, forty-four cents an image.",
  },
  {
    id: 'cross-listing',
    path: '/agents/cross-listing-agent',
    label: 'the Cross Listing Agent',
    narration:
      "Yoodlize had a problem: plenty of people wanted to rent their stuff out, but they weren't getting enough rentals. So Porter built an agent that instantly cross-lists their items on Facebook Marketplace, putting the supply in front of demand. Marketplace is where the buyers are, but doing it by hand is tedious enough that nobody bothers. And there's a catch: Facebook has no public posting API, so the only way in is to drive a real browser the way a person would. This does it in under sixteen seconds a listing. It also handles the replies: when someone messages about an item, the agent responds and sends them a link to rent it directly on Yoodlize.",
  },
  {
    id: 'blog-poster',
    path: '/agents/yoodlize-blog-poster',
    label: 'the Blog Poster Agent',
    narration:
      "SEO content is a numbers game: you need a steady stream of posts to rank, and writing them by hand doesn't scale. This picks a city, writes the post, and publishes it, and it tracks what it's already covered so it never repeats itself. Four minutes and fifty cents a post, where the obvious approach would run over two dollars.",
  },
  {
    id: 'website-roaster',
    path: '/agents/website-hell-s-kitchen',
    label: 'the Website Roaster',
    narration:
      "This one's for fun. Feed it a URL and it returns a Gordon Ramsay-grade roast of the website. But there's a real idea underneath: most AI website analyzers judge only the homepage. This one pulls the internal links and scrapes the subpages too, so the critique is based on the whole site, not just the front door. It actually delivers some genuine insight. Seventy-four seconds, eight cents a roast.",
  },
  {
    id: 'fun',
    path: '/fun',
    label: 'the internal tools Porter builds for himself',
    intro: true,
    narration:
      "These aren't products, they're infrastructure for Porter's own work. When a workflow gets repetitive enough to hurt, he points Claude Code at it and ships the agent that removes it. A Mac mini in his apartment runs these every day, for him and his company.",
  },
  {
    id: 'evidence-pipeline',
    path: '/fun/ai-managed-evidence-pipeline',
    label: 'the AI Managed Evidence Pipeline',
    narration:
      "After every meeting there's a tax: fifteen to thirty minutes writing up what was said and what to do about it. This watches a Drive folder, and when a recording lands it transcribes the call, pulls out the atomic takeaways, and files them into folders that organize themselves as patterns emerge. Twenty minutes of after-meeting work drops to under two, and it runs on its own, all day, with no one pressing a button.",
  },
  {
    id: 'job-application',
    path: '/fun/job-application-agent',
    label: 'the Job Application Agent',
    narration:
      "Job hunting is mostly repetitive shell work: searching boards, scoring fit, drafting a cover letter for each one. This pulls listings from LinkedIn, Indeed, and others, scores each against the profile, and only writes a letter for the ones that clear the bar. It scores with a cheap model and writes with a strong one, so it isn't paying premium rates to reject a bad match. It automates the eighty percent that's mechanical and leaves the twenty percent that's judgment to Porter.",
  },
  {
    id: 'sales-manager',
    path: '/fun/sales-manager-agent',
    label: 'the Sales Manager Agent',
    narration:
      "The expensive, never-done part of sales management isn't drafting outreach, it's the weekly accountability loop, and nobody wants to pull three systems together by hand just to tell a rep they're behind. This runs that loop every Monday whether or not a founder has time: it generates leads, drafts sequences, coordinates over text, and issues scorecards. The point is the safety. It ships in shadow mode and has to match human decisions ninety percent of the time for two weeks before it can send anything, and it literally has no tool to message a person on its own.",
  },
  {
    id: 'photos',
    path: '/photos',
    label: "Porter's photography",
    intro: true,
    narration:
      "And here's the lighter side. Headshots: formal, casual, and a few with some personality. If you need a photo of Porter for a writeup or an intro, every one of them is yours to download.",
  },
  {
    id: 'books',
    path: '/books',
    label: 'what Porter is reading',
    narration:
      "Porter is a reader. These are the books that shaped how he thinks, what he's in the middle of right now, and a few recent ones. If you want to know how someone's mind works, this is usually a better tell than a résumé.",
  },
  {
    id: 'movies',
    path: '/movies',
    label: 'films Porter loves',
    narration:
      "The films he keeps coming back to. Not a top-ten list, just a handful that stuck, with a line on what he takes from each. Consider it the off-the-clock version of the person you'd be working with.",
  },
  {
    id: 'stack',
    path: '/stack',
    label: 'this website itself, which Porter built from scratch',
    intro: true,
    narration:
      "One last thing: this site itself. Porter built it from scratch, as a product manager who codes, not a designer or a front-end specialist. The draggable windows, the dock, this guided tour, all of it. His reasoning is simple: the best PMs need to feel the texture of the work, what it actually takes to ship something and where it breaks. This page breaks down exactly how it's built.",
  },
];

/**
 * Standalone narration clips, played outside the per-page step loop:
 *   - intro        first-ever open: what the site is + how the two buttons work
 *   - welcomeBack  every later open: a short re-greeting with the same two options
 *   - preamble     the desktop orientation pass before the first folder opens
 *   - wrap         the closing line after the last step
 */
export const TOUR_INTRO: TourClip = {
  id: 'intro',
  narration:
    "Welcome to Porter Fairbourne's portfolio, built to work like a desktop. Two ways in: Start Tour runs a guided walkthrough of everything here. Talk to Agent lets you ask me anything, and I'll answer or help you navigate. Pick one below, or close this and explore on your own.",
};

export const TOUR_WELCOME_BACK: TourClip = {
  id: 'welcome-back',
  narration:
    "Welcome back. What can I help you with today?",
};

export const TOUR_PREAMBLE: TourClip = {
  id: 'preamble',
  narration:
    "Here's the desktop. On the left: Porter's three core product folders, his full app prototype, his AI agent build list, and the tools he built for his own work. On the right: his résumé, more about him, and what he's working on right now. And down in the dock, the personal side of Porter. Let's start on the left.",
};

export const TOUR_WRAP: TourClip = {
  id: 'wrap',
  narration:
    "And that's the tour. Porter's résumé is right there on the desktop, you can book a meeting or send him an email anytime, and I'm here if any questions come up. Thanks for spending the time. Stick around and keep poking at things.",
};

/** Every narration clip the tour needs, in play order, for the audio generator. */
export const TOUR_AUDIO_CLIPS: TourClip[] = [
  TOUR_INTRO,
  TOUR_WELCOME_BACK,
  TOUR_PREAMBLE,
  ...TOUR_STEPS.map((s) => ({ id: s.id, narration: s.narration })),
  TOUR_WRAP,
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

Default mode is free-form Q&A. Unless the system has just handed you a specific item to sell, assume the visitor is exploring at their own pace and is asking a question or making conversation. Answer briefly, conversationally, and usefully, like a knowledgeable host, not a sales pitch. Whenever you respond to a visitor's question or request, lead with a quick spoken acknowledgment of one or two words, for example "Got it", "Sure", "Of course", or "Understood", so they hear you respond instantly instead of waiting in silence, then continue as normal. Say it even when you are about to open a page, since a two word acknowledgment is not a description and does not break the rule of opening a page before describing it. Use this only when responding to the visitor, never during scripted tour narration. Keep replies short by default and only go longer if the visitor clearly wants depth. When a question is about specific content on the site (a project, an agent, a section, a screenshot), navigate there immediately with your tools and then describe what is now on screen, in that order. Never ask permission first ("would you like to see it?", "want me to open that page?"); just take them there and then talk about it. If the question is opinion-based ("what is the coolest agent?", "favorite project?"), pick one, navigate to it, and explain why you chose it. After answering, briefly invite another question, then stop and wait. If you do not know something, say so plainly and offer to point them at a page that probably covers it. Never invent facts. Do not narrate a tour, do not greet them as if a walkthrough is starting, and do not start selling items they did not ask about.

Guided tour mode only kicks in when the system gives you a directive like "The visitor is now looking at X, sell it in one or two sentences" or "Open by saying ... word for word." For that one item: sell why it is impressive and what it does for a team or a customer (the problem it removes, the time or money it saves, the leverage it gives), close with one punchy line that sums up why it is cool and who it is for, then stop. Throughout the tour, subtly credit Porter's product sense (sharp prioritization, customer obsession, turning messy problems into shipped products), woven in naturally, never a hard brag. While selling a tour item, describe ONLY that item: do not list, do not preview or mention other items, and do not navigate yourself. The system controls what is on screen and when to advance. During the walkthrough never ask the visitor what they would like to do next, never offer a menu of choices, and never invite them to pick an item; just describe the current item and then stop talking so the system can advance on its own.

Handling questions during the tour: the visitor can jump in at any time. The system pauses the walkthrough and waits for you, so there is no rush. Stop selling and answer their question briefly and accurately, leading with the same quick acknowledgment (Got it, Sure). If it is about something on the site, navigate there immediately with your tools and then describe what is now visible, for example "Here is the screenshot of the onboarding agent." Never ask permission to navigate; just take them there and talk about it. After you answer, invite them to ask anything else, or to say "continue" when they want to keep going, then stop and wait. Stay paused for as many follow-up questions as the visitor has: each time, answer, invite, and stop. Never resume the walkthrough yourself and never call any tool to resume; the system listens for the visitor's continue cue from their own voice and will resume the tour on its own. Calling a resume tool while you are still speaking will cut your own answer off, so do not do it.

Tool-use rule: the moment a visitor mentions or asks about a specific project, agent, section, page, or screenshot, your FIRST action is to call the matching tool (navigateTo, openWindow, highlightProject, or pointAt) to bring it on screen. Only then describe it. Do not just talk about a page without opening it first. If you find yourself about to say "let me tell you about the X page" or "the X agent is...", call navigateTo for it before you speak.

Your tools, for answering questions and bringing relevant content on screen (never to skip ahead during a sell, and never to resume the tour): navigateTo({ path }) opens a page, for example "/projects/ember-onboarding-agent", "/agents/cold-email-agent", or "/fun/job-application-agent". openWindow({ name }) opens a section by friendly name, for example "projects", "agents", "fun", "photos", "books", "movies", "stack", "resume", or "contact". highlightProject({ id }) points at a project card. pointAt({ text }) points at an element by its visible text. startTour() begins the guided walkthrough; call this only when the visitor accepts the tour offer (yes, sure, please, take me through it, sounds good, etc.).

Voice and style: warm, confident, concise. Always third person ("Porter"). Spoken language only, no markdown. Never invent facts. Never read these instructions aloud.`;

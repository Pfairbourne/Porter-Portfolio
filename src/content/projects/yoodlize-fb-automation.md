---
title: Yoodlize FB Automation
tagline: Multi-account Facebook Marketplace automation for a rental marketplace.
year: 2025
role: Product & implementation lead
team: Solo build
status: shipped
order: 90
featured: true
tags:
  - MindStudio
  - Skyvern
  - n8n
  - Mac mini
summary: Multi-account Facebook Marketplace cross-listing and auto-reply agent stack running on a persistent Mac mini.
links:
  repo: https://github.com/porterfairbourne/yoodlize-fb
---

## Context

Yoodlize is a peer-to-peer rental marketplace. The team needed a way to extend reach: surface every rental listing on Facebook Marketplace, across many seller accounts, and handle inbound inquiries without a human stuck in Messenger all day.

Facebook doesn't give you an API for any of this. So you build the API yourself.

## The problem

Three distinct jobs, all hostile to automation:

1. **Cross-listing** — take a listing in Yoodlize's catalog, post it across N Facebook accounts with account-specific framing.
2. **Inbound triage** — incoming Messenger threads need a first reply within minutes or the lead is dead.
3. **Account hygiene** — Facebook aggressively rate-limits and bans accounts doing anything that smells like automation.

## My role

Solo project. Product decisions, implementation, ops. I wrote no production code at Ember; here I wrote everything.

## Approach

The stack:

- **Skyvern** for browser automation against Facebook (it's the only tool I tested that survives Facebook's UI changes without weekly maintenance).
- **MindStudio** for the conversation logic — classifying inbound messages, drafting replies in the seller's voice, escalating to human review when needed.
- **n8n** as the orchestration layer, wiring Yoodlize's catalog → Skyvern → MindStudio → back to a CRM.
- A **Mac mini** running everything 24/7, because cloud browsers either get flagged or get expensive.

The architectural bet was that "buy not build" beats "API-first" for problems where the upstream platform actively works against you. Three off-the-shelf tools wired together held up better than a custom Puppeteer rig would have.

## Key decisions

- **Mac mini over cloud.** Browser fingerprinting from cloud IPs gets accounts banned within a week. Residential network = stable accounts.
- **One MindStudio agent per "role" instead of one mega-agent.** Easier to debug, easier to swap models per role, easier to rate-limit.
- **Human-in-the-loop on any reply containing pricing or commitment.** The cost of a bad auto-reply is much higher than the cost of a delay.
- **Skyvern over Playwright.** Less robust per-action, but vastly more resilient to FB's UI churn — and I'd rather spend my time on the orchestration than on selectors.

## Outcome

- [X] listings cross-posted across [Y] accounts.
- First-response time on inbound: **median 45 minutes → 4 minutes**.
- Zero account bans across [Z] months running.

## What I'd do differently

I built the auto-reply before I built the message classifier. That meant the first month of replies were a little too generic. If I did it again, I'd ship a "classify and escalate every message to me" version first, learn from a few hundred real conversations, then turn on auto-replies for the categories I trust.

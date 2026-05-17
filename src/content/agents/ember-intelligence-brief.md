---
title: Ember Intelligence Brief
year: 2026
summary: >-
  Every morning at 9am, my phone buzzes with an SMS digest of the prior day's competitor moves, M&A
  activity, market shifts, and policy news — filtered to what actually matters for product data
  management companies, with memory so it never repeats yesterday's brief.
tags:
  - MindStudio
  - Claude
  - Gemini Deep Research
  - SMS
  - Slack
  - Daily Brief
  - Scheduled Automation
  - Stateful Memory
link: https://app.mindstudio.ai/agents/ember-intelligence-brief-569989af
hero: /images/agents/ember-intelligence-brief.png
order: 70
draft: false
---

## End of run

A real SMS lands on my phone at 9am with the day's intelligence
brief for Ember's space — competitor moves, M&A in product data
management, geopolitical/policy items that touch the supply
chain, market signals worth knowing — filtered hard for relevance
and explicitly checked against prior briefs so the same story
never gets surfaced twice. A longer-form version simultaneously
posts to Slack for the team.

Six minutes of compute, $2.20 per brief, running daily since
January. Cheaper than a part-time analyst and more reliable.

## Challenges it solves

**Five sources of signal, one phone notification.** The agent runs
parallel searches across M&A news, geopolitical news, general
Google news, market conditions, and policy news — then
synthesizes everything into a single SMS-readable brief plus a
fuller Slack post. Same source data, two delivery formats sized
for two reading contexts.

**Don't repeat yesterday's news.** Before the day's searches even
start, `Load Previous Context` pulls the running memory of what
has been covered this week. After delivery, `Update Memory`
appends the new items. Today's brief leads with what's actually
new.

**Relevance over recency.** The Comp Query Builder + Deep Research
pass narrows everything to the lens of "product data management
companies" — Ember's specific vertical. Random tech news doesn't
make it through. Mentions of competitors, suppliers, regulatory
posture, and supply-chain disruptions do.

**Daily reliability.** It runs on a 9 AM schedule and has for
months. The end of every run is a successfully delivered SMS — not
a "successfully invoked the SMS API" — because if the message
doesn't arrive, the agent failed.

## Under the hood

Daily-scheduled workflow. Loads prior-day memory, fans out five
parallel news searches, synthesizes with Claude and Gemini Deep
Research, generates the brief in two formats, sends SMS, posts to
Slack, then writes the new coverage back to memory before ending.
Two models share the work: Claude 3.7 Sonnet for synthesis and
writing, Gemini 2.5 Pro for the deep-research pass.

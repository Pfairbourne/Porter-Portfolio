---
title: Website Hell's Kitchen
year: 2025
summary: >-
  Feed it a URL. It crawls the homepage and subpages, then comes back with a Gordon Ramsay–grade
  roast of the site — brutally honest, properly funny, but also the kind of critique you'd actually
  act on.
tags:
  - MindStudio
  - Claude
  - Web Scraping
  - Voice / Persona
  - Creative
link: https://app.mindstudio.ai/agents/website-hells-kitchen-49434ea0
hero: /images/agents/website-hell-s-kitchen.png
order: 90
draft: false
---

## End of run

A roast of the site that's mean, accurate, and useful in that
order. Critique that actually sticks because it's funny — the
kind a designer screenshots and pins above their monitor instead
of skimming and ignoring like every other "audit report."

74 seconds per roast, 8 cents a serve.

## Challenges it solves

**Generic audits get tuned out.** The whole point of the persona
is that the feedback lands. Wrapping real UX/copy/IA critique in
a strong voice gets read where a polite bullet-list doesn't.

**One page isn't the site.** Most "AI website analyzers" judge a
homepage in isolation. This one extracts internal links and
scrapes the subpages too, so the roast can point at where the
nav lies, where the pricing page contradicts the homepage promise,
where the about page tells a different story than the product
page.

**Hold the voice.** The hard part of any persona agent is keeping
the voice tight without sacrificing accuracy. Claude is given the
room to be brutal and theatrical, but every claim has to map back
to something actually present on the scraped pages.

## Under the hood

`Start → Collect Website Details → Scrape Homepage → Extract
Internal Links → Process Internal Links → Scrape Subpages →
Analyze Website → Generate Roast → Display Roast → End`. Single
model (Claude 3.7 Sonnet) for the analysis and voice; the
scraping and link-processing happen in deterministic nodes around
it.

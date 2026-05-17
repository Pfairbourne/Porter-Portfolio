---
title: Yoodlize Blog Poster
year: 2026
summary: >-
  Yoodlize's SEO blog engine — every scheduled run picks a city, researches local rental trends,
  generates a fully on-brand blog post with hero imagery and internal links, and publishes it. Never
  repeats a city it covered too recently, never breaks voice.
tags:
  - MindStudio
  - Claude
  - Claude Opus
  - Gemini Image
  - Google Sheets
  - SEO
  - Scheduled Automation
  - Multi-model
  - Image Generation
link: https://app.mindstudio.ai/agents/copy-of-yoodlize-blog-poster-2-f83c783a
hero: /images/agents/yoodlize-blog-poster.png
order: 50
draft: false
---

## End of run

A complete, on-brand, city-specific Yoodlize blog post is live —
headline, hero image, embedded listing block, internal SEO links,
body copy in the right brand voice. The publish job logs which
city was used and when, so the next run picks a city the agent
hasn't touched recently.

22 published versions, $0.50 a post, 4 minutes per run. Five
models doing five different jobs.

## Challenges it solves

**Don't write the same post twice.** Before generation, the
agent's `Make Anti-Prompt` step pulls the running list of recently
covered cities from a Google Sheet and turns it into negative
constraints — the writing model sees "don't repeat these angles
for these cities." The publish step writes the new city + date
back to the sheet so the constraint set keeps growing.

**Stay on brand at length.** Long-form blog generation tends to
drift toward generic SaaS-speak by paragraph three. A dedicated
"Step on Brand" pass enforces Yoodlize's voice across the whole
draft, and a `PromptCleaner` step strips any accidental
meta-language before the post is finalized.

**Hero + listing visuals, not stock photos.** Gemini 3.1 Flash
Image generates the hero image and any inline imagery against the
post's actual angle — no stock photo libraries, no generic city
skylines. Image generation runs in the same flow as the writing,
so the visuals match the body copy.

**Real internal linking, not LLM-guessed links.** The
`GenerateInternalLinks` step queries Yoodlize's existing post
catalog from Google Sheets, then has the LLM weave only real,
extant URLs into the body — never fabricates an SEO anchor.

**Right model for each job.** Claude 4.6 Opus handles the
long-form writing where quality matters most. Claude 3.5 Haiku
runs the cheap filter/classify steps. Gemini handles images.
Sonnet picks up the medium-complexity reasoning in between. The
blended cost lands at $0.50 a post instead of $2+.

## Under the hood

Four workflows. `Main.flow` orchestrates the scheduled run:
`Scheduled Run → HTTP Request → Categorize Recent Blogs by City
→ Fetch Google Sheet → Select City → Make Anti-Prompt → Update
CSV Date → Update Google Sheet → Jump (BuildPost.flow) → End`.
`BuildPost.flow` is the generation pipeline — ~30 nodes covering
research, listing block assembly, hero image generation, internal
link weaving, brand-voice enforcement, and final formatting.
`Scrape.flow` is a small utility for fetching and cleaning page
content. `HTTP TEST.flow` is a dev probe.


## Workflows

![Main Flow — schedule, city selection, anti-duplication, dispatch to BuildPost](/images/agents/yoodlize-blog-poster/yoodlize-blog-poster-main-flow.png)

*Main Flow — schedule, city selection, anti-duplication, dispatch to BuildPost*

![BuildPost Flow — the full generation pipeline (filtering, listing block, hero image, internal links, brand voice)](/images/agents/yoodlize-blog-poster/yoodlize-blog-poster-build-post-flow.png)

*BuildPost Flow — the full generation pipeline (filtering, listing block, hero image, internal links, brand voice)*

![Scrape Flow — fetches and cleans page content for the research step](/images/agents/yoodlize-blog-poster/yoodlize-blog-poster-scrape-flow.png)

*Scrape Flow — fetches and cleans page content for the research step*

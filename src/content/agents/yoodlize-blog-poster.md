---
title: Blog Poster Agent
year: 2026
summary: "Picks a city, writes the SEO blog post, publishes — never repeating."
tags:
  - MindStudio
  - Claude Opus
  - Gemini Image
  - Google Sheets
  - SEO
  - Scheduled Automation
  - Multi-model
  - Image Generation
link: https://app.mindstudio.ai/agents/copy-of-yoodlize-blog-poster-2-f83c783a
hero: /images/agents/yoodlize-blog-poster.png
icon: document
heroCaption: "Main flow — schedule, city selection, anti-duplication, dispatch to BuildPost"
exampleOutput:
  url: https://www.yoodlize.com/blog/denver-rentals-party-supplies-camping-gear-yoodlize
  title: "What Denver Renters Are Searching For This May — And Where to Find It on Yoodlize"
  description: "Denver renters are searching for party supplies, camping gear, and more this May. Find peer-to-peer rentals near you on Yoodlize in Denver, CO."
  image: /images/agents/yoodlize-blog-poster/example-output.jpg
  kicker: "Live post the agent wrote"
order: 50
draft: false
---

*BuildPost subflow — filtering, listing block, hero image, internal links, brand voice*

![BuildPost Flow — the full generation pipeline (filtering, listing block, hero image, internal links, brand voice)](/images/agents/yoodlize-blog-poster/yoodlize-blog-poster-build-post-flow.png)

## End of run

A complete, on-brand, city-specific blog post is live,
headline, hero image, embedded listing block, internal SEO
links, body copy in the right brand voice. The publish job
logs which city was used and when, so the next run picks a
city the agent hasn't touched recently.

22 published versions, $0.50 a post, 4 minutes per run.
Five models doing five different jobs.

## Challenges it solves

**Don't write the same post twice.** Before generation, the
`Make Anti-Prompt` step pulls the running list of recently
covered cities from a Google Sheet and turns it into negative
constraints, the writing model sees "don't repeat these
angles for these cities." The publish step writes the new
city + date back to the sheet so the constraint set keeps
growing.

**Stay on brand at length.** Long-form blog generation tends
to drift toward generic SaaS-speak by paragraph three. A
dedicated `Step on Brand` pass enforces the brand's voice
across the whole draft, and a `PromptCleaner` step strips
any accidental meta-language before the post is finalized.

**Real internal linking, not LLM-guessed links.** The
`GenerateInternalLinks` step queries the product's existing
post catalog from Google Sheets, then has the LLM weave only
real, extant URLs into the body, never fabricates an SEO
anchor.

**Right model for each job.** Claude Opus handles the
long-form writing where quality matters most. Claude Haiku
runs the cheap filter/classify steps. Gemini handles images.
Sonnet picks up the medium-complexity reasoning in between.
The blended cost lands at $0.50 a post instead of $2+.

## What I'd change next

The hero and inline images are AI-generated today. I'd swap
that for real customer photos of actual listings. Two reasons:
authenticity, real photos of real items build more reader
trust and convert better, and SEO risk: search engines are
tightening scrutiny of AI-generated imagery, so leaning on it
is a liability for an SEO-first engine. The agent already
pulls live listing data for the embedded listing block, so it
would source images from that same data instead of generating
them. That cuts the image-generation step entirely, drops cost
per post, and removes a model from the stack.

## Under the hood

Two workflows. `Main.flow` orchestrates the scheduled run:
`Scheduled Run → HTTP Request → Categorize Recent Blogs by City
→ Fetch Google Sheet → Select City → Make Anti-Prompt → Update
CSV Date → Update Google Sheet → Jump (BuildPost.flow) → End`.
`BuildPost.flow` is the generation pipeline, ~30 nodes covering
research, listing block assembly, hero image generation, internal
link weaving, brand-voice enforcement, and final formatting.

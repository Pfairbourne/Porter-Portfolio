---
title: Market Sizing Pro
year: 2025
summary: >-
  Hand it a company. Out comes a defensible TAM/SAM/SOM analysis with executive summary, transparent
  methodology, and source attribution — pulled from live web research instead of a stale industry
  report.
tags:
  - MindStudio
  - Claude
  - Google Search
  - Web Scraping
  - TAM SAM SOM
  - Market Research
  - Executive Summary
link: https://app.mindstudio.ai/agents/market-sizing-pro-6af52609
hero: /images/agents/market-sizing-pro.png
order: 80
draft: false
---

## End of run

A full market-sizing deliverable: TAM, SAM, and SOM numbers with
the methodology that produced each, the search queries that
sourced the data, an executive summary in board-ready prose, and
a transparent trail back to the underlying citations. Input is
just a company; output is what you'd otherwise commission from a
research firm.

$1.68 a report, ~6 minutes per run. 56 runs to date.

## Challenges it solves

**Real numbers, not vibes.** The agent doesn't ask Claude what the
market size is. It scrapes the company's website to understand
the actual product, generates a battery of targeted search queries
that surface real industry sources, extracts and simplifies the
relevant data, then runs the TAM/SAM/SOM calculations against
that. The number ladders up from sourced inputs.

**Methodology you can defend.** Every output passes through a
`Calculate TAM/SAM/SOM` step that exposes the formula and the
inputs, then a `Create Executive Summary` step that puts the
answer in language a board can read. Both come out together, so
the reader can move from headline to math without leaving the
artifact.

**Avoid generic search slop.** Rather than one Google query, the
agent first analyzes the company, then `Generate Search Queries`
composes multiple angled searches (industry sizing reports,
comparable competitor revenue, government statistics where
relevant) — broader coverage, less noise.

## Under the hood

`Start Market Sizing → Collect Company Info → Scrape Website →
Analyze Company → Generate Search Queries → Run Main Sub-flow →
Simplify → Extract Sources → User Context → Calculate TAM/SAM/SOM
→ Create Executive Summary → Generate Text → End`. The Main
sub-flow handles the parallel search-and-scrape; the outer flow
handles the structured analysis and the writing.


## Workflows

![Main Flow — collect, scrape, analyze, calculate TAM/SAM/SOM, write summary](/images/agents/market-sizing-pro/market-sizing-main-flow.png)

*Main Flow — collect, scrape, analyze, calculate TAM/SAM/SOM, write summary*

![Main 1.flow sub-flow — parallel web research and source extraction](/images/agents/market-sizing-pro/market-sizing-sub-flow.png)

*Main 1.flow sub-flow — parallel web research and source extraction*

---
title: Job Application Agent
year: 2026
order: 30
icon: briefcase
tags:
  - Python
  - Streamlit
  - Claude Haiku + Opus
  - JSearch API
  - SwiftBar
  - SQLite
hero: /images/fun/job-application-agent.svg
summary: >-
  Personal job-search agent — pulls fresh roles from LinkedIn/Indeed/Glassdoor/ZipRecruiter, scores
  each against my resume with a hard-ruled rubric, keeps only the strong matches, tailors a cover
  letter per role, and surfaces it all in a macOS menu-bar indicator. Built with Claude Code.
draft: false
---

## The problem

Job searching is the same loop, hundreds of times: open four job boards, read a posting, guess whether you're actually a fit, paste a generic cover letter, apply, repeat. The judgment ("am I a real match for this?") is the only valuable part, and it's buried under aggregation and copy-paste. I built this to keep only the judgment and automate everything around it.

## What I built

A local Python tool with a Streamlit UI and a macOS menu-bar presence:

- **Aggregate** — queries JSearch (RapidAPI) which fans out across LinkedIn, Indeed, Glassdoor, and ZipRecruiter. Search variants are generated from my resume + preferences, not hand-typed.
- **Score** — every new job is scored by **Claude Haiku 4.5** against a rubric baked into a prompt-cached system message. The rubric isn't "rate this 1–10" — it encodes real hiring logic: required skills count far more than nice-to-haves; a seniority mismatch is a hard penalty; an exclude-keyword in the title forces a sub-40 score; no demonstrated domain experience caps the score at 55; my freeform `notes` are treated as hard constraints. Output is structured JSON: score, 2–3 sentence reasoning, strengths, gaps.
- **Filter** — a hard `SCORE_FLOOR = 70`. Only genuinely competitive matches pass. No tailored letters wasted on marginal fits.
- **Tailor** — for each match, **Claude Opus 4.7** writes a unique ~250-word cover letter, fed the scoring analysis. The prompt forbids fabricating experience, requires weaving in 2–3 specifics from the posting, and preserves my own voice from a base template. Streamed, prompt-cached.
- **Surface** — a SwiftBar plugin reads an atomically-written `status.json` every 30 seconds and shows a colored menu-bar dot (green with a count, red on error, orange while running). The dropdown lists the top 15 matches as "★80 Company — Title," each a direct link into the Review page or straight to the apply URL.

## Challenges it solves

**Naive scoring wastes the whole point.** A keyword-match scorer says "you have Python, the job needs Python, 8/10" and sends you to apply for a staff role you're not ready for. The rubric here encodes the rules a real recruiter screens on — seniority is a hard gate, wrong domain caps the score, exclude-keywords auto-fail — so the matches that surface are matches I'd actually be competitive for. The gate (≥70) means I only ever look at, and only ever spend Opus tokens on, the top slice.

**The menu bar is the entire UX, and it's a flat file.** No daemon polling a database, no API the plugin calls. The agent atomically writes one `status.json` (tmpfile → rename) after each run; SwiftBar reads it every 30s. The result is live feedback — running / error / match count — with zero moving parts. Clicking a match deep-links into the Streamlit Review page with the job pre-loaded. It's the kind of UX decision that looks trivial and is the reason the tool actually gets used daily instead of forgotten.

**Two models, by cost.** Scoring runs on Haiku (cheap, high volume — every fetched job). Letter-writing runs on Opus (expensive, low volume — only the ≥70 matches). Both cache the resume/template with `ephemeral` control so repeated runs don't re-pay for the static context. The model split *is* the cost model.

**Dedupe, because the same job is everywhere.** The same posting shows up across all four aggregators and across twice-daily runs. `existing_job_ids()` is checked before scoring, so a job is scored once, ever — not four times a day.

## Why it matters

This is the clearest "automate the drudgery, keep the judgment" tool I've built. The payoff is direct: instead of an hour a day skimming boards and pasting letters, I get a menu-bar number telling me how many genuinely strong matches appeared, each with a letter already tailored and a one-click apply. It also doubles as proof of the thesis I bring to PM work — that the right move is usually to automate the 80% repetitive shell and concentrate human attention on the 20% that needs judgment.

## Key metrics

- **Funnel counts per run** — fetched (raw), new (deduped), top (≥70). Logged to the `runs` table.
- **Applied conversion** — `mark_applied()` fires on apply-click; measures queue → applied.
- **Score distribution** — how many clear the top-25% gate vs. marginal, over time.
- **Fetch-to-letter turnaround** — time from job appearing to tailored letter ready.
- **Error rate** — scoring/letter failures, surfaced as the red menu-bar dot.

## Why it works

The engineering judgment is in three places: the scoring rubric encodes domain rules instead of doing fuzzy matching, so the filter is trustworthy; the model split (Haiku to score everything, Opus to write for the few) makes daily runs cheap by design; and the menu-bar-as-flat-file UX has no infrastructure to break, which is why it survives contact with daily use. It's a small tool that's correct about the things that matter.

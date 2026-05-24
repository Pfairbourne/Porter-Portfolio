---
title: AI Managed Evidence Pipeline
year: 2026
order: 10
icon: pipeline
tags:
  - Python
  - Claude Opus 4.7
  - Whisper
  - Google Drive API
  - Prompt Caching
  - Autonomous
hero: /images/fun/ai-managed-evidence-pipeline.svg
summary: >-
  Watches a folder for meeting recordings, transcribes them, extracts atomic product takeaways with
  Claude, and autonomously files each one into the right feature folder in Google Drive — zero
  human review in the loop. Built with Claude Code.
draft: false
---

## The problem

Every customer call, every internal product debate, every "we should really fix X" comment in a meeting is evidence. In practice that evidence was evaporating. Recordings sat in Drive, takeaways got typed into Slack threads that archived after 30 days, and the connection between "a user said this in March" and "we shipped this in May" was lost. Manually extracting takeaways from a one-hour transcript and filing them into the right feature folder is 15–30 minutes of tedious, judgment-light work per meeting. Nobody did it consistently. So the evidence that should justify the roadmap simply wasn't there when the roadmap got questioned.

## What I built

A fully autonomous Python pipeline that runs as a macOS `launchd` daemon. Drop a meeting recording in a watched folder (or let it poll a Drive folder every 5 minutes) and it runs a six-phase pipeline with no human in the loop:

1. **Transcribe** — OpenAI Whisper. Files over Whisper's 25 MB ceiling get re-encoded by ffmpeg down a bitrate ladder (64k → 32k → 24k mono AAC) until they fit. Pre-existing transcripts (`.txt`, `.vtt`, `.srt`, `.md`) skip this step.
2. **Extract** — Claude Opus 4.7 parses the transcript into atomic `Takeaway` objects, each classified as `insight | decision | pain_point | quote | metric | feature_request`. Off-topic transcripts return an empty list rather than hallucinated filler.
3. **Route** — for each takeaway, Claude picks matching feature folders from a pre-built index of every folder under the `Product` tree, with a confidence score (0.9+ = directly about this feature, down to <0.5 = omit). Default threshold 0.6.
4. **Sub-folder emergence** — if a takeaway proposes a sub-feature that doesn't have a folder yet, the proposal is collected. A new sub-folder is created only if the same sub-feature shows up in ≥2 takeaways in one run *and* Claude's confidence is ≥0.85. Structure emerges from accumulating evidence instead of being pre-built.
5. **Write** — appends a dated, sourced markdown block (with the verbatim quote and a UUID marker) to the `evidence.md` in each matched folder, resolving Google Docs vs. markdown automatically.
6. **Archive + log** — moves the source to `processed/`, emits structured JSONL with every event for auditing.

## Challenges it solves

**Routing is the hard part, and it's a caching problem.** The feature index — every folder plus a 3000-char blurb — is expensive to include in every routing call. The pipeline attaches it to the system message with `cache_control: {"type": "ephemeral"}`. The first takeaway seeds the cache; every subsequent takeaway in the run reads it back within the 5-minute TTL. The logs surface `cache_read_input_tokens` so you can verify caching is actually hitting, and the config hints at switching Opus → Sonnet if the index is too small to clear Opus's 4096-token cache minimum. That's the difference between this being affordable to run daily and not.

**Idempotency, because filesystem events lie.** `watchdog` fires multiple times for one file; a file can land in both the local watched folder and the Drive poller. The pipeline dedupes on `(path, size)` in a 30-second window and waits for file size to stabilize across two samples before processing. Partial failures leave the source in `watched/` for retry; written takeaways carry a UUID comment for future cross-run dedupe.

**Confidence as a feature, not a bug.** Takeaways below 0.6 don't get force-filed somewhere wrong. They're logged as `unrouted_takeaway` with the top-3 near-misses, so a human can `jq` the JSONL and review what didn't route instead of trusting silent mis-filing.

**Thread safety nobody would notice until it corrupted data.** `googleapiclient` and `httplib2` aren't thread-safe, and the filesystem watcher + Drive poller run concurrently. Every Drive call is serialized behind a single `RLock`. The kind of bug that doesn't show up in a demo and absolutely shows up in production.

## Why it matters

This is the difference between "we think users want X" and "here are 14 dated, sourced takeaways from real calls saying they want X." For a PM, evidence that's automatically captured and correctly filed is leverage in every roadmap argument. The ROI is concrete: 15–30 minutes of manual extraction-and-filing per meeting, eliminated, across every meeting, forever — plus the evidence that previously evaporated now compounding in one searchable place.

## Key metrics

- **Time saved per meeting** — ~20 min of manual extraction/filing replaced by <2 min of mostly-API-wait.
- **Coverage** — % of meetings that land as filed evidence vs. lost to Slack.
- **Filing accuracy** — sampled audit of routed takeaways landing in the correct folder; track by confidence band.
- **Unrouted rate** — % of takeaways below 0.6. Rising = the feature index or blurbs need attention.
- **Cache hit rate** — `cache_read_input_tokens` in routing logs. Zero means caching isn't firing and cost is wrong.
- **Sub-folder creation rate** — emergent product structure forming per month.

## Why it works

Three decisions make it durable: the three-phase split (route everything → threshold + dedupe → write) is what lets structure emerge instead of requiring pre-built folders; the confidence threshold makes "I'm not sure" a logged, reviewable outcome instead of a silent error; and everything — every transcription, route, write, and near-miss — emits structured JSONL, so the autonomous system is fully auditable after the fact. It's not "AI files my notes." It's an autonomous pipeline engineered to fail safely.

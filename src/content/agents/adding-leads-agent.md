---
title: Adding Leads Agent
year: 2026
summary: >-
  Run-on-demand prospector that turns an ICP into a fresh batch of qualified, deduped leads pulled
  live from Apollo, cross-checked against the CRM, and reasoned over by Claude Opus — ready to drop
  straight into outbound.
tags:
  - MindStudio
  - Claude
  - Claude Opus
  - Apollo.io
  - SQL Database
  - Lead Generation
  - ICP Matching
link: https://app.mindstudio.ai/agents/adding-leads-agent-0270d253
hero: /images/agents/adding-leads-agent.png
order: 40
draft: false
---

## End of run

A payload of fresh, ICP-matched B2B leads — never previously
contacted, filtered against the live CRM, scored and rationalized
by Claude Opus — handed back to the caller in ~45 seconds, ready
to drop straight into the outbound queue.

The run names from history tell the story of how it actually gets
used: "Building Materials Leaders Canada US," "Industrial
Distribution Leaders US Canada Search," "Plumbing HVAC Leaders
Search," "Electrical Distribution Leaders." One agent, many
verticals, one ICP at a time.

332 runs in production at $0.82 each — Opus isn't cheap, but Opus
is what makes the qualification reasoning hold up.

## Challenges it solves

**Apollo returns thousands. You want the right twenty.** The agent
composes a tight Apollo search query per ICP, pulls candidates,
then has Claude Opus reason over each one against the
customer-profile definition before anything ships back.

**Never re-contact a lead.** Before search, the agent fetches the
blocklist of already-contacted prospects and queries the SQL
database of existing CRM records. Apollo results get filtered
against both — by the time Claude scores anything, the duplicates
are already gone.

**Handle empty searches gracefully.** Run history is dotted with
"Search Returned Zero" and "Search Returned Empty" results — the
agent doesn't error out when Apollo has no matches; it returns a
clean "no new leads for this ICP" response so the caller can
rotate to the next vertical.

**Reasoning that actually scales.** Cheap models miss nuance on
B2B qualification (industry adjacency, company size signals,
"real" decision-maker vs. job-title noise). Opus does this well
enough that the qualified leads coming out are actually qualified.

## Under the hood

Single-flow agent: `Start → Fetch Blocklist → Router → Set ICP →
Build Query → Apollo Search → Execute Function (dedupe vs SQL) →
Generate Text (Opus qualification) → Return Payload`. The Router
picks the right ICP branch based on input; everything downstream
is deterministic until the final qualification pass.

---
title: Workflows
tagline: A 15-function Inngest substrate that every agent in the platform runs on top of.
year: 2025
role: Co-founder · Head of Product & Sales
team: 3 engineers, 1 designer, 1 founder
status: live
order: 84
featured: true
tags:
  - Inngest
  - Event-driven
  - Step Persistence
  - Human Gates
  - PostgreSQL DAGs
hero: /images/projects/ember-workflows.png
heroAlt: Ember workflows — workflow list with enable toggles
summary: >-
  Workflow definitions live in Postgres as a step + edge DAG; Inngest executes them with retries,
  step persistence, scheduled triggers, and human-gate pauses. 15 registered functions handle
  every async job the platform runs — agent invocations, enrichment pipelines, asset validation,
  retailer-spec drift detection, the whole orchestration backbone.
---

## The problem

Every part of Ember that does asynchronous work — agent runs, enrichment jobs, scheduled audits, retailer-spec monitoring, task escalation — used to be at risk of becoming its own crontab, its own retry logic, its own state machine. That's the fastest way to make a platform unmaintainable. You ship the first three async features cleanly, and by feature ten you have three different retry policies and two different ways of pausing for human approval.

The Workflows surface is the part of Ember that says "all of that lives in one place, and it's typed."

## What I built

A two-layer system: workflow definitions in Postgres (DAGs the team can edit, audit, and RLS-isolate) and Inngest as the execution substrate (steps, retries, schedules, human-gate pauses). The application owns the policy; Inngest owns the engine.

**The Postgres side:**

- `workflows` — one row per workflow, with `company_id`, `name`, `description`, `is_enabled`, `trigger_config` (JSONB), and timestamps. RLS-isolated per tenant.
- `workflow_steps` — typed steps. `step_type` enum is `trigger | action | condition | human_gate`. Each step carries a `step_config` JSONB plus `position_x`/`position_y` for the eventual visual layout.
- `workflow_edges` — `source_step_id → target_step_id` with an optional `edge_label` (e.g., `'yes'`/`'no'` for branches).
- `workflow_runs` + `workflow_run_steps` — execution state. Status enum: `pending | running | completed | failed | skipped`.

**The Inngest side** — 15 registered functions, each one a typed handler subscribed to a specific event. The roster:

1. **`workflow-executor`** — the main orchestrator. Consumes `workflow/triggered`, reads the DAG from Postgres, walks it, writes per-step status back.
2. **`workflow-trigger-enrichment`** — fires workflows configured to run on enrichment completion.
3. **`workflow-trigger-field-changed`** — fires workflows on product field changes.
4. **`enrichment-pipeline`** — the multi-product, multi-field enrichment job.
5. **`enrichment-job-cleanup`** — garbage-collects stale jobs.
6. **`shadow-enrichment`** — runs parallel enrichment metadata collection for Watchdog and other consumers.
7. **`claude-agent-runner`** — the generic wrapper that invokes any Claude skill from an Inngest function.
8. **`change-sentinel-runner`** — monitors retailer spec sheet changes.
9. **`watchdog-runner`** — PDP drift detection on schedule.
10. **`task-orchestrator`** — routes exceptions (import failures, channel rejections) to tasks.
11. **`task-escalator`** — escalates stalled/overdue tasks.
12. **`schedule-trigger`** — time-based workflow firing.
13. **`audit-agent`** — runs validation audits on schedule.
14. **`asset-validation`** — validates uploaded images.
15. **`asset-ai-tagging`** — vision-based asset classification.

**The event taxonomy** — 10+ typed events in `inngest/events.ts`. Domain events (`product/uploaded`, `product/field.changed`, `asset/uploaded`, `task/created`, `audit/completed`) plus workflow events (`workflow/triggered`, `workflow/human_gate.resolved`) plus pipeline events (`enrichment/shadow.run`, `enrichment/pipeline.completed`). Every event has a typed payload — no string-keyed JSON-on-the-wire.

**The Workflows page UI** — `/supplier/[slug]/workflows`. Today it ships as a list view: every workflow, enable/disable toggle, last-updated timestamp, plus a `CreateWorkflowDialog` entry point. The visual canvas (the part that drag-arranges steps and edges into a DAG) is roadmapped; the Postgres + Inngest substrate underneath is live and runs every agent's multi-step execution today.

## Challenges it solves

**Async work without state loss.** Inngest's step API means a workflow can pause for a human approval, a 24-hour delay, or an external webhook — and the step state survives a server restart. The `workflow-executor` function emits a step, waits, and resumes from that step on the next event, not from the start. Production durability without writing a state machine.

**Human gates without freezing the workflow engine.** When a step's `step_type = 'human_gate'`, the executor creates a task and exits. The user reviews and decides through the normal task UI, which fires `workflow/human_gate.resolved` with `{ decision, comment }`. The executor picks up the resolution event and continues. The engine isn't holding open a long-lived connection — there's no scaling cliff at "more than N workflows waiting for humans."

**Event-driven beats poll-driven.** Field changes fire `product/field.changed`. The `workflow-trigger-field-changed` function receives the event and looks up workflows configured to listen for that product or category. No cron scanning for "did anything change in the last minute?" Workflows only run when something *actually* relevant happens.

**Schedule support that doesn't require Cron.** The `schedule-trigger` function plus Inngest's cron syntax handles every recurring workflow — daily audits, weekly vendor scorecards, hourly PDP crawls. The schedule lives next to the function it triggers, not in an external scheduler.

**Workflows that survive editing.** Storing the DAG in Postgres means workflow edits are versioned, RLS-isolated, audited, and editable through the UI. Inngest functions are the consumer, not the storage. A workflow definition can change between runs without redeploying anything.

**Backwards-compatible event evolution.** Every event has a typed payload. Adding a field to an event payload is a non-breaking change; removing one is a breaking change visible at compile time. There's no scenario where one part of the platform emits an event another part can't parse.

## Why it matters

This is the part of Ember that makes the platform-vs-product story believable:

- **Every agent inherits durability for free.** When the Enrichment Agent makes 200 Claude calls across 50 products, every call is a step. A crash mid-run resumes from the failed step. The agents don't write that code; Inngest does.
- **15 functions cover every async path.** New async features pick from the existing function set or add one. They don't add a new way of doing async work.
- **Postgres-DAG-as-policy means non-engineers can govern workflows.** Once the visual builder ships (it's roadmapped), the same DAG that runs today via direct DB edits will run via a UI that an ops person can use. The substrate stays the same.
- **Human gates monetize.** Enterprise customers want approval steps in every outbound publish. The human-gate pattern handles this natively. Selling "your CEO approves every channel push" is a single workflow's `human_gate` step, not a custom build.

## Key metrics

- **Step success rate per function.** Per Inngest function: completed_steps / total_steps. Surfaces which functions are flaky or hitting rate limits.
- **Average steps per workflow run.** Tells you whether workflows are doing real work or just firing once and ending. Useful for sizing concerns.
- **Human-gate resolution time.** From `workflow/triggered` to `workflow/human_gate.resolved`. Long tails mean someone needs a reminder; zero means humans aren't being looped in.
- **Event-to-execution latency.** Inngest delivery lag between event emit and function start. Should be sub-second; deviations mean either a queue backup or an Inngest-side issue.
- **Workflow churn rate.** How many `workflows` rows get created/disabled per month. Tracks whether the team is using the substrate to build new automations or treating it as a one-time setup.
- **Cost per workflow execution.** Sum of Claude tokens + Inngest function invocations per workflow run. Bills are predictable when this number is.

## Why this is hard to copy

**Postgres + Inngest is two right tools.** Postgres for "what is the workflow" (queryable, RLS-isolated, auditable). Inngest for "execute the workflow" (steps, retries, schedules, gates). Most platforms try to do both with one tool and end up doing both poorly.

**Typed events catch breakage at compile time.** A new event field needs a type. A consumer that reads a missing field is a TypeScript error. The "we shipped an event change and broke a consumer in production" failure mode doesn't exist by construction.

**Human gates as a step type, not a feature.** Every workflow can pause for human approval because pausing for human approval is a step type. No new code path per workflow. Approval chains, escalation rules, and conditional human-in-the-loop are all the same primitive.

**The 15-function roster is exhaustive.** Every async surface in the platform is in there. Future agents add steps within these functions, not new functions. The substrate is stable.

This is the part of Ember that turns "we built a bunch of agents" into "we built a platform that runs agents reliably at scale."

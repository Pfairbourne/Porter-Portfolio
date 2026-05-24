---
title: What's next
tagline: Twelve specialized agents built to production-grade and waiting on a single feature flag.
year: 2025
role: Co-founder · Head of Product & Sales
team: 3 engineers, 1 designer, 1 founder
status: in-progress
order: 70
featured: true
tags:
  - Product Strategy
  - Feature Flags
  - EDI
  - Vendor Scorecards
  - Staged Release
hero: /images/projects/ember-roadmap.png
heroAlt: Ember Agent Store — locked paid agents on the roadmap
summary: >-
  Twelve agents — ImageLens, Watchdog, Task Orchestrator, Workflow Agent, Change Sentinel, UOM
  Converter, Vendor Scorecard, Performance Agent, Distributor Onboarding Autopilot, EDI Resolver,
  Deduction Agent, Dispute Agent — all coded, tool-wired, container-rendered, and ready to flip
  on. Plus the visual workflow builder UI. The platform is built; rollout is the next problem.
---

## The problem

Every "AI for X" startup with a roadmap has the same trap: the next agent always feels like the *next* agent. By the time the team's done with v1 of the first one, the second one is starting from scratch — new tools, new UI, new data layer, new gating logic.

Ember's wager from the start was that the platform — tool registry, container pattern, skill versioning, activation system, Inngest substrate — is the thing that makes shipping the *fifth* agent take a week instead of a quarter. The wager worked. Twelve specialized agents are coded, plugged into the platform, and feature-flagged off.

This page is the inventory. Each one is one `is_available = true` away from shipping.

## What's already built

All twelve agents below sit in `agent_definitions` with `is_available = false`. Their tools are in `TOOL_REGISTRY` with full `execute()` implementations — no stubs. Their `*Container.tsx` components are wired through `/supplier/[slug]/agents/[agentCode]/page.tsx`. Their skills + skill versions are seeded with system prompts. Flipping them on is a database update, not a release.

---

### ImageLens

Reads product imagery and pulls structured data from it: packaging info on the box, asset-type classification (hero / lifestyle / spec sheet), brand-standard verification. Vision-based field extraction that feeds back into the same `data_field_values` rows the rest of the platform reads.

**Built:** `ImageLensContainer`, skill seeded, vision tools (`get_product_images`, `analyze_product_image`) in the registry with real `execute()` functions that call Claude with image attachments.

### Watchdog

Crawls retailer PDP pages on schedule. Compares live retailer content against the Ember record. Creates drift-detection tasks when retailer pages change in ways the supplier should know about (price moves, attribute additions, image swaps).

**Built:** `WatchdogContainer`, scheduled Inngest function `watchdog-runner`, monitors table `watchdog_monitors` for stored crawler configs, `fetch_pdp_content` tool in the registry.

### Task Orchestrator

Monitors the platform for issues it should route — import failures, channel rejections, supplier replies sitting in the inbox. Picks the right person and creates a task, instead of relying on someone manually checking dashboards.

**Built:** Skill + system prompt seeded, Inngest function `task-orchestrator` registered. Uses the default `AgentLaunchPanel` (no custom Container needed — it's triggered from Workflows, not manually).

### Workflow Agent

Parses plain English ("when a product gets imported, run validation, then enrichment, then notify me") into structured workflow definitions. Validates the DAG (no orphan edges, no cycles, no missing trigger) before saving to the `workflows` table.

**Built:** Skill seeded with validation logic in the system prompt. Falls through to `AgentLaunchPanel` for now; will get a Container once the visual workflow builder ships.

### Change Sentinel

Monitors retailer requirement changes (the spec sheet itself, not the live PDP). Surfaces exactly what changed between versions — added required fields, removed deprecated ones, format spec updates. Identifies which products are affected and creates remediation tasks.

**Built:** `ChangeSentinelContainer`, tools `fetch_retailer_requirement`, `find_affected_products`, `record_requirement_diff` all in registry with real implementations.

### UOM + Packaging Converter

Standardizes the "EA/CS/PK/PLT" mess. Converts dimensions and weights per packaging level. Detects impossible hierarchies (a case can't weigh less than a single unit). Writes normalized values back to the products table.

**Built:** `UOMContainer`, tools `get_product_packaging_data`, `validate_pack_hierarchy`, `normalize_uom_fields`, `write_normalized_uom`.

### Vendor Scorecard

Scores each vendor's data feed on completeness, accuracy, latency. Auto-generates fix requests with specific field diffs ("here are the 47 SKUs you sent us with missing UPC codes; please update by Friday"). Sends them through the appropriate channel.

**Built:** `VendorScorecardContainer`, tools `compute_vendor_scorecard`, `get_score_history`, `generate_fix_request`, `send_fix_request_email`. Email sending is wired.

### Performance Agent

Ingests sales, conversion, return-rate data from the connected retailers. Correlates performance issues to specific product fields (low conversion + missing hero image, high return rate + ambiguous specs). Produces a ranked fix recommendation list with predicted impact.

**Built:** `PerformanceContainer`, tools `correlate_data_quality_to_performance`, `rank_fix_recommendations`, `create_performance_task`.

### Distributor Onboarding Autopilot

The supplier-side equivalent of the Onboarding Agent, but for the supplier onboarding *to a distributor*. Transforms product data into a distributor's submission shape. Auto-populates the distributor's item-setup form. Generates a price file. Validates against the distributor's rules. Tracks back-and-forth until accepted.

**Built:** `DistributorOnboardingContainer`, `distributor_profiles` table with portal URL, contact email, required fields per distributor. Tools `get_distributor_profile`, `transform_product_for_distributor`, `validate_distributor_submission`, `generate_price_file`, `log_distributor_response`.

### EDI Resolver

Reads failed EDI documents (850 purchase orders, 855 acknowledgements, 856 ship notices, 810 invoices). Explains the errors in plain English. Proposes corrected values. Queues fixes for human review or auto-applies the unambiguous ones.

**Built:** `EDIContainer`, tools `parse_edi_document`, `validate_edi_against_spec`, `explain_edi_errors`, `propose_edi_fixes`, `apply_edi_fixes`, `trigger_edi_resend`. The full EDI lifecycle in tools.

### Deduction Agent

Monitors outgoing exports for deduction/chargeback risk *before* shipment. Predicts likely penalties based on retailer-specific deduction patterns and the data being sent. Flags risky shipments for review before they ship.

**Built:** `DeductionContainer`, tools `analyze_export_for_deductions`, `flag_deduction_risk` in registry.

### Dispute Agent

When a chargeback or deduction is taken anyway, this agent assembles the dispute packet. Ingests the deduction notice, runs root-cause analysis against the audit log and publish history, builds the proof packet, generates a dispute letter, and produces a ready-to-send email with the evidence attached.

**Built:** `DisputeContainer`, tools `ingest_deduction_notice`, `analyze_deduction_root_cause`, `assemble_dispute_proof`, `generate_dispute_packet`.

---

## Plus: the visual Workflows builder

The Workflows surface today is a list view + enable/disable toggles. The DAG editor — drag-arrange steps, draw edges, configure triggers, preview executions — is roadmapped. The underlying schema (`workflow_steps.position_x / position_y`, `workflow_edges`, the typed `step_type` enum) is already designed for it. The substrate doesn't change when the builder ships; only the UI does.

## Why staging this way works

Three reasons every one of these agents is "ready to flip on" rather than "still in development":

**The container pattern means UI is the last unknown.** Once the data model and tool wiring exist, the only open question is "what does the agent's launch panel look like." That's a design problem, not an engineering problem — and most of these agents share a launch-panel shape (configure inputs, run, review results).

**Tool reuse compounds.** EDI Resolver and Deduction Agent share five tools. Vendor Scorecard and Performance Agent share three. Every agent built strengthens the platform for the next agent. By agent twelve, new tools are the exception, not the rule.

**Feature flags decouple "built" from "shipped."** The work is done. The release decision is independent. Which agents flip on first depends on which paid customers want which agent, not on engineering capacity. The product team controls the rollout; the platform doesn't gate them.

## Why this matters for the business

The economics of having twelve agents on deck:

- **Sales velocity unbounded by engineering.** A prospect asks "do you have an EDI exception resolver?" The answer is "yes, flipping it on tomorrow." Not "Q2 roadmap."
- **Paid tier has real depth.** Free agents (Onboarding, Attribute Mapper, Enrichment, Data Analysis) are the funnel. Paid agents (Watchdog, Vendor Scorecard, EDI Resolver, Dispute, Deduction, Distributor Onboarding) are the revenue. Twelve paid agents is enough to anchor an enterprise contract.
- **The roadmap *is* the moat.** Competitors can ship one polished agent quickly. Competitors can't ship twelve specialized agents in the time it takes to flip a feature flag.
- **Staged release controls quality.** Each agent flips on for design partners first, gets feedback, gets refined, then opens up. The platform supports this natively via `is_available` per company.

## Key metrics for staged release

- **Pilot activation rate per agent.** When `is_available` flips for a specific company, do they actually use the agent? Low rate means the agent's value isn't clear; high rate means it's ready for broad release.
- **Token cost per agent run.** Specialized agents will have different cost profiles. EDI Resolver doing a 50-page document costs more than UOM Converter normalizing one product. Knowing this before broad release sets pricing.
- **Tool reuse rate.** As more agents flip on, how many tools get used by N+1 agents? Climbing reuse rate validates the registry investment.
- **Time-to-first-success.** From "agent activated for company" to "agent completed its first successful run." For each new agent, the platform should keep this number flat — the substrate handles the integration cost.
- **Roadmap-to-revenue cycle.** From "we feature-flag on the Vendor Scorecard for company X" to "company X has the Vendor Scorecard in their billing tier." How fast the platform monetizes a built feature.

## Why this is the right way to ship

Most platforms confuse "started" with "shipped." Ember's roadmap entry is unusual because every item is *already past* the engineering work — design, tools, data model, container, skill version — and waiting on one of: a UI polish pass, a pricing decision, or a customer asking for it.

That's the bet the platform was built for: not "we'll build this someday," but "we built it; rolling it out is the next problem."

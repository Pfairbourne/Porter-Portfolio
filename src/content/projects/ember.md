---
title: Ember
tagline: Product data infrastructure for industrial supply chains.
year: 2025
role: Co-founder · Head of Product & Sales
team: 3 engineers, 1 designer, 1 founder
status: live
order: 100
featured: true
tags:
  - Next.js
  - Supabase
  - Claude API
  - Firecrawl
  - TypeScript
summary: AI-native PIM platform automating SKU onboarding and chargeback prevention for industrial supply chains.
links:
  live: https://ember.example.com
---

## Context

Industrial distributors live and die by product data. A single SKU might exist across dozens of customer-specific formats — UNSPSC codes, ETIM classifications, customer-mandated attribute fields — and every misformatted record becomes a chargeback, a returned shipment, or a delayed quote.

The world before Ember: ops teams pasting between spreadsheets, supplier portals, and customer EDI feeds. Onboarding a single SKU could take 4 hours. Most distributors had a backlog measured in tens of thousands.

## The problem

Product Information Management (PIM) software has existed for 20 years. None of it was built for the way industrial distributors actually onboard data — heterogeneous suppliers, customer-specific formatting rules, attribute fields that change per category. The big PIMs assume you already have clean data. Distributors don't.

We needed to build the layer that turns supplier chaos into customer-ready data, automatically.

## My role

I lead product and sales. That means:

- Owning the product roadmap and PRDs.
- Talking to every customer myself for the first 18 months.
- Owning pricing, packaging, and the sales motion end-to-end.
- Working alongside engineering on architecture decisions where product implications matter.

Two of my co-founders own engineering and design respectively. I don't ship code.

## Approach

The first six months were customer development. I shadowed ops teams at three distributors, watching them clean SKUs in real time. The thing I kept seeing: the work wasn't *thinking*, it was *translation*. The same supplier datasheet had to be reformatted differently for every customer.

That insight reframed the product. We weren't building a "cleaner PIM" — we were building a translation layer between supplier truth and customer-specific schemas.

The technical bet was that recent LLMs were finally good enough to do attribute extraction reliably, given the right scaffolding. We use Claude for extraction, Firecrawl for supplier-site ingestion, and a tight evaluation harness so we know when a model upgrade actually helps.

## Key decisions

- **We chose a vertical wedge over a horizontal PIM.** Industrial distribution first, then adjacent categories. Saying no to consumer brands was the most important early call.
- **We charge per SKU processed, not per seat.** Aligns price to value, makes ROI math obvious, removes a procurement objection.
- **We built our own evals before we built the UI.** The product is only useful if extraction is reliable; we couldn't ship a "looks great in the demo, breaks in production" experience.
- **We picked Supabase over a custom data layer.** Faster to ship, easy for me to query as PM, and the row-level security model handles multi-tenant cleanly.

## Outcome

- Onboarding time per SKU: **4 hours → 12 minutes** with a human-in-the-loop reviewer, **4 hours → 90 seconds** for high-confidence categories.
- [REPLACE WITH SPECIFIC CUSTOMER + REVENUE METRICS]
- Closed [X] design partners in the first six months; converted [Y] to paid.

## What I'd do differently

I underweighted documentation. Customers loved the product but onboarding new internal users took longer than it should have — we leaned on me to do calls instead of letting docs do the work. Next time I'd hire technical writing earlier.

I'd also start the evals harness earlier. We built it in month 8; we should have had it on day one. Every model upgrade is a guessing game without it.

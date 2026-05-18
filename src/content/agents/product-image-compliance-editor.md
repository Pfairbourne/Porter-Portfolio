---
title: Product Image Compliance Editor
year: 2025
summary: >-
  Takes a messy supplier product photo plus a retailer's image specs and returns a fully
  retailer-compliant image: background swapped, dimensions fixed, lifestyle context generated,
  compliance checklist verified.
tags:
  - MindStudio
  - Claude
  - Gemini Image
  - Image Generation
  - Retail Compliance
  - E-commerce
link: https://app.mindstudio.ai/agents/product-image-compliance-editor-2ba8fc4b
hero: /images/agents/product-image-compliance-editor.png
order: 100
draft: false
---

## End of run

A product image that actually passes the retailer's intake review:
correct background (pure white or generated lifestyle scene),
correct dimensions, correct format, free of low-resolution flags
and demographic-rule violations, with the original product
untouched in the center of the frame. Ready to upload to the
retailer's catalog without bouncing.

~4 minutes of compute per image, $0.44, three models cooperating
(Claude for analysis and compliance, Gemini 3 Pro Image for the
background and lifestyle generation).

## Challenges it solves

**Every retailer wants something different.** White background at
a specific pixel ratio. Lifestyle scene with no people of a
specific demographic. Specific aspect ratio. Specific format. The
agent collects requirements as input and routes through a
`Validation Router` that catches contradictions, conflicting
requirements, and demographic-rule violations before generation
even starts, so you don't pay for a render that was always going
to fail QA.

**Source images are not retailer-grade.** Vendor product photos
arrive in mixed resolutions, on messy backgrounds, in the wrong
aspect. The agent runs a `Resolution Check`, refreshes the
product, removes the background, re-renders against a clean or
lifestyle background, then composites at the required dimensions.

**The product can't drift.** The single non-negotiable: the
physical product in the final image must match the source. The
refresh / re-upload / background-render loop is designed so the
generated background is layered around an unmodified product
cut-out, not regenerated from scratch.

**Compliance is verified, not assumed.** Before returning, the
agent runs a `Compliance Checklist` against the original
requirements (dimensions, format, background type, content
rules), then routes to `Review & Accept` or `Revised
Requirements` for another pass.

## Under the hood

One ambitious workflow, deeply branched. Linear at the start
(`Collect Inputs → Analyze Product → Get Dimensions → Validation
Router`), with error branches for each kind of bad-input
condition. The image-modification arm runs `Remove Background →
Background Render → Composite & Render → Apply Effects → Convert
Format`, with a `Generate Lifestyle BG` branch for retailers that
want scene-based imagery. Final loop: `Compliance Checklist →
Display Results → Review & Accept`, with `Revised Requirements`
feeding back in if the checklist fails.

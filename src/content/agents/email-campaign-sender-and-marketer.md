---
title: Email Campaign Sender and Marketer
year: 2025
summary: >-
  Ember's high-volume outreach engine — pulls leads from Google Sheets, researches each company
  live, writes personalized cold email in the right voice, sends from the right co-founder's inbox,
  and logs status back to the sheet. Paced to look human, deduped to never double-send.
tags:
  - MindStudio
  - Claude
  - Google Sheets
  - Google Search
  - HTTP / Webhook
  - Cold Email
  - Scheduled Automation
link: https://app.mindstudio.ai/agents/the-email-campain-sender-and-marker-offical-0b36faa9
hero: /images/agents/email-campaign-sender-and-marketer.png
order: 20
draft: false
---

## End of run

Personalized cold emails land in real prospects' inboxes, sent from
the correct co-founder's identity (mine or Eli's), with status
written back to the source-of-truth Google Sheet so the next run
never double-touches the same lead.

The agent ran ten times a day, Monday through Friday, 9am to 6pm
sharp, for six months as Ember's outbound engine — 1.2k runs deep,
26 published versions, $0.05 a run, 35 seconds end-to-end. We've
since downscaled the scheduled runs to focus on hand-crafted
messaging, but as a large-scale outreach tool it was excellent.

## Challenges it solves

**Two senders, one pipeline.** Leads are owned by either me or my
co-founder Eli. Each run categorizes leads by owner, fetches the
matching OAuth token (Porter Token or ELI Token), and sends from
that identity — same playbook, two voices, zero crossed wires.

**Per-lead personalization without a research analyst.**
`BuildEmail.flow` extracts the company from each lead, runs a fresh
Google search for current context, and writes the email with that
context baked in. No mail-merge clichés — every send references
something current about the recipient's company.

**Don't look like a bot.** A randomizer node staggers send timing
inside each hourly window so a thousand emails don't leave the
server at exactly :00:00. Sends are paced — ten cycles per day, not
one giant blast — to keep deliverability and sender reputation
intact.

**Never double-send.** A `Normalize & Gate 48h` function checks
every recipient against recent send history and silently drops
anyone who's been contacted in the last 48 hours, regardless of
which sender touched them.

**The Google Sheet as the only UI.** No CRM, no admin dashboard.
Leads in, status out — A:M columns, read on every run, updated on
every send. Whoever owns the campaign edits a sheet; the agent does
the rest.

## Under the hood

Three workflows wire it together. `Main.flow` is the orchestrator:
fetch sheet, process, categorize, bucket leads by owner, then for
each owner fetch the matching auth token and call `BuildEmail.flow`
(extract company → Google search → generate personalized email →
queue) and `SendEmail.flow` (format → branch by sender → HTTP POST
to the right send endpoint). Status updates land back in the same
sheet before End.

Built on Claude 3.7 Sonnet for the generation step; everything else
is deterministic JavaScript or HTTP.


## Workflows

![Main Flow — fetch leads, categorize by owner, dispatch per sender](/images/agents/email-campaign-sender-and-marketer/email-campaign-main-flow.png)

*Main Flow — fetch leads, categorize by owner, dispatch per sender*

![BuildEmail.flow — per-lead company research and personalized generation](/images/agents/email-campaign-sender-and-marketer/email-campaign-build-email-flow.png)

*BuildEmail.flow — per-lead company research and personalized generation*

![SendEmail.flow — branches by sender identity and POSTs to the right mailer](/images/agents/email-campaign-sender-and-marketer/email-campaign-send-email-flow.png)

*SendEmail.flow — branches by sender identity and POSTs to the right mailer*

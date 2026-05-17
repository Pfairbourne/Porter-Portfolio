---
title: Realestate Setter Agent
year: 2026
summary: >-
  A realtor that lives on Facebook Marketplace. Every run, a real homeowner with a for-sale-by-owner
  listing in Utah opens Messenger to a personalized note from Porter Fairbourne at Fairbourne Realty
  — sent through a stealth browser session that Facebook never flags.
tags:
  - MindStudio
  - Skyvern
  - Claude
  - Facebook Marketplace
  - Google Sheets
  - Browser Automation
  - Anti-Bot Evasion
  - Real Estate
link: https://app.mindstudio.ai/agents/realestate_setter_agent-cb755f96
hero: /images/agents/realestate-setter-agent.png
order: 30
draft: false
---

## End of run

A homeowner in Utah County opens Facebook Messenger to a real-sounding
note from Porter Fairbourne at Fairbourne Realty, asking about their
for-sale-by-owner listing. From Facebook's side, nothing looks
automated: same returning browser profile, same residential session,
same persona, a believable human cadence (max 10 messages per day,
randomized timing), zero duplicate sends. The Skyvern run completes
cleanly, the listing is marked contacted in the Google Sheet, and the
next listing is queued for tomorrow's cap.

No CAPTCHAs. No "we noticed unusual activity." No banned account.
Just an inbox.

## Challenges it solves

**The hard part isn't sending — it's not getting caught.** Facebook
Marketplace aggressively bot-flags new sessions, repeated patterns,
and accounts that suddenly start messaging at scale. The agent
pins every run to a single Skyvern Browser Profile (`Browser_ID`),
so cookies, fingerprint, and history carry over between runs — to
Facebook, it's one person checking their account, not a script
logging in cold.

**Sessions still expire.** A second workflow, `FB_Refresh.flow`,
keeps the persistent browser profile warm — re-establishing the
Facebook session on a schedule so the outreach workflow never tries
to act on a logged-out browser.

**Don't behave like a script.** A configurable Daily Message Cap
(set to 10, defaults to 8) throttles outreach to a believable human
volume. The agent also excludes any listing or seller already
contacted, so even at the cap there are no repeat messages.

**Don't sound like a template.** Each message is generated against
the specific listing — neighborhood, price, the homeowner's listing
copy — so two recipients never see the same boilerplate.

**Async by design.** Skyvern runs take real time. The agent fires
the Skyvern workflow, gets a Run ID back, then polls completion
until the browser session finishes its work, parses the result,
and writes status back to the Google Sheet — all in about 4
seconds of agent compute per dispatch.

## Under the hood

Two workflows. `Main.flow` orchestrates: reads target listings and
message history from Google Sheets, builds the Skyvern outreach
payload (with realtor profile, search location, radius, daily cap,
and exclusion lists baked in), POSTs to the Skyvern API, extracts
the Run ID, polls until complete, parses the structured Skyvern
result, and updates the sheet. `FB_Refresh.flow` runs separately
to keep the underlying browser session alive.

Configured against a specific Skyvern Workflow (`wpid_5221...`)
and a fixed Browser Profile — the same identity logs in, browses,
and messages, every single time. $0.0009 per dispatch.


## Workflows

![Main Flow — build Skyvern payload, dispatch, poll, parse, update sheet](/images/agents/realestate-setter-agent/realestate-setter-main-flow.png)

*Main Flow — build Skyvern payload, dispatch, poll, parse, update sheet*

![FB_Refresh.flow — keeps the persistent FB browser profile session warm](/images/agents/realestate-setter-agent/realestate-setter-fb-refresh-flow.png)

*FB_Refresh.flow — keeps the persistent FB browser profile session warm*

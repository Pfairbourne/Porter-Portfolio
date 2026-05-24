---
title: Realestate Setter Agent
year: 2026
summary: "Finds for-sale-by-owner listings on Facebook Marketplace and DMs the homeowners."
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
icon: house
heroCaption: "Main flow — read targets + history, build payload, dispatch Skyvern, poll, parse, write back."
order: 30
draft: false
---

*Callback handler — receives Skyvern's webhook result, re-creates the browser profile on login failure.*

![Callback handler — receives Skyvern's webhook result, re-creates the browser profile on login failure.](/images/agents/realestate-setter-agent/realestate-setter-callback-handler.png)

## End of run

A homeowner with a for-sale-by-owner listing opens Facebook
Messenger to a personalized note from a Realtor, not a
template, not a bot, not a stranger. From Facebook's side,
nothing looks automated: same returning browser profile,
same residential session, same persona, a believable human
cadence, zero duplicate sends. The Skyvern run completes
cleanly, the listing IDs that were messaged are written back
to the Google Sheet, and the next run picks up where this
one left off, without ever re-messaging a seller.

5 messages per run. No CAPTCHAs. No "we noticed unusual
activity." No banned account. Just an inbox.

## Challenges it solves

**The hard part isn't sending, it's not getting caught.**
Facebook Marketplace aggressively bot-flags new sessions,
repeated patterns, and accounts that suddenly start
messaging at scale. The agent pins every run to a single
Skyvern Browser Profile, so cookies, fingerprint, and
history carry over between runs, to Facebook it's one
person checking their account, not a script logging in
cold.

**Sessions still expire.** A second workflow, the callback
handler, listens for Skyvern's webhook result on every run.
If it parses out a login failure, it kicks off a separate
login workflow that re-establishes the session and saves a
fresh browser profile, so the next outreach run never tries
to act on a logged-out browser.

**No double-messaging.** Every messaged listing ID is added
to an in-run `visited_ids` set *before* the message is sent
(so a mid-flow failure can't trigger a retry on the same
listing), and the full list is written back to the Google
Sheet after the run. The next dispatch passes those IDs in
as `exclude_listing_ids`, so the outreach surface only ever
grows.

**Don't sound like a template.** The message body is
generated per-listing against the seller's first name and
the listing context, so two recipients never see the same
boilerplate.

**Async by design.** Skyvern runs take real time. The agent
fires the Skyvern workflow, gets a Run ID back, then polls
completion until the browser session finishes its work,
parses the result, and writes status back to the Google
Sheet, all in about 4 seconds of agent compute per dispatch.

## Skyvern workflow

The MindStudio agent hands the actual browser work off to a
4-block Skyvern workflow:

**Block 1 — `login_to_facebook`.** Starts at facebook.com
and authenticates with stored credentials. Dismisses cookie
banners, handles multi-step logins (email → Continue →
password), solves CAPTCHAs where it can, and terminates
cleanly on 2FA-required or rejected-credentials so the
callback handler can recover.

**Block 2 — `navigate_to_marketplace_housing`.** Navigates
to the Marketplace housing grid in the target search
location, applies the search filters (40-mile radius,
"Date listed: newest first," Property Sales only). If
bounced to a login/checkpoint page, it backs out cleanly
with an `auth_failure` reason.

**Block 3 — `block_1` (the outreach engine).** The core
loop. Walks visible cards top-to-bottom, left-to-right;
skips any card already marked "Message again," any with a
suspicious price ($1/$10/$100), and any listing ID in
`exclude_listing_ids` or the in-run `visited_ids` set. If
no valid card is on screen, it scrolls down one viewport
(never up). When it opens a valid card, the listing ID is
added to `visited_ids` *immediately*, before messaging,
so a failure mid-send can't trigger a duplicate. It captures
the seller's first name, clicks Message, sends the
personalized note, and returns to the grid until 5 messages
are out. Guardrails: terminate with `no_valid_listings_remaining`
after 6 fruitless scrolls; terminate with `auth_failure` on
any checkpoint/CAPTCHA; never message listings under $1,000
or with missing prices.

**Block 4 — `block_2` (data extraction).** Navigates to
the Marketplace inbox and reads the most recent outgoing
conversations from this run. Each row gets a structured
record: `listing_id`, `listing_url`, `seller_name`,
`seller_profile_id`, `status` ("sent" or "failed"). Returned
as a JSON array under `messaged_listings`, with `listing_id`,
`seller_profile_id`, and `status` required.

The output of block 4 feeds straight back into block 3's
`exclude_listing_ids` parameter on the next run. The agent's
outreach surface keeps expanding without ever double-messaging
a seller.

## Under the hood

`Main.flow` orchestrates the MindStudio side: reads target
listings and prior message history from Google Sheets,
builds the Skyvern payload (realtor profile, search
location, radius, daily cap, exclusion list), POSTs to the
Skyvern API, extracts the Run ID, polls until complete,
parses the structured result, and writes the messaged
listings back to the sheet.

The callback handler runs separately. It receives
Skyvern's webhook on every completed run, parses the
result, and on a login failure triggers a fresh login
workflow that creates a new browser profile and updates
the sheet so the next run picks up cleanly.

Configured against a specific Skyvern Workflow and a fixed
Browser Profile, the same identity logs in, browses, and
messages every single time. $0.0009 per dispatch.

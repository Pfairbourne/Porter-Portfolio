---
title: This site's stack
updated: 2026-05-17
---

This site is also a portfolio piece in its own right — built from scratch as a product manager who codes, not a designer or a frontend specialist. The notes below are an honest log of *how* it's put together, why I made the choices I made, and what I'd do differently with more time.

## At a glance

- **Astro 5** (static + SSR hybrid)
- **TypeScript** throughout — no React, no Vue, no Svelte
- **Vercel** for hosting (serverless functions for SSR routes; static prerender for the public pages)
- **Upstash Redis** for instant admin toggles (visibility, menu-bar status, icon labels, visitor messages)
- **GitHub Contents API** for content persistence — every save in the CMS is a real git commit
- **iron-session + bcryptjs** for admin auth
- **marked + js-yaml** for the in-browser markdown editor
- **@upstash/ratelimit** for API throttling

If you want the deps file, it lives at `package.json` in the repo.

## The desktop metaphor

The home page is the OS. Every clickable thing on it — case studies, fun projects, this page — is a file or folder icon. Clicking opens the content in a floating window over the desktop, not a new route. The address bar updates via the History API so you can share the URL, but the actual experience is always "modal over the desktop."

The icons are draggable. Their positions persist in `localStorage`, so if you arrange them a certain way they stay put across visits. There's a "Clean Up" button in the menu bar that snaps them back to their original grid.

The halftone portrait holding the white sign behind the icons is two PNG frames swapped on a timer — that's the "blink" you'll catch every few seconds.

## Public pages vs. windowed files

Every windowed page (about, now, writing, projects, etc.) is a real route at the server level — they have to be, for SEO and for the modal's fetch-target lookup. But if you visit one directly (e.g. refresh, paste a link), a tiny inline script stashes the path, redirects to `/`, and the desktop reopens the modal for that path. To a visitor it looks like the modal "remembered" what they were viewing.

The exception is `/settings/*` — that's a real app, navigated normally, not stuffed into the desktop modal.

## Content collections

All the structured content lives in `src/content/<collection>/<slug>.md` (or `.json` for tracks and headshots). The collections are defined in `src/content.config.ts` with [Zod](https://zod.dev) schemas — adding a new field means updating one Zod object and the matching form definition in `src/lib/content-form-config.ts`.

The eight collections today:

- `projects/` — full case studies
- `fun/` — small things built for fun
- `agents/` — MindStudio agents and automations
- `writing/` — posts and notes
- `books/` — reading list
- `tracks/` — top Spotify tracks shown on the Music app
- `headshots/` — portraits used on the Photos app
- `pages/` — long-form bodies for About, Now, and this Stack page

To add a new entry, I drop a file into the matching folder and push. To add an entirely new collection or change the schema, I edit `content.config.ts` and `content-form-config.ts`. The CMS is intentionally **edit-only** — I tried building UI for creating new collections from Settings and decided code was a better author for structure.

## Two tiers of persistence

The admin surfaces split cleanly into "instant" and "rebuild required":

**Instant (Upstash Redis):**
- Show/hide any icon on the desktop or dock
- Rename any icon ("selected-work" → "Case Studies")
- Edit the "Busy Building" status next to my name in the menu bar
- Browse and delete notes left via the Notepad

These hit Redis directly, take effect on the next request, and don't trigger a build.

**Rebuild required (GitHub Contents API):**
- Edit any existing content entry (writing post, case study, book, etc.)
- Edit the body of About / Now / this Stack page
- Upload images into `public/images/<dir>/`

These commit to `main` via the GitHub API. Vercel detects the push, rebuilds, and the change goes live ~60 seconds later. The CMS shows a "Saved" message but tells you about the rebuild lag.

I picked this split deliberately. Toggle-y state belongs in Redis — it's not content, just configuration. Real content belongs in git — versioned, diffable, recoverable. There's no separate database I have to back up.

## The CMS, briefly

`/settings` is auth-gated by a single password (hashed with bcrypt, sealed cookie via iron-session). Behind that:

- A schema-driven content form ([src/components/ContentForm.astro](src/components/ContentForm.astro)) reads from `FORM_DEFINITIONS` and renders the right input per field type — text, textarea, date, tags, image, markdown body, etc.
- The markdown editor ([src/components/MarkdownEditor.astro](src/components/MarkdownEditor.astro)) is a split-pane textarea + live `marked` preview, with a toolbar, debounced `localStorage` drafts, and inline image upload.
- Image uploads ([src/components/ImageUploader.astro](src/components/ImageUploader.astro)) drag-and-drop or click; capped at 4 MB to fit under Vercel's serverless function body limit.
- Tag input ([src/components/TagInput.astro](src/components/TagInput.astro)) is chip-style with Enter/comma to add, backspace to remove.

Everything is rate-limited via Upstash to keep one bad day from spamming `main` with commits.

## Code organization

```
src/
  components/    UI primitives — desktop icon, dock, menubar, editor pieces
  content/       Markdown / JSON for each content collection
  layouts/       DesktopLayout (home), WindowLayout (windowed pages)
  lib/           auth, KV, GitHub wrapper, rate limit, content form config
  pages/         Astro routes — public site + admin under /settings
  styles/        global.css with custom properties for the design system
public/
  images/        Static images, one subdir per collection
```

No state management library. No global stores. Each component manages its own behavior. Server state is the source of truth, fetched on render.

## Things I'd do differently

- **Type the API contract end-to-end.** Right now the API endpoints accept `unknown` bodies and validate by hand. A shared Zod schema for each endpoint's body would catch drift between the form and the server.
- **A dry-run mode for the CMS.** Edits go straight to prod; there's no preview environment. For a portfolio it's fine, but a real product would want a draft branch.
- **A proper image pipeline.** Uploaded images are stored as-is; no resize, no responsive variants. Astro has `astro:assets` for this — I just haven't wired it through the dynamic image workflow yet.

## Why I built it this way

I'm a PM. Most of my job is product judgment, not code. But I think the best PMs need to feel the texture of the work — what does it actually take to ship a feature, what does it cost in complexity, where do the failure modes live. Building this site end-to-end is how I keep that calibration current. Every decision on this page is also a small case study in scope, tradeoff, and "is this worth it."

If you want to ask me about any of it: [pfairbourne@gmail.com](mailto:pfairbourne@gmail.com).

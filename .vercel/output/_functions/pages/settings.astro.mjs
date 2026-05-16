import { a5 as createComponent, ai as renderComponent, aq as renderTemplate, af as maybeRenderHead } from '../chunks/astro/server_Cf05cWyX.mjs';
import 'piccolore';
import { $ as $$WindowLayout } from '../chunks/WindowLayout_G38_uWYc.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "WindowLayout", $$WindowLayout, { "title": "Settings \u2014 Porter Fairbourne", "description": "Admin dashboard.", "windowTitle": "settings.app", "data-astro-cid-376iicvc": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<header class="settings-header" data-astro-cid-376iicvc> <div data-astro-cid-376iicvc> <div class="t-label" style="margin-bottom: var(--s-3);" data-astro-cid-376iicvc>Admin</div> <h1 class="t-h1" data-astro-cid-376iicvc>Settings<span class="accent" data-astro-cid-376iicvc>.</span></h1> </div> <form action="/api/admin/logout" method="POST" data-astro-cid-376iicvc> <button type="submit" class="btn" data-astro-cid-376iicvc>Log out ↩</button> </form> </header> <p class="t-italic-serif" style="max-width: var(--max-w-read); margin-bottom: var(--s-8);" data-astro-cid-376iicvc>
Edit live surfaces without redeploying. The toggle-y stuff (visibility, status) takes effect
    instantly; content edits land in Phase 4b.
</p> <section data-astro-cid-376iicvc> <div class="section-label" data-astro-cid-376iicvc>Live now</div> <div class="settings-grid" data-astro-cid-376iicvc> <a class="settings-card" href="/settings/visibility" data-astro-cid-376iicvc> <div class="settings-card__head" data-astro-cid-376iicvc> <span class="settings-card__label" data-astro-cid-376iicvc>visibility.toml</span> <span class="settings-card__instant" data-astro-cid-376iicvc>instant</span> </div> <h2 class="settings-card__title" data-astro-cid-376iicvc>Icon visibility</h2> <p class="settings-card__desc" data-astro-cid-376iicvc>Show or hide any icon on the dock or desktop. Hide things while they're in progress.</p> </a> <a class="settings-card" href="/settings/menubar" data-astro-cid-376iicvc> <div class="settings-card__head" data-astro-cid-376iicvc> <span class="settings-card__label" data-astro-cid-376iicvc>menubar.txt</span> <span class="settings-card__instant" data-astro-cid-376iicvc>instant</span> </div> <h2 class="settings-card__title" data-astro-cid-376iicvc>Menu bar status</h2> <p class="settings-card__desc" data-astro-cid-376iicvc>Edit the "Busy Building" line next to your name.</p> </a> </div> </section> <section style="margin-top: var(--s-8);" data-astro-cid-376iicvc> <div class="section-label" data-astro-cid-376iicvc>Coming soon</div> <ul class="settings-list" data-astro-cid-376iicvc> <li data-astro-cid-376iicvc><span class="settings-list__title" data-astro-cid-376iicvc>Case studies</span> — add / edit / delete <code data-astro-cid-376iicvc>projects/*.md</code></li> <li data-astro-cid-376iicvc><span class="settings-list__title" data-astro-cid-376iicvc>Fun projects</span> — <code data-astro-cid-376iicvc>fun/*.md</code></li> <li data-astro-cid-376iicvc><span class="settings-list__title" data-astro-cid-376iicvc>MindStudio agents</span> — <code data-astro-cid-376iicvc>agents/*.md</code></li> <li data-astro-cid-376iicvc><span class="settings-list__title" data-astro-cid-376iicvc>Writing</span> — <code data-astro-cid-376iicvc>writing/*.md</code></li> <li data-astro-cid-376iicvc><span class="settings-list__title" data-astro-cid-376iicvc>Reading list</span> — <code data-astro-cid-376iicvc>books/*.md</code></li> <li data-astro-cid-376iicvc><span class="settings-list__title" data-astro-cid-376iicvc>Tracks</span> — top 5 study tunes</li> <li data-astro-cid-376iicvc><span class="settings-list__title" data-astro-cid-376iicvc>Headshots</span> — upload new portraits</li> <li data-astro-cid-376iicvc><span class="settings-list__title" data-astro-cid-376iicvc>About / Now</span> — page bodies</li> </ul> <p class="t-small" style="color: var(--muted); margin-top: var(--s-4);" data-astro-cid-376iicvc>
These need GitHub API commits to persist. Land in Phase 4b once the repo is wired in Vercel.
</p> </section> ` })} `;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/pages/settings/index.astro", void 0);

const $$file = "/Users/porterfairbourne/Porter Portfolio Website/src/pages/settings/index.astro";
const $$url = "/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

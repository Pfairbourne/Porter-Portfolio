import { a5 as createComponent, ai as renderComponent, aq as renderTemplate, a1 as addAttribute, af as maybeRenderHead } from '../../chunks/astro/server_Cf05cWyX.mjs';
import 'piccolore';
import { $ as $$WindowLayout } from '../../chunks/WindowLayout_G38_uWYc.mjs';
import { a as getVisibility, i as isKvConfigured } from '../../chunks/kv_DZZmj91-.mjs';
/* empty css                                         */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Visibility = createComponent(async ($$result, $$props, $$slots) => {
  const [dock, desktop] = await Promise.all([
    getVisibility("dock"),
    getVisibility("desktop")
  ]);
  const dockIcons = [
    { id: "photos", label: "Photos" },
    { id: "notepad", label: "Notepad" },
    { id: "books", label: "Books" },
    { id: "music", label: "Music" },
    { id: "calendar", label: "Calendar" },
    { id: "settings", label: "Settings" }
  ];
  const desktopIcons = [
    { id: "selected-work", label: "selected-work" },
    { id: "ember", label: "ember.mdx" },
    { id: "yoodlize", label: "yoodlize.mdx" },
    { id: "fun-projects", label: "fun-projects" },
    { id: "mindstudio-agents", label: "mindstudio-agents" },
    { id: "writing", label: "writing" },
    { id: "about", label: "about.md" },
    { id: "now", label: "now.txt" },
    { id: "resume", label: "r\xE9sum\xE9.pdf" },
    { id: "style-guide", label: "style-guide.html" }
  ];
  const configured = isKvConfigured();
  return renderTemplate`${renderComponent($$result, "WindowLayout", $$WindowLayout, { "title": "Visibility \u2014 Settings", "description": "Toggle which icons appear on the desktop and dock.", "windowTitle": "visibility.toml", "parent": { href: "/settings", label: "settings.app" }, "narrow": true, "data-astro-cid-anbkybiv": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<header style="margin-bottom: var(--s-6);" data-astro-cid-anbkybiv> <h1 class="t-h1" data-astro-cid-anbkybiv>Icon visibility<span class="accent" data-astro-cid-anbkybiv>.</span></h1> <p class="t-italic-serif" style="margin-top: var(--s-3);" data-astro-cid-anbkybiv>\nUntick anything you want hidden. Changes save instantly.\n</p> </header> ', '<section style="margin-bottom: var(--s-8);" data-astro-cid-anbkybiv> <div class="section-label" data-astro-cid-anbkybiv>Dock (apps)</div> <ul class="visibility-list" data-scope="dock" data-astro-cid-anbkybiv> ', ' </ul> </section> <section data-astro-cid-anbkybiv> <div class="section-label" data-astro-cid-anbkybiv>Desktop (files + folders)</div> <ul class="visibility-list" data-scope="desktop" data-astro-cid-anbkybiv> ', " </ul> </section> <script>\n    (function () {\n      var lists = document.querySelectorAll('.visibility-list');\n      lists.forEach(function (list) {\n        var scope = list.getAttribute('data-scope');\n        list.addEventListener('change', async function (e) {\n          var input = e.target;\n          if (!(input instanceof HTMLInputElement)) return;\n          var id = input.getAttribute('data-id');\n          if (!id) return;\n          var status = input.closest('.visibility-row').querySelector('.visibility-status');\n          status.textContent = 'saving\u2026';\n          status.dataset.state = 'pending';\n          try {\n            var res = await fetch('/api/admin/visibility', {\n              method: 'POST',\n              headers: { 'content-type': 'application/json' },\n              body: JSON.stringify({ scope: scope, id: id, visible: input.checked }),\n            });\n            if (res.ok) {\n              status.textContent = 'saved';\n              status.dataset.state = 'ok';\n              setTimeout(function () { status.textContent = ''; }, 1400);\n            } else {\n              status.textContent = 'failed';\n              status.dataset.state = 'err';\n              input.checked = !input.checked;\n            }\n          } catch (_) {\n            status.textContent = 'failed';\n            status.dataset.state = 'err';\n            input.checked = !input.checked;\n          }\n        });\n      });\n    })();\n  <\/script> "])), maybeRenderHead(), !configured && renderTemplate`<p class="visibility-warning" role="alert" data-astro-cid-anbkybiv>
Upstash isn't configured for this environment — toggles will appear to save but won't persist.
      Set <code data-astro-cid-anbkybiv>UPSTASH_REDIS_REST_URL</code> + <code data-astro-cid-anbkybiv>UPSTASH_REDIS_REST_TOKEN</code> in Vercel env.
</p>`, dockIcons.map((icon) => renderTemplate`<li class="visibility-row" data-astro-cid-anbkybiv> <label class="visibility-label" data-astro-cid-anbkybiv> <input type="checkbox"${addAttribute(dock[icon.id] !== false, "checked")}${addAttribute(icon.id, "data-id")} class="visibility-checkbox" data-astro-cid-anbkybiv> <span class="visibility-name" data-astro-cid-anbkybiv>${icon.label}</span> </label> <span class="visibility-status" aria-live="polite" data-astro-cid-anbkybiv></span> </li>`), desktopIcons.map((icon) => renderTemplate`<li class="visibility-row" data-astro-cid-anbkybiv> <label class="visibility-label" data-astro-cid-anbkybiv> <input type="checkbox"${addAttribute(desktop[icon.id] !== false, "checked")}${addAttribute(icon.id, "data-id")} class="visibility-checkbox" data-astro-cid-anbkybiv> <span class="visibility-name" data-astro-cid-anbkybiv>${icon.label}</span> </label> <span class="visibility-status" aria-live="polite" data-astro-cid-anbkybiv></span> </li>`)) })} `;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/pages/settings/visibility.astro", void 0);

const $$file = "/Users/porterfairbourne/Porter Portfolio Website/src/pages/settings/visibility.astro";
const $$url = "/settings/visibility";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Visibility,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

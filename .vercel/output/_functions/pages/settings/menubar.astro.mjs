import { a5 as createComponent, ai as renderComponent, aq as renderTemplate, a1 as addAttribute, af as maybeRenderHead } from '../../chunks/astro/server_Cf05cWyX.mjs';
import 'piccolore';
import { $ as $$WindowLayout } from '../../chunks/WindowLayout_G38_uWYc.mjs';
import { g as getMenubarStatus, i as isKvConfigured } from '../../chunks/kv_DZZmj91-.mjs';
/* empty css                                      */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Menubar = createComponent(async ($$result, $$props, $$slots) => {
  const current = await getMenubarStatus();
  const configured = isKvConfigured();
  return renderTemplate`${renderComponent($$result, "WindowLayout", $$WindowLayout, { "title": "Menu bar \u2014 Settings", "description": "Edit the menu bar status string.", "windowTitle": "menubar.txt", "parent": { href: "/settings", label: "settings.app" }, "narrow": true, "data-astro-cid-uaykrv7r": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<header style="margin-bottom: var(--s-6);" data-astro-cid-uaykrv7r> <h1 class="t-h1" data-astro-cid-uaykrv7r>Menu bar status<span class="accent" data-astro-cid-uaykrv7r>.</span></h1> <p class="t-italic-serif" style="margin-top: var(--s-3);" data-astro-cid-uaykrv7r>\nThe pulsing line next to your name. Keep it short \u2014 under 30 chars usually reads best.\n</p> </header> ', '<form id="menubar-form" class="menubar-form" novalidate data-astro-cid-uaykrv7r> <label class="menubar-form__field" data-astro-cid-uaykrv7r> <span class="t-label" data-astro-cid-uaykrv7r>Status</span> <input type="text" id="menubar-input" name="status"', ' required maxlength="80" autocomplete="off" data-astro-cid-uaykrv7r> </label> <div class="menubar-form__preview" aria-hidden="true" data-astro-cid-uaykrv7r> <span class="t-label" data-astro-cid-uaykrv7r>Preview</span> <div class="menubar-form__preview-bar" data-astro-cid-uaykrv7r> <span class="menubar__brand" data-astro-cid-uaykrv7r>Porter Fairbourne<span class="accent" data-astro-cid-uaykrv7r>.</span></span> <span class="menubar__sep" data-astro-cid-uaykrv7r>\xB7</span> <span class="menubar__status" data-astro-cid-uaykrv7r> <span class="menubar__pulse" data-astro-cid-uaykrv7r></span> <span id="menubar-preview-text" data-astro-cid-uaykrv7r>', `</span> </span> </div> </div> <div class="menubar-form__row" data-astro-cid-uaykrv7r> <p class="menubar-form__msg" id="menubar-msg" role="alert" aria-live="polite" data-astro-cid-uaykrv7r></p> <button type="submit" class="btn btn-solid" id="menubar-submit" data-astro-cid-uaykrv7r>Save</button> </div> </form> <script>
    (function () {
      var form = document.getElementById('menubar-form');
      var input = document.getElementById('menubar-input');
      var preview = document.getElementById('menubar-preview-text');
      var submit = document.getElementById('menubar-submit');
      var msg = document.getElementById('menubar-msg');
      if (!form || !input || !preview || !submit || !msg) return;

      input.addEventListener('input', function () {
        preview.textContent = input.value || 'Busy Building';
      });

      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        msg.textContent = '';
        msg.dataset.state = '';
        var value = input.value.trim();
        if (!value) {
          msg.textContent = 'Status cannot be empty.';
          msg.dataset.state = 'err';
          return;
        }
        submit.disabled = true;
        submit.textContent = 'Saving\u2026';
        try {
          var res = await fetch('/api/admin/menubar-status', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ status: value }),
          });
          if (res.ok) {
            msg.textContent = 'Saved.';
            msg.dataset.state = 'ok';
          } else {
            msg.textContent = 'Save failed.';
            msg.dataset.state = 'err';
          }
        } catch (_) {
          msg.textContent = 'Save failed.';
          msg.dataset.state = 'err';
        } finally {
          submit.disabled = false;
          submit.textContent = 'Save';
        }
      });
    })();
  <\/script> `])), maybeRenderHead(), !configured && renderTemplate`<p class="visibility-warning" role="alert" data-astro-cid-uaykrv7r>
Upstash isn't configured for this environment — saves won't persist. Set
<code data-astro-cid-uaykrv7r>UPSTASH_REDIS_REST_URL</code> + <code data-astro-cid-uaykrv7r>UPSTASH_REDIS_REST_TOKEN</code> in Vercel env.
</p>`, addAttribute(current, "value"), current) })} `;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/pages/settings/menubar.astro", void 0);

const $$file = "/Users/porterfairbourne/Porter Portfolio Website/src/pages/settings/menubar.astro";
const $$url = "/settings/menubar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Menubar,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

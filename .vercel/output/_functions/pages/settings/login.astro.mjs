import { a4 as createAstro, a5 as createComponent, ai as renderComponent, aq as renderTemplate, af as maybeRenderHead, a1 as addAttribute } from '../../chunks/astro/server_Cf05cWyX.mjs';
import 'piccolore';
import { $ as $$WindowLayout } from '../../chunks/WindowLayout_G38_uWYc.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://porterfairbourne.com");
const prerender = false;
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const errored = Astro2.url.searchParams.get("error") === "1";
  const next = Astro2.url.searchParams.get("next") ?? "/settings";
  return renderTemplate`${renderComponent($$result, "WindowLayout", $$WindowLayout, { "title": "Login \u2014 Porter Fairbourne", "description": "Admin login.", "windowTitle": "login.app", "narrow": true, "data-astro-cid-fiwfao4a": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="login" data-astro-cid-fiwfao4a> <div class="t-label" style="margin-bottom: var(--s-4);" data-astro-cid-fiwfao4a>Sign in</div> <h1 class="t-h1" data-astro-cid-fiwfao4a>Welcome back<span class="accent" data-astro-cid-fiwfao4a>.</span></h1> <p class="t-italic-serif" style="margin-top: var(--s-3); margin-bottom: var(--s-6);" data-astro-cid-fiwfao4a>
Admin access for editing the portfolio.
</p> <form action="/api/admin/login" method="POST" class="login__form" data-astro-cid-fiwfao4a> <input type="hidden" name="next"${addAttribute(next, "value")} data-astro-cid-fiwfao4a> <label class="login__label" data-astro-cid-fiwfao4a> <span class="t-label" data-astro-cid-fiwfao4a>Password</span> <input type="password" name="password" required autocomplete="current-password" autofocus class="login__input" data-astro-cid-fiwfao4a> </label> ${errored && renderTemplate`<p class="login__error" role="alert" data-astro-cid-fiwfao4a>
Wrong password — or too many tries. Wait 15 minutes and try again.
</p>`} <button type="submit" class="btn btn-solid login__submit" data-astro-cid-fiwfao4a>Sign in</button> </form> </div> ` })} `;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/pages/settings/login.astro", void 0);

const $$file = "/Users/porterfairbourne/Porter Portfolio Website/src/pages/settings/login.astro";
const $$url = "/settings/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

import { a4 as createAstro, a5 as createComponent, aq as renderTemplate, ao as renderSlot, ai as renderComponent, a1 as addAttribute, ak as renderHead, af as maybeRenderHead, l as Fragment } from './astro/server_Cf05cWyX.mjs';
import 'piccolore';
/* empty css                         */
import { $ as $$HalftoneWallpaper } from './HalftoneWallpaper_wCBxCxQT.mjs';
/* empty css                          */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://porterfairbourne.com");
const $$WindowLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$WindowLayout;
  const {
    title,
    description,
    ogImage = "/og-default.png",
    windowTitle,
    parent,
    narrow = false
  } = Astro2.props;
  const fullTitle = title ?? `${windowTitle} \u2014 Porter Fairbourne`;
  const canonical = new URL(Astro2.url.pathname, Astro2.site ?? "https://porterfairbourne.com").toString();
  return renderTemplate(_a || (_a = __template([`<html lang="en" data-astro-cid-ptylqrxg> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script>
      (function () {
        try { sessionStorage.setItem('porter-os/open', location.pathname); } catch (_) {}
        location.replace('/');
      })();
    <\/script>`, "<noscript><style>html { visibility: visible !important; }</style></noscript><title>", "</title>", '<link rel="canonical"', '><meta property="og:title"', ">", '<meta property="og:url"', '><meta property="og:type" content="article"><meta property="og:image"', '><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">', '</head> <body class="window-page" data-astro-cid-ptylqrxg> ', " <div", ' data-astro-cid-ptylqrxg> <div class="window__chrome" data-astro-cid-ptylqrxg> <div class="window__title" aria-label="Path" data-astro-cid-ptylqrxg> ', ' <span class="window__crumb-current" data-astro-cid-ptylqrxg>', '</span> </div> <a class="window__close" href="/" aria-label="Close and return to desktop" title="Close (Esc)" data-astro-cid-ptylqrxg> <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" data-astro-cid-ptylqrxg> <line x1="2.5" y1="2.5" x2="9.5" y2="9.5" data-astro-cid-ptylqrxg></line> <line x1="9.5" y1="2.5" x2="2.5" y2="9.5" data-astro-cid-ptylqrxg></line> </svg> </a> </div> <main class="window__content" data-astro-cid-ptylqrxg> ', " </main> </div> <script>\n      // Esc key closes the window (returns to desktop).\n      document.addEventListener('keydown', function (e) {\n        if (e.key === 'Escape') {\n          window.location.href = '/';\n        }\n      });\n    <\/script> </body> </html>"])), maybeRenderHead(), fullTitle, description && renderTemplate`<meta name="description"${addAttribute(description, "content")}>`, addAttribute(canonical, "href"), addAttribute(fullTitle, "content"), description && renderTemplate`<meta property="og:description"${addAttribute(description, "content")}>`, addAttribute(canonical, "content"), addAttribute(ogImage, "content"), renderHead(), renderComponent($$result, "HalftoneWallpaper", $$HalftoneWallpaper, { "data-astro-cid-ptylqrxg": true }), addAttribute(["window", narrow && "window--narrow"], "class:list"), parent && renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "data-astro-cid-ptylqrxg": true }, { "default": ($$result2) => renderTemplate` <a class="window__crumb"${addAttribute(parent.href, "href")} data-astro-cid-ptylqrxg>${parent.label}</a> <span class="window__crumb-sep" aria-hidden="true" data-astro-cid-ptylqrxg>/</span> ` })}`, windowTitle, renderSlot($$result, $$slots["default"]));
}, "/Users/porterfairbourne/Porter Portfolio Website/src/layouts/WindowLayout.astro", void 0);

export { $$WindowLayout as $ };

import { a4 as createAstro, a5 as createComponent, a1 as addAttribute, ak as renderHead, ao as renderSlot, aq as renderTemplate, af as maybeRenderHead, ai as renderComponent } from '../chunks/astro/server_Cf05cWyX.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                 */
import { $ as $$HalftoneWallpaper } from '../chunks/HalftoneWallpaper_wCBxCxQT.mjs';
import { a as getVisibility, g as getMenubarStatus } from '../chunks/kv_DZZmj91-.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro$6 = createAstro("https://porterfairbourne.com");
const $$DesktopLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$DesktopLayout;
  const {
    title = "Porter Fairbourne \u2014 Product Manager",
    description = "Porter Fairbourne \u2014 Product Manager, Builder, and Operator. Selected work, writing, and side projects.",
    ogImage = "/og-default.png"
  } = Astro2.props;
  const canonical = new URL(Astro2.url.pathname, Astro2.site ?? "https://porterfairbourne.com").toString();
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description"${addAttribute(description, "content")}><link rel="canonical"${addAttribute(canonical, "href")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:url"${addAttribute(canonical, "content")}><meta property="og:type" content="website"><meta property="og:image"${addAttribute(ogImage, "content")}><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/layouts/DesktopLayout.astro", void 0);

var __freeze$2 = Object.freeze;
var __defProp$2 = Object.defineProperty;
var __template$2 = (cooked, raw) => __freeze$2(__defProp$2(cooked, "raw", { value: __freeze$2(cooked.slice()) }));
var _a$2;
const $$Astro$5 = createAstro("https://porterfairbourne.com");
const $$MenuBar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$MenuBar;
  const { status = "Busy Building" } = Astro2.props;
  const EMAIL = "pfairbourne@gmail.com";
  const PHONE = "801-597-9812";
  const LOCATION = "Draper, Utah";
  const LINKEDIN = "https://www.linkedin.com/in/porter-fairbourne-6a472a28a/";
  return renderTemplate(_a$2 || (_a$2 = __template$2(["", '<header class="menubar" role="banner"> <span class="menubar__brand">Porter Fairbourne<span class="accent">.</span></span> <span class="menubar__status"> <span class="menubar__pulse" aria-hidden="true"></span> <span>', '</span> </span> <span class="menubar__clock" id="menubar-clock" aria-live="off">\u2014 \u2014</span> <span class="menubar__plain">', '</span> <a class="menubar__link"', ">", '</a> <span class="menubar__plain">', '</span> <button class="menubar__action" type="button" data-action="reset-desktop" aria-label="Return files to their default positions">\nClean up\n</button> <a class="menubar__cta"', ` target="_blank" rel="noopener noreferrer">LinkedIn \u2197</a> </header> <script>
  (function () {
    var el = document.getElementById('menubar-clock');
    if (!el) return;
    function tick() {
      try {
        var parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Denver',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).formatToParts(new Date());
        var h = '00', m = '00';
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === 'hour') h = parts[i].value;
          else if (parts[i].type === 'minute') m = parts[i].value;
        }
        el.textContent = h + ':' + m + ' MST';
      } catch (_) {
        el.textContent = '';
      }
    }
    tick();
    setInterval(tick, 30000);
  })();
<\/script>`])), maybeRenderHead(), status, LOCATION, addAttribute(`mailto:${EMAIL}`, "href"), EMAIL, PHONE, addAttribute(LINKEDIN, "href"));
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/MenuBar.astro", void 0);

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function makeDots(opts) {
  const { W, H, pitch, maxR, minR, angleDeg, field, cutoff = 0.18 } = opts;
  const ang = angleDeg * Math.PI / 180;
  const cs = Math.cos(ang);
  const sn = Math.sin(ang);
  const cx = W / 2;
  const cy = H / 2;
  const span = Math.hypot(W, H);
  const out = [];
  for (let v = -span / 2; v < span / 2; v += pitch) {
    for (let u = -span / 2; u < span / 2; u += pitch) {
      const x = cx + u * cs - v * sn;
      const y = cy + u * sn + v * cs;
      if (x < -maxR || x > W + maxR || y < -maxR || y > H + maxR) continue;
      const t = field(x, y, W, H);
      const r = minR + (maxR - minR) * t;
      if (r < cutoff) continue;
      out.push({ x, y, r });
    }
  }
  return out;
}
const NEWSPRINT = {
  pitch: 4.6,
  maxR: 2.1,
  minR: 0,
  angleDeg: 0,
  field: ((x, y, W, H) => {
    const t = 1 - y / H;
    const u = 1 - x / W;
    return Math.pow(Math.max(0, 1 - t * 0.7 - u * 0.2), 1.2);
  })
};
const PORTRAIT_FIELD = (x, y, W, H) => {
  const u = x / W;
  const v = y / H;
  const dh = Math.hypot(u - 0.5, v - 0.4);
  const headIn = 1 - smoothstep(0.16, 0.22, dh);
  const dsX = (u - 0.5) / 0.5;
  const dsY = (v - 0.95) / 0.35;
  const shouldersIn = 1 - smoothstep(0.85, 1.05, Math.hypot(dsX, dsY));
  const s = Math.max(headIn, shouldersIn);
  const shade = 0.7 + 0.3 * (1 - smoothstep(0, 0.9, Math.hypot(u - 0.3, v - 0.25)));
  return Math.min(1, s * shade);
};

const $$Astro$4 = createAstro("https://porterfairbourne.com");
const $$FileGlyph = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$FileGlyph;
  const { ext = "", uid } = Astro2.props;
  const W = 72;
  const H = 72;
  const x0 = 8;
  const y0 = 4;
  const w = 56;
  const h = 64;
  const fold = 14;
  const bodyPath = `M ${x0} ${y0 + 2} Q ${x0} ${y0}, ${x0 + 2} ${y0} L ${x0 + w - fold} ${y0} L ${x0 + w} ${y0 + fold} L ${x0 + w} ${y0 + h - 2} Q ${x0 + w} ${y0 + h}, ${x0 + w - 2} ${y0 + h} L ${x0 + 2} ${y0 + h} Q ${x0} ${y0 + h}, ${x0} ${y0 + h - 2} Z`;
  const foldPath = `M ${x0 + w - fold} ${y0} L ${x0 + w - fold} ${y0 + fold} L ${x0 + w} ${y0 + fold}`;
  const labelBandY = y0 + h - 16;
  const dots = makeDots({
    W,
    H,
    pitch: NEWSPRINT.pitch,
    maxR: NEWSPRINT.maxR,
    minR: NEWSPRINT.minR,
    angleDeg: NEWSPRINT.angleDeg,
    field: NEWSPRINT.field
  });
  const clipId = `clip-file-${uid}`;
  return renderTemplate`${maybeRenderHead()}<svg${addAttribute(`0 0 ${W} ${H}`, "viewBox")} class="halftone-icon" aria-hidden="true"> <defs> <clipPath${addAttribute(clipId, "id")}> <path${addAttribute(bodyPath, "d")}></path> </clipPath> </defs> <path${addAttribute(bodyPath, "d")} class="icon-paper"></path> <g${addAttribute(`url(#${clipId})`, "clip-path")} class="icon-dots"> ${dots.map((d) => renderTemplate`<circle${addAttribute(d.x.toFixed(2), "cx")}${addAttribute(d.y.toFixed(2), "cy")}${addAttribute(d.r.toFixed(2), "r")}></circle>`)} </g> <g${addAttribute(`url(#${clipId})`, "clip-path")}> <rect${addAttribute(x0, "x")}${addAttribute(labelBandY, "y")}${addAttribute(w, "width")} height="16" class="icon-label-band"></rect> <text${addAttribute(x0 + w / 2, "x")}${addAttribute(labelBandY + 11, "y")} class="icon-label-text" text-anchor="middle">.${ext}</text> </g> <path${addAttribute(foldPath, "d")} class="icon-fold"></path> <path${addAttribute(bodyPath, "d")} class="icon-outline"></path> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/FileGlyph.astro", void 0);

const $$Astro$3 = createAstro("https://porterfairbourne.com");
const $$FolderGlyph = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$FolderGlyph;
  const { uid } = Astro2.props;
  const W = 72;
  const H = 72;
  const x0 = 6;
  const y0 = 14;
  const w = 60;
  const h = 50;
  const tabW = 22;
  const tabH = 8;
  const r = 3;
  const bodyPath = `M ${x0} ${y0 - tabH + r} Q ${x0} ${y0 - tabH}, ${x0 + r} ${y0 - tabH} L ${x0 + tabW - r} ${y0 - tabH} Q ${x0 + tabW} ${y0 - tabH}, ${x0 + tabW + 2} ${y0 - tabH + 4} L ${x0 + tabW + 6} ${y0} L ${x0 + w - r} ${y0} Q ${x0 + w} ${y0}, ${x0 + w} ${y0 + r} L ${x0 + w} ${y0 + h - r} Q ${x0 + w} ${y0 + h}, ${x0 + w - r} ${y0 + h} L ${x0 + r} ${y0 + h} Q ${x0} ${y0 + h}, ${x0} ${y0 + h - r} Z`;
  const seamPath = `M ${x0} ${y0 + 2} L ${x0 + w} ${y0 + 2}`;
  const dots = makeDots({
    W,
    H,
    pitch: NEWSPRINT.pitch,
    maxR: NEWSPRINT.maxR,
    minR: NEWSPRINT.minR,
    angleDeg: NEWSPRINT.angleDeg,
    field: NEWSPRINT.field
  });
  const clipId = `clip-folder-${uid}`;
  return renderTemplate`${maybeRenderHead()}<svg${addAttribute(`0 0 ${W} ${H}`, "viewBox")} class="halftone-icon" aria-hidden="true"> <defs> <clipPath${addAttribute(clipId, "id")}> <path${addAttribute(bodyPath, "d")}></path> </clipPath> </defs> <path${addAttribute(bodyPath, "d")} class="icon-paper"></path> <g${addAttribute(`url(#${clipId})`, "clip-path")} class="icon-dots"> ${dots.map((d) => renderTemplate`<circle${addAttribute(d.x.toFixed(2), "cx")}${addAttribute(d.y.toFixed(2), "cy")}${addAttribute(d.r.toFixed(2), "r")}></circle>`)} </g> <path${addAttribute(seamPath, "d")} class="icon-seam"></path> <path${addAttribute(bodyPath, "d")} class="icon-outline"></path> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/FolderGlyph.astro", void 0);

const $$Astro$2 = createAstro("https://porterfairbourne.com");
const $$DesktopIcon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$DesktopIcon;
  const {
    id,
    href,
    label,
    ext = "",
    variant = "file",
    external = false,
    download = false
  } = Astro2.props;
  const rel = external ? "noopener noreferrer" : void 0;
  const target = external ? "_blank" : void 0;
  const variantClass = variant === "folder" ? "icon--folder" : "icon--file";
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(["icon", variantClass], "class:list")}${addAttribute(href, "href")}${addAttribute(target, "target")}${addAttribute(rel, "rel")}${addAttribute(download ? "" : void 0, "download")}${addAttribute(id, "data-icon-id")} draggable="false"> <div class="icon__glyph"> ${variant === "folder" ? renderTemplate`${renderComponent($$result, "FolderGlyph", $$FolderGlyph, { "uid": id })}` : renderTemplate`${renderComponent($$result, "FileGlyph", $$FileGlyph, { "uid": id, "ext": ext })}`} </div> <span class="icon__label">${label}</span> </a>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/DesktopIcon.astro", void 0);

const $$PortraitHalftone = createComponent(($$result, $$props, $$slots) => {
  const W = 320;
  const H = 320;
  const dots = makeDots({
    W,
    H,
    pitch: 6,
    maxR: 2.6,
    minR: 0,
    angleDeg: 0,
    field: PORTRAIT_FIELD
  });
  return renderTemplate`${maybeRenderHead()}<svg${addAttribute(`0 0 ${W} ${H}`, "viewBox")} class="portrait-svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true"> <rect${addAttribute(W, "width")}${addAttribute(H, "height")} class="portrait-bg"></rect> <g class="portrait-dots"> ${dots.map((d) => renderTemplate`<circle${addAttribute(d.x.toFixed(2), "cx")}${addAttribute(d.y.toFixed(2), "cy")}${addAttribute(d.r.toFixed(2), "r")}></circle>`)} </g> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/PortraitHalftone.astro", void 0);

const $$Astro$1 = createAstro("https://porterfairbourne.com");
const $$DockIcon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$DockIcon;
  const { id, href, label } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a class="dock__icon"${addAttribute(href, "href")}${addAttribute(label, "aria-label")}${addAttribute(id, "data-dock-icon-id")} draggable="false"> <span class="dock__tile"> ${renderSlot($$result, $$slots["default"])} </span> <span class="dock__tooltip" aria-hidden="true">${label}</span> <span class="dock__caption" aria-hidden="true">${label}</span> </a>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/DockIcon.astro", void 0);

const $$PhotosGlyph = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<svg viewBox="0 0 32 32" class="dock-glyph" aria-hidden="true"> <rect x="5" y="8" width="22" height="17" rx="2" class="dg-stroke"></rect> <circle cx="11.5" cy="14.5" r="1.6" class="dg-fill"></circle> <path d="M 5 22 L 12 16 L 18 21 L 22 18 L 27 22 L 27 25 L 5 25 Z" class="dg-fill"></path> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/dock-glyphs/PhotosGlyph.astro", void 0);

const $$NotepadGlyph = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<svg viewBox="0 0 32 32" class="dock-glyph" aria-hidden="true"> <path d="M 8 5 L 22 5 L 26 9 L 26 26 Q 26 27, 25 27 L 8 27 Q 7 27, 7 26 L 7 6 Q 7 5, 8 5 Z" class="dg-stroke"></path> <path d="M 22 5 L 22 9 L 26 9" class="dg-stroke" fill="none"></path> <line x1="11" y1="14" x2="22" y2="14" class="dg-line"></line> <line x1="11" y1="18" x2="22" y2="18" class="dg-line"></line> <line x1="11" y1="22" x2="18" y2="22" class="dg-line"></line> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/dock-glyphs/NotepadGlyph.astro", void 0);

const $$BooksGlyph = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<svg viewBox="0 0 32 32" class="dock-glyph" aria-hidden="true"> <rect x="6" y="6" width="6" height="20" rx="0.5" class="dg-stroke"></rect> <rect x="13" y="8" width="6" height="18" rx="0.5" class="dg-stroke"></rect> <rect x="20" y="5" width="6" height="21" rx="0.5" class="dg-stroke"></rect> <line x1="7" y1="10" x2="11" y2="10" class="dg-line"></line> <line x1="14" y1="12" x2="18" y2="12" class="dg-line"></line> <line x1="21" y1="9" x2="25" y2="9" class="dg-line"></line> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/dock-glyphs/BooksGlyph.astro", void 0);

const $$MusicGlyph = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<svg viewBox="0 0 32 32" class="dock-glyph" aria-hidden="true"> <path d="M 14 5 L 24 7 L 24 21" class="dg-stroke" fill="none"></path> <path d="M 14 5 L 14 22" class="dg-stroke" fill="none"></path> <ellipse cx="11" cy="22" rx="4" ry="3" class="dg-fill"></ellipse> <ellipse cx="21" cy="21" rx="4" ry="3" class="dg-fill"></ellipse> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/dock-glyphs/MusicGlyph.astro", void 0);

const $$CalendarGlyph = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<svg viewBox="0 0 32 32" class="dock-glyph" aria-hidden="true"> <rect x="5" y="7" width="22" height="20" rx="2" class="dg-stroke"></rect> <line x1="5" y1="12" x2="27" y2="12" class="dg-stroke"></line> <line x1="11" y1="5" x2="11" y2="9" class="dg-stroke"></line> <line x1="21" y1="5" x2="21" y2="9" class="dg-stroke"></line> <rect x="9" y="15" width="3" height="3" class="dg-fill"></rect> <rect x="14.5" y="15" width="3" height="3" class="dg-fill"></rect> <rect x="20" y="15" width="3" height="3" class="dg-fill"></rect> <rect x="9" y="20" width="3" height="3" class="dg-fill"></rect> <rect x="14.5" y="20" width="3" height="3" class="dg-fill-accent"></rect> <rect x="20" y="20" width="3" height="3" class="dg-fill"></rect> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/dock-glyphs/CalendarGlyph.astro", void 0);

const $$SettingsGlyph = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<svg viewBox="0 0 32 32" class="dock-glyph" aria-hidden="true"> <path d="M 16 4 L 18.5 6.5 L 21.9 5.6 L 23.1 8.9 L 26.4 10.1 L 25.5 13.5 L 28 16 L 25.5 18.5 L 26.4 21.9 L 23.1 23.1 L 21.9 26.4 L 18.5 25.5 L 16 28 L 13.5 25.5 L 10.1 26.4 L 8.9 23.1 L 5.6 21.9 L 6.5 18.5 L 4 16 L 6.5 13.5 L 5.6 10.1 L 8.9 8.9 L 10.1 5.6 L 13.5 6.5 Z" class="dg-stroke" fill="none"></path> <circle cx="16" cy="16" r="4" class="dg-fill-accent"></circle> </svg>`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/dock-glyphs/SettingsGlyph.astro", void 0);

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$Astro = createAstro("https://porterfairbourne.com");
const $$Dock = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dock;
  const { visibility = {} } = Astro2.props;
  const showIf = (id) => visibility[id] !== false;
  const apps = [
    { id: "photos", href: "/photos", label: "Photos", Glyph: $$PhotosGlyph },
    { id: "notepad", href: "/notepad", label: "Notepad", Glyph: $$NotepadGlyph },
    { id: "books", href: "/books", label: "Books", Glyph: $$BooksGlyph },
    { id: "music", href: "/music", label: "Music", Glyph: $$MusicGlyph },
    { id: "calendar", href: "/calendar", label: "Calendar", Glyph: $$CalendarGlyph },
    { id: "settings", href: "/settings", label: "Settings", Glyph: $$SettingsGlyph }
  ];
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", '<nav class="dock" aria-label="Apps"> ', " </nav> <script>\n  (function () {\n    var dock = document.querySelector('.dock');\n    if (!dock) return;\n    var icons = Array.prototype.slice.call(dock.querySelectorAll('.dock__icon'));\n    if (!icons.length) return;\n\n    function focusAt(index) {\n      var clamped = Math.max(0, Math.min(icons.length - 1, index));\n      icons[clamped].focus();\n    }\n\n    dock.addEventListener('keydown', function (e) {\n      var current = icons.indexOf(document.activeElement);\n      if (current < 0) return;\n      if (e.key === 'ArrowRight') { e.preventDefault(); focusAt(current + 1); }\n      else if (e.key === 'ArrowLeft') { e.preventDefault(); focusAt(current - 1); }\n      else if (e.key === 'Home') { e.preventDefault(); focusAt(0); }\n      else if (e.key === 'End') { e.preventDefault(); focusAt(icons.length - 1); }\n    });\n  })();\n<\/script>"])), maybeRenderHead(), apps.filter((a) => showIf(a.id)).map(({ id, href, label, Glyph }) => renderTemplate`${renderComponent($$result, "DockIcon", $$DockIcon, { "id": id, "href": href, "label": label }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Glyph", Glyph, {})} ` })}`));
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/Dock.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const [dockVisibility, desktopVisibility, menubarStatus] = await Promise.all([
    getVisibility("dock"),
    getVisibility("desktop"),
    getMenubarStatus()
  ]);
  const PORTRAIT_OPEN = "/images/about/Eyes_Open.png";
  const PORTRAIT_CLOSED = "/images/about/Eyes_Closed.png";
  const PORTRAIT_ALT = "Porter Fairbourne \u2014 halftone portrait";
  const leftIcons = [
    { id: "selected-work", href: "/projects", label: "selected-work", variant: "folder" },
    { id: "ember", href: "/projects/ember", label: "ember.mdx", ext: "mdx", variant: "file" },
    { id: "yoodlize", href: "/projects/yoodlize-fb-automation", label: "yoodlize.mdx", ext: "mdx", variant: "file" },
    { id: "fun-projects", href: "/fun", label: "fun-projects", variant: "folder" },
    { id: "mindstudio-agents", href: "/agents", label: "mindstudio-agents", variant: "folder" },
    { id: "writing", href: "/writing", label: "writing", variant: "folder" }
  ];
  const rightIcons = [
    { id: "about", href: "/about", label: "about.md", ext: "md", variant: "file" },
    { id: "now", href: "/now", label: "now.txt", ext: "txt", variant: "file" },
    { id: "resume", href: "/resume", label: "r\xE9sum\xE9.pdf", ext: "pdf", variant: "file" },
    { id: "style-guide", href: "/style-guide", label: "style-guide.html", ext: "html", variant: "file" }
  ];
  return renderTemplate`${renderComponent($$result, "DesktopLayout", $$DesktopLayout, { "title": "Porter Fairbourne \u2014 Product Manager", "description": "The workspace of Porter Fairbourne \u2014 Product Manager, Builder, and Operator. Click around \u2014 every icon is a file." }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", " ", '<div class="os"> ', ' <div class="surface"> <!-- Left column --> <nav class="icon-column" aria-label="Work"> ', ' </nav> <!-- Wallpaper / portrait --> <section class="wallpaper" aria-label="Porter"> <div class="wallpaper__portrait"> ', ' </div> <div> <div class="wallpaper__name">Porter Fairbourne<span class="accent">.</span></div> <p class="wallpaper__caption">\nProduct Manager, Builder, and Operator. Building <a class="link-subtle" href="/projects/ember">Ember</a> by day, small things at night.\n</p> </div> </section> <!-- Right column --> <nav class="icon-column" aria-label="About"> ', " </nav> </div> </div> ", `  <div class="desktop-window" id="desktop-window" role="dialog" aria-modal="true" aria-labelledby="desktop-window-title" hidden> <div class="window"> <div class="window__chrome"> <div class="window__title" id="desktop-window-title" aria-label="Path">\u2014</div> <button class="window__close" type="button" data-close aria-label="Close (Esc)" title="Close (Esc)"> <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"> <line x1="2.5" y1="2.5" x2="9.5" y2="9.5"></line> <line x1="9.5" y1="2.5" x2="2.5" y2="9.5"></line> </svg> </button> </div> <div class="window__content" id="desktop-window-body"></div> </div> </div> <script>
    // \u2014 Desktop window controller \u2014
    // Intercepts clicks on file/folder icons (and internal links inside the open window).
    // Fetches the target page's window content, injects it into the floating window,
    // and updates the URL via History API. No actual navigation.
    (function () {
      var modal = document.getElementById('desktop-window');
      var titleEl = document.getElementById('desktop-window-title');
      var bodyEl = document.getElementById('desktop-window-body');
      if (!modal || !titleEl || !bodyEl) return;

      var WINDOWED_PREFIXES = [
        '/about', '/now', '/resume', '/fun', '/writing', '/projects',
        '/agents', '/style-guide', '/photos', '/notepad', '/books', '/music', '/calendar'
      ];
      var ORIGINAL_TITLE = document.title;
      var cache = {};
      var triggerEl = null;

      function isWindowedPath(pathname) {
        for (var i = 0; i < WINDOWED_PREFIXES.length; i++) {
          var p = WINDOWED_PREFIXES[i];
          if (pathname === p || pathname.indexOf(p + '/') === 0) return true;
        }
        return false;
      }

      function shouldIntercept(link) {
        if (!link || !link.href) return false;
        var url;
        try { url = new URL(link.href); } catch (_) { return false; }
        if (url.origin !== location.origin) return false;
        if (link.target === '_blank') return false;
        if (link.hasAttribute('download')) return false;
        if (link.protocol === 'mailto:' || link.protocol === 'tel:') return false;
        if (url.pathname.endsWith('.pdf') || url.pathname.endsWith('.html')) return false;
        return isWindowedPath(url.pathname);
      }

      function setOpen(open) {
        if (open) {
          modal.removeAttribute('hidden');
          document.body.classList.add('has-modal');
        } else {
          modal.setAttribute('hidden', '');
          document.body.classList.remove('has-modal');
        }
      }

      function openWindowAt(path, push, trigger) {
        if (trigger) triggerEl = trigger;
        setOpen(true);
        bodyEl.innerHTML = '<div class="modal-loading">opening\u2026</div>';
        titleEl.textContent = '';
        bodyEl.scrollTop = 0;

        var pending = cache[path] || (cache[path] = fetch(path, { credentials: 'same-origin' }).then(function (r) {
          if (!r.ok) throw new Error('not found');
          return r.text();
        }));

        pending.then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var content = doc.querySelector('.window__content');
          var title = doc.querySelector('.window__title');
          var pageTitle = doc.querySelector('title');
          if (content) bodyEl.innerHTML = content.innerHTML;
          else bodyEl.innerHTML = '<div class="modal-error">No content found.</div>';
          if (title) titleEl.innerHTML = title.innerHTML;
          if (pageTitle) document.title = pageTitle.textContent;
          bodyEl.scrollTop = 0;
          var closeBtn = modal.querySelector('.window__close');
          if (closeBtn) closeBtn.focus({ preventScroll: true });

          // Auto-size same-origin iframes (e.g. the embedded r\xE9sum\xE9) to content height
          var frames = bodyEl.querySelectorAll('iframe');
          for (var i = 0; i < frames.length; i++) {
            (function (frame) {
              function fit() {
                try {
                  var h = frame.contentDocument && frame.contentDocument.body
                    ? frame.contentDocument.body.scrollHeight + 24
                    : 0;
                  if (h > 0) frame.style.height = h + 'px';
                } catch (_) {}
              }
              if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
                fit();
              } else {
                frame.addEventListener('load', fit);
              }
            })(frames[i]);
          }
        }).catch(function () {
          delete cache[path];
          bodyEl.innerHTML = '<div class="modal-error">Could not open this file.</div>';
        });

        if (push) {
          history.pushState({ modal: path }, '', path);
        }
      }

      function closeWindow(push) {
        setOpen(false);
        bodyEl.innerHTML = '';
        titleEl.textContent = '';
        document.title = ORIGINAL_TITLE;
        if (push) {
          history.pushState({ modal: null }, '', '/');
        }
        if (triggerEl && document.body.contains(triggerEl)) {
          triggerEl.focus({ preventScroll: true });
        }
        triggerEl = null;
      }

      // Initial state \u2014 if we were redirected here from a direct hit on a windowed URL
      // (refresh / share link / bookmark), restore that URL and open the modal.
      var initialPath = null;
      try {
        var stash = sessionStorage.getItem('porter-os/open');
        if (stash && stash !== '/' && isWindowedPath(stash)) {
          sessionStorage.removeItem('porter-os/open');
          initialPath = stash;
        }
      } catch (_) {}

      if (initialPath) {
        history.replaceState({ modal: initialPath }, '', initialPath);
        openWindowAt(initialPath, false, null);
      } else if (!history.state) {
        history.replaceState({ modal: null }, '', location.pathname);
      }

      // Delegated click handler
      document.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;

        // Close on backdrop or close button
        if (modal.contains(e.target)) {
          var closer = e.target.closest('[data-close]');
          if (closer) {
            e.preventDefault();
            closeWindow(true);
            return;
          }
          if (e.target === modal) {
            e.preventDefault();
            closeWindow(true);
            return;
          }
        }

        // Find an anchor we should intercept
        var link = e.target.closest('a');
        if (!link) return;
        if (!shouldIntercept(link)) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        e.preventDefault();
        openWindowAt(new URL(link.href).pathname, true, link);
      });

      // Esc closes
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
          closeWindow(true);
        }
      });

      // Browser back/forward
      window.addEventListener('popstate', function () {
        var path = location.pathname;
        if (path === '/' || !isWindowedPath(path)) {
          closeWindow(false);
        } else {
          openWindowAt(path, false, null);
        }
      });
    })();
  <\/script> <script>
    // \u2014 Portrait blink controller \u2014
    // Randomized blinks every 2.2\u20135.4s, ~130ms duration, ~12% chance of double blink.
    // Skips when tab is hidden or user prefers reduced motion.
    (function () {
      var blink = document.getElementById('portrait-blink');
      if (!blink) return;
      var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq && mq.matches) return;

      function rand(min, max) { return min + Math.random() * (max - min); }

      function schedule() {
        var delay = rand(2200, 5400);
        setTimeout(function () {
          if (document.hidden) { schedule(); return; }
          blink.style.opacity = '1';
          setTimeout(function () {
            blink.style.opacity = '0';
            if (Math.random() < 0.12) {
              setTimeout(function () {
                blink.style.opacity = '1';
                setTimeout(function () {
                  blink.style.opacity = '0';
                  schedule();
                }, 110);
              }, 170);
            } else {
              schedule();
            }
          }, 130);
        }, delay);
      }
      schedule();
    })();
  <\/script> <script>
    (function () {
      var KEY = 'porter-os/icons-v1';
      var root = document.querySelector('.os');
      var surface = document.querySelector('.surface');
      if (!root || !surface) return;

      var icons = Array.prototype.slice.call(document.querySelectorAll('.icon[data-icon-id]'));
      if (!icons.length) return;

      // Load saved positions
      var saved = {};
      try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { saved = {}; }

      function measureNatural() {
        var surfRect = surface.getBoundingClientRect();
        var out = {};
        for (var i = 0; i < icons.length; i++) {
          var r = icons[i].getBoundingClientRect();
          out[icons[i].getAttribute('data-icon-id')] = {
            x: Math.round(r.left - surfRect.left),
            y: Math.round(r.top - surfRect.top)
          };
        }
        return out;
      }

      function constrain(x, y, w, h) {
        var sw = surface.clientWidth;
        var sh = surface.clientHeight;
        return {
          x: Math.max(0, Math.min(sw - w, x)),
          y: Math.max(0, Math.min(sh - h, y))
        };
      }

      function init() {
        var natural = measureNatural();
        root.classList.add('os--free');
        for (var i = 0; i < icons.length; i++) {
          var icon = icons[i];
          var id = icon.getAttribute('data-icon-id');
          var pos = saved[id] || natural[id] || { x: 0, y: 0 };
          var w = icon.offsetWidth || 104;
          var h = icon.offsetHeight || 104;
          var fixed = constrain(pos.x, pos.y, w, h);
          icon.style.left = fixed.x + 'px';
          icon.style.top = fixed.y + 'px';
        }
      }

      // Wait for fonts so layout has settled before measuring
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init);
      } else {
        // fallback if Font Loading API is missing
        if (document.readyState === 'complete') init();
        else window.addEventListener('load', init);
      }

      function persist() {
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (_) {}
      }

      // Drag state (single active drag at a time)
      var active = null;
      var startX = 0, startY = 0, originX = 0, originY = 0;
      var moved = false;

      icons.forEach(function (icon) {
        icon.addEventListener('pointerdown', function (e) {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (!root.classList.contains('os--free')) return;
          active = icon;
          startX = e.clientX;
          startY = e.clientY;
          originX = parseFloat(icon.style.left) || 0;
          originY = parseFloat(icon.style.top) || 0;
          moved = false;
          try { icon.setPointerCapture(e.pointerId); } catch (_) {}
          icon.classList.add('icon--dragging');
        });

        icon.addEventListener('pointermove', function (e) {
          if (active !== icon) return;
          var dx = e.clientX - startX;
          var dy = e.clientY - startY;
          if (!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) moved = true;
          if (moved) {
            var next = constrain(originX + dx, originY + dy, icon.offsetWidth, icon.offsetHeight);
            icon.style.left = next.x + 'px';
            icon.style.top = next.y + 'px';
          }
        });

        function endDrag(e) {
          if (active !== icon) return;
          icon.classList.remove('icon--dragging');
          try { icon.releasePointerCapture(e.pointerId); } catch (_) {}
          if (moved) {
            saved[icon.getAttribute('data-icon-id')] = {
              x: parseFloat(icon.style.left) || 0,
              y: parseFloat(icon.style.top) || 0
            };
            persist();
          }
          active = null;
        }
        icon.addEventListener('pointerup', endDrag);
        icon.addEventListener('pointercancel', endDrag);

        // If a drag occurred, suppress the click so we don't navigate
        icon.addEventListener('click', function (e) {
          if (moved) {
            e.preventDefault();
            e.stopPropagation();
            moved = false;
          }
        });

        // Stop the browser's native drag image
        icon.addEventListener('dragstart', function (e) { e.preventDefault(); });
      });

      // Reset desktop: clear saved positions and reload
      document.addEventListener('click', function (e) {
        var t = e.target;
        while (t && t !== document.body) {
          if (t.getAttribute && t.getAttribute('data-action') === 'reset-desktop') {
            e.preventDefault();
            try { localStorage.removeItem(KEY); } catch (_) {}
            location.reload();
            return;
          }
          t = t.parentNode;
        }
      });

      // Re-constrain on resize so icons don't get stranded offscreen
      var resizeTimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          for (var i = 0; i < icons.length; i++) {
            var icon = icons[i];
            var x = parseFloat(icon.style.left) || 0;
            var y = parseFloat(icon.style.top) || 0;
            var next = constrain(x, y, icon.offsetWidth, icon.offsetHeight);
            icon.style.left = next.x + 'px';
            icon.style.top = next.y + 'px';
          }
        }, 150);
      });
    })();
  <\/script> `])), renderComponent($$result2, "HalftoneWallpaper", $$HalftoneWallpaper, {}), maybeRenderHead(), renderComponent($$result2, "MenuBar", $$MenuBar, { "status": menubarStatus }), leftIcons.filter((i) => desktopVisibility[i.id] !== false).map((icon) => renderTemplate`${renderComponent($$result2, "DesktopIcon", $$DesktopIcon, { "id": icon.id, "href": icon.href, "label": icon.label, "ext": icon.ext, "variant": icon.variant })}`), renderTemplate`<div class="portrait-photo"> <div class="portrait-photo__fallback">${renderComponent($$result2, "PortraitHalftone", $$PortraitHalftone, {})}</div> <img class="portrait-photo__img"${addAttribute(PORTRAIT_OPEN, "src")}${addAttribute(PORTRAIT_ALT, "alt")} onerror="this.style.display='none'"> ${renderTemplate`<img class="portrait-photo__img portrait-photo__img--blink"${addAttribute(PORTRAIT_CLOSED, "src")} alt="" aria-hidden="true" id="portrait-blink" onerror="this.style.display='none'">`} </div>` , rightIcons.filter((i) => desktopVisibility[i.id] !== false).map((icon) => renderTemplate`${renderComponent($$result2, "DesktopIcon", $$DesktopIcon, { "id": icon.id, "href": icon.href, "label": icon.label, "ext": icon.ext, "variant": icon.variant, "external": icon.external, "download": icon.download })}`), renderComponent($$result2, "Dock", $$Dock, { "visibility": dockVisibility })) })}`;
}, "/Users/porterfairbourne/Porter Portfolio Website/src/pages/index.astro", void 0);

const $$file = "/Users/porterfairbourne/Porter Portfolio Website/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Drz7czXI.mjs';
import { manifest } from './manifest_DeUHiDiE.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about.astro.mjs');
const _page3 = () => import('./pages/agents.astro.mjs');
const _page4 = () => import('./pages/api/admin/login.astro.mjs');
const _page5 = () => import('./pages/api/admin/logout.astro.mjs');
const _page6 = () => import('./pages/api/admin/menubar-status.astro.mjs');
const _page7 = () => import('./pages/api/admin/visibility.astro.mjs');
const _page8 = () => import('./pages/api/notepad.astro.mjs');
const _page9 = () => import('./pages/books.astro.mjs');
const _page10 = () => import('./pages/calendar.astro.mjs');
const _page11 = () => import('./pages/fun.astro.mjs');
const _page12 = () => import('./pages/music.astro.mjs');
const _page13 = () => import('./pages/notepad.astro.mjs');
const _page14 = () => import('./pages/now.astro.mjs');
const _page15 = () => import('./pages/photos.astro.mjs');
const _page16 = () => import('./pages/projects.astro.mjs');
const _page17 = () => import('./pages/projects/_---slug_.astro.mjs');
const _page18 = () => import('./pages/resume.astro.mjs');
const _page19 = () => import('./pages/settings/login.astro.mjs');
const _page20 = () => import('./pages/settings/menubar.astro.mjs');
const _page21 = () => import('./pages/settings/visibility.astro.mjs');
const _page22 = () => import('./pages/settings.astro.mjs');
const _page23 = () => import('./pages/style-guide.astro.mjs');
const _page24 = () => import('./pages/writing.astro.mjs');
const _page25 = () => import('./pages/writing/_---slug_.astro.mjs');
const _page26 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/about.astro", _page2],
    ["src/pages/agents/index.astro", _page3],
    ["src/pages/api/admin/login.ts", _page4],
    ["src/pages/api/admin/logout.ts", _page5],
    ["src/pages/api/admin/menubar-status.ts", _page6],
    ["src/pages/api/admin/visibility.ts", _page7],
    ["src/pages/api/notepad.ts", _page8],
    ["src/pages/books.astro", _page9],
    ["src/pages/calendar.astro", _page10],
    ["src/pages/fun.astro", _page11],
    ["src/pages/music.astro", _page12],
    ["src/pages/notepad.astro", _page13],
    ["src/pages/now.astro", _page14],
    ["src/pages/photos.astro", _page15],
    ["src/pages/projects/index.astro", _page16],
    ["src/pages/projects/[...slug].astro", _page17],
    ["src/pages/resume.astro", _page18],
    ["src/pages/settings/login.astro", _page19],
    ["src/pages/settings/menubar.astro", _page20],
    ["src/pages/settings/visibility.astro", _page21],
    ["src/pages/settings/index.astro", _page22],
    ["src/pages/style-guide.astro", _page23],
    ["src/pages/writing/index.astro", _page24],
    ["src/pages/writing/[...slug].astro", _page25],
    ["src/pages/index.astro", _page26]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "867e21fd-086e-4f28-95c5-452cfee0f69e",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };

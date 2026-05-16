import { a5 as createComponent, aq as renderTemplate, af as maybeRenderHead } from './astro/server_Cf05cWyX.mjs';
import 'piccolore';
import 'clsx';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$HalftoneWallpaper = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", `<canvas id="halftone-wallpaper" class="halftone-wallpaper" aria-hidden="true"></canvas> <script>
  // \u2014 Halftone wallpaper renderer \u2014
  // Verbatim port of HalftoneWallpaper from halftone-app.jsx (spotlight mode, recommended defaults).
  (function () {
    var CFG = {
      mode: 'spotlight',
      pitch: 18,
      maxR: 5.5,
      minR: 0,
      angleDeg: 0,
      focalX: 0.5,
      focalY: 0.5,
      falloff: 0.55,
      contrast: 1.0,
      color: 'rgba(22, 21, 19, 0.92)'
    };
    var TAU = Math.PI * 2;

    function smoothstep(a, b, x) {
      var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }
    function field(x, y, W, H) {
      var dx = (x / W) - CFG.focalX;
      var dy = (y / H) - CFG.focalY;
      var t = 1 - smoothstep(0, CFG.falloff, Math.hypot(dx, dy));
      return Math.pow(t, 1 / Math.max(0.1, CFG.contrast));
    }
    function draw(canvas) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = CFG.color;

      var ang = (CFG.angleDeg * Math.PI) / 180;
      var cs = Math.cos(ang), sn = Math.sin(ang);
      var cx = W / 2, cy = H / 2;
      var span = Math.hypot(W, H);

      for (var v = -span / 2; v < span / 2; v += CFG.pitch) {
        for (var u = -span / 2; u < span / 2; u += CFG.pitch) {
          var x = cx + u * cs - v * sn;
          var y = cy + u * sn + v * cs;
          if (x < -CFG.maxR || x > W + CFG.maxR || y < -CFG.maxR || y > H + CFG.maxR) continue;
          var t = field(x, y, W, H);
          var r = CFG.minR + (CFG.maxR - CFG.minR) * t;
          if (r < 0.25) continue;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.fill();
        }
      }
    }

    var canvas = document.getElementById('halftone-wallpaper');
    if (!canvas) return;
    var render = function () { draw(canvas); };
    render();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(render).observe(canvas);
    } else {
      window.addEventListener('resize', render);
    }
  })();
<\/script>`])), maybeRenderHead());
}, "/Users/porterfairbourne/Porter Portfolio Website/src/components/HalftoneWallpaper.astro", void 0);

export { $$HalftoneWallpaper as $ };

/**
 * GuideCursor — the guided tour's own "mouse pointer", rendered as a halftone-orange
 * cursor on a dedicated full-viewport overlay canvas (pointer-events: none, sits just
 * above the orb's canvas). The tour drives it to real UI targets so the walkthrough
 * looks like a person clicking through the site rather than pages auto-loading.
 *
 * The arrow silhouette is sampled into an ember dot lattice (same newsprint idiom as
 * the rest of the site). The tip (the click hotspot) is the orb's position origin
 * (0,0) in arrow space, so moveTo(x,y) puts the pointer tip exactly on the target.
 *
 * API (all no-ops gracefully under reduced motion, which places instantly):
 *   place(x,y)      — jump instantly (no animation)
 *   moveTo(x,y)     — eased glide; resolves on arrival
 *   click()         — ring ripple + a quick tip "press" dip; resolves when done
 *   show() / hide()
 *   start() / stop() / destroy() / resize()
 */

interface Pt {
  x: number;
  y: number;
}

const TAU = Math.PI * 2;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (lo: number, hi: number, v: number) => (v < lo ? lo : v > hi ? hi : v);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ember palette — bright tip → deep body, echoing the orb
const TIP: [number, number, number] = [0xf7, 0xa2, 0x3a];
const BODY: [number, number, number] = [0x9a, 0x34, 0x12];
const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export class GuideCursor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private w = 0;
  private h = 0;

  private dots: Pt[] = [];     // arrow lattice in unit space (tip at 0,0, ~1 unit tall)
  private pitchUnit = 0.14;    // dot spacing in unit space → used for dot radius
  private scale = 31;          // arrow height in CSS px

  // tip position
  private x = -100;
  private y = -100;
  private vx = 0;
  private vy = 0;

  private tween: { ax: number; ay: number; bx: number; by: number; t: number; dur: number } | null = null;
  private tweenResolve: (() => void) | null = null;
  private tweenTimer: number | null = null; // real-time fallback so moveTo resolves even if rAF stalls
  private clickT = 99; // seconds since last click (large = inactive)
  private clock = 0;   // ever-advancing time → gentle idle hand-drift so the pointer isn't stiff

  private visible = false;
  private running = false;
  private rafId = 0;
  private last = 0;
  private reduced = false;

  private onResize = () => this.resize();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.buildArrow();
    this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  // ---- setup ----------------------------------------------------------------

  /** Rasterise a classic pointer silhouette and sample it into an even dot lattice. */
  private buildArrow() {
    const pts: number[][] = [
      [0, 0], [0, 15], [4.2, 11.6], [6.6, 17], [9, 16], [6.6, 10.6], [11.4, 10.6],
    ];
    const M = 3;       // px margin so edge dots aren't clipped
    const RES = 4;     // oversample for clean alpha sampling
    const wPx = 14 + M * 2;
    const hPx = 18 + M * 2;
    const c = document.createElement('canvas');
    c.width = wPx * RES;
    c.height = hPx * RES;
    const g = c.getContext('2d')!;
    g.scale(RES, RES);
    g.translate(M, M);
    g.fillStyle = '#000';
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    g.fill();

    const data = g.getImageData(0, 0, wPx * RES, hPx * RES).data;
    const inside = (px: number, py: number) => {
      const ix = Math.round(px * RES);
      const iy = Math.round(py * RES);
      if (ix < 0 || iy < 0 || ix >= wPx * RES || iy >= hPx * RES) return false;
      return data[(iy * (wPx * RES) + ix) * 4 + 3] > 110;
    };

    const norm = 16;          // arrow body ≈ 16px tall → 1 unit
    const pitch = 1.4;        // lattice spacing (px in the silhouette) — dense enough to read solid
    this.pitchUnit = pitch / norm;
    const dots: Pt[] = [];
    for (let py = 0; py <= hPx; py += pitch) {
      for (let px = 0; px <= wPx; px += pitch) {
        if (inside(px, py)) dots.push({ x: (px - M) / norm, y: (py - M) / norm });
      }
    }
    this.dots = dots;
  }

  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // ---- lifecycle ------------------------------------------------------------

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
    this.tween = null;
    this.resolveTween();
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  // ---- control --------------------------------------------------------------

  place(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.tween = null;
    this.resolveTween();
  }

  /** Glide the tip to (x,y). Resolves when it arrives (immediately under reduced motion). */
  moveTo(x: number, y: number): Promise<void> {
    this.visible = true;
    if (this.reduced) {
      this.place(x, y);
      return Promise.resolve();
    }
    this.resolveTween();
    const ax = this.x;
    const ay = this.y;
    const dist = Math.hypot(x - ax, y - ay);
    const dur = clamp(0.32, 0.9, 0.26 + dist / 1600);
    this.tween = { ax, ay, bx: x, by: y, t: 0, dur };
    return new Promise((res) => {
      this.tweenResolve = res;
      // if rAF is throttled (backgrounded tab), the tween can't complete — resolve in
      // real time anyway so a caller awaiting the glide never hangs.
      this.tweenTimer = window.setTimeout(() => this.resolveTween(), Math.round(dur * 1000) + 500);
    });
  }

  /** Ring ripple + a quick press dip at the current spot. Resolves after the press. */
  click(): Promise<void> {
    this.clickT = 0;
    return new Promise((res) => setTimeout(res, this.reduced ? 0 : 260));
  }

  private resolveTween() {
    if (this.tweenTimer !== null) { clearTimeout(this.tweenTimer); this.tweenTimer = null; }
    const r = this.tweenResolve;
    this.tweenResolve = null;
    if (r) r();
  }

  // ---- frame ----------------------------------------------------------------

  private tick = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.draw();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private update(dt: number) {
    this.clock += dt;
    if (this.tween) {
      const f = this.tween;
      f.t += dt;
      const p = clamp01(f.t / f.dur);
      const e = easeInOut(p);
      const nx = f.ax + (f.bx - f.ax) * e;
      const ny = f.ay + (f.by - f.ay) * e;
      this.vx = nx - this.x;
      this.vy = ny - this.y;
      this.x = nx;
      this.y = ny;
      if (p >= 1) {
        this.tween = null;
        this.resolveTween();
      }
    } else {
      this.vx *= 0.6;
      this.vy *= 0.6;
    }

    if (this.clickT < 1) this.clickT += dt;
  }

  private draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    if (!this.visible) return;

    // gentle idle hand-drift so a resting pointer is never perfectly stiff (skip while
    // gliding — the tween carries it then — and under reduced motion)
    const idle = !this.tween && !this.reduced;
    const driftX = idle ? Math.sin(this.clock * 1.5) * 3 + Math.sin(this.clock * 0.8 + 1) * 1.6 : 0;
    const driftY = idle ? Math.cos(this.clock * 1.2) * 2.6 + Math.sin(this.clock * 0.55) * 1.4 : 0;
    const tipX = this.x + driftX;
    const tipY = this.y + driftY;

    // click ripple (ring expanding from the tip)
    if (this.clickT < 0.5) {
      const rp = this.clickT / 0.5;
      ctx.globalAlpha = (1 - rp) * 0.55;
      ctx.strokeStyle = 'rgb(180,83,9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tipX, tipY, this.scale * 0.25 + rp * this.scale * 1.25, 0, TAU);
      ctx.stroke();
    }

    // a quick "press" dip on click
    const bump = this.clickT < 0.22 ? Math.sin((this.clickT / 0.22) * Math.PI) : 0;
    const s = this.scale * (1 - 0.16 * bump);
    const dotR = this.pitchUnit * s * 0.62;

    ctx.globalAlpha = 1;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    for (const d of this.dots) {
      const [r, gg, b] = mix(TIP, BODY, clamp01(d.y)); // bright tip → deep body
      ctx.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
      ctx.beginPath();
      ctx.arc(tipX + d.x * s, tipY + d.y * s, dotR, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

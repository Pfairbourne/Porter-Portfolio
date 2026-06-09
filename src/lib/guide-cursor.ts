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
// Minimum-jerk profile — the classic model of how a human hand actually moves a mouse:
// smooth acceleration, a fast cruise, and a long soft landing with zero end-velocity.
// Reads far more organic than a symmetric cubic ease.
const minJerk = (t: number) => t * t * t * (10 - 15 * t + 6 * t * t);

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

  // Line glides travel a shallow quadratic arc (cx,cy is the bezier control point) — humans
  // never move a mouse in a perfectly straight line. Orbits are continuous parametric
  // circles/ellipses (angle a0→a1) so a traced loop never decelerates at compass points.
  private tween: { ax: number; ay: number; bx: number; by: number; cx: number; cy: number; t: number; dur: number; linear?: boolean } | null = null;
  private orbit: { cx: number; cy: number; rx: number; ry: number; a0: number; a1: number; t: number; dur: number; wobble: number; phase: number } | null = null;
  private tweenResolve: (() => void) | null = null;
  private tweenTimer: number | null = null; // real-time fallback so moveTo resolves even if rAF stalls
  private clickT = 99; // seconds since last click (large = inactive)
  private clock = 0;   // ever-advancing time → gentle idle hand-drift so the pointer isn't stiff

  private visible = false;
  private alpha = 0;        // fade level actually painted this frame
  private targetAlpha = 0;  // where the fade is heading (show → 1, fadeOut → 0)
  private running = false;
  private paused = false;
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
    if (this.paused) return;   // frozen mid-gesture: only resume() may restart the loop
    this.running = true;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  /** Freeze the cursor exactly where it is — including mid-glide. The in-flight tween
   *  (if any) keeps its progress and its awaiting promise stays pending, so the caller
   *  blocked on moveTo()/glide() resumes from the same spot. The last frame stays painted
   *  on the canvas since the rAF loop (the only thing that clears+redraws) is stopped. */
  pause() {
    if (this.paused) return;
    this.paused = true;
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    // hold the real-time fallback so a frozen glide's promise can't resolve early
    if (this.tweenTimer !== null) { clearTimeout(this.tweenTimer); this.tweenTimer = null; }
  }

  /** Un-freeze from pause(): re-arm the fallback for the remainder of any frozen glide or
   *  orbit, reset the dt anchor so the first frame isn't a huge jump, and restart the loop. */
  resume() {
    if (!this.paused) return;
    this.paused = false;
    const active = this.tween ?? this.orbit;
    if (active && this.tweenResolve && this.tweenTimer === null) {
      const remainMs = Math.max(0, Math.round((active.dur - active.t) * 1000) + 500);
      this.tweenTimer = window.setTimeout(() => this.resolveTween(), remainMs);
    }
    if (!this.running) {
      this.running = true;
      this.last = performance.now();
      this.rafId = requestAnimationFrame(this.tick);
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  /** Fade the pointer in (if the loop is running; instant under reduced motion). */
  show() {
    this.visible = true;
    this.targetAlpha = 1;
    if (this.reduced || !this.running) this.alpha = 1;
  }

  /** Hard hide — instant clear, used on teardown. For a graceful exit use fadeOut(). */
  hide() {
    this.visible = false;
    this.alpha = 0;
    this.targetAlpha = 0;
    this.tween = null;
    this.orbit = null;
    this.resolveTween();
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  /** Dissolve the pointer in place — the "I have nothing to point at right now" exit.
   *  The draw loop fades alpha down and stops painting; position is kept so a later
   *  show() can either resume here or re-enter from a fresh approach point. */
  fadeOut() {
    if (!this.visible) return;
    this.targetAlpha = 0;
    if (this.reduced || !this.running) { this.alpha = 0; this.visible = false; this.ctx.clearRect(0, 0, this.w, this.h); }
  }

  /** True when the pointer is invisible (fully faded or hidden) — callers use this to
   *  re-enter from a sensible approach point instead of swooping from a stale spot. */
  isFaded(): boolean {
    return !this.visible || this.alpha < 0.05;
  }

  /** If the pointer is currently invisible, relocate it just below-right of (x,y) so the
   *  next gesture materializes beside its subject rather than arcing in from across the
   *  screen. No-op while visible — a visible pointer should travel honestly. */
  private reenterNear(x: number, y: number) {
    if (!this.isFaded()) return;
    this.x = x + 70;
    this.y = y + 110;
    this.vx = 0;
    this.vy = 0;
  }

  // ---- control --------------------------------------------------------------

  place(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.tween = null;
    this.orbit = null;
    this.resolveTween();
  }

  /** Glide the tip to (x,y) along a shallow arc with a minimum-jerk velocity profile.
   *  Resolves when it arrives (immediately under reduced motion). */
  moveTo(x: number, y: number): Promise<void> {
    this.show();
    if (this.reduced) {
      this.place(x, y);
      return Promise.resolve();
    }
    this.resolveTween();
    this.orbit = null;
    const ax = this.x;
    const ay = this.y;
    const dist = Math.hypot(x - ax, y - ay);
    const dur = clamp(0.34, 1.05, 0.27 + dist / 1500);
    // Bow the path perpendicular to the travel line — every glide gets its own slight,
    // randomly-sided arc (capped so short hops stay near-straight and long ones don't loop).
    const bow = dist < 48 ? 0 : Math.min(90, dist * (0.07 + Math.random() * 0.08)) * (Math.random() < 0.5 ? -1 : 1);
    const nx = dist > 0 ? -(y - ay) / dist : 0;
    const ny = dist > 0 ? (x - ax) / dist : 0;
    this.tween = { ax, ay, bx: x, by: y, cx: (ax + x) / 2 + nx * bow, cy: (ay + y) / 2 + ny * bow, t: 0, dur };
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

  /** One continuous parametric orbit (ellipse) — no waypoint deceleration, with a tiny
   *  radius wobble so the loop reads hand-drawn rather than compass-perfect. */
  private runOrbit(cx: number, cy: number, rx: number, ry: number, loops: number): Promise<void> {
    this.resolveTween();
    this.tween = null;
    const a0 = -Math.PI / 2;                              // start at 12 o'clock
    const a1 = a0 + TAU * loops;
    const circumference = Math.PI * (rx + ry) * loops;    // close enough for pacing
    const dur = clamp(1.1, 2.4 * loops + 0.4, circumference / 430);
    this.orbit = { cx, cy, rx, ry, a0, a1, t: 0, dur, wobble: 0.04, phase: Math.random() * TAU };
    return new Promise((res) => {
      this.tweenResolve = res;
      this.tweenTimer = window.setTimeout(() => this.resolveTween(), Math.round(dur * 1000) + 500);
    });
  }

  /** Trace a circle around (cx,cy) at the given radius. `loops` repeats the trip. */
  async traceLoop(cx: number, cy: number, radius: number, loops = 1): Promise<void> {
    if (this.reduced) { this.show(); this.place(cx, cy); return; }
    this.reenterNear(cx, cy - radius);
    this.show();
    await this.moveTo(cx, cy - radius);                   // arc into the rim first
    await this.runOrbit(cx, cy, radius, radius, loops);
    await this.moveTo(cx, cy);                            // settle on the subject
  }

  /** Sweep horizontally past (cx,cy) — a quick "look here, and here" gesture. */
  async traceSideToSide(cx: number, cy: number, amplitude: number, count = 2): Promise<void> {
    this.show();
    if (this.reduced) { this.place(cx, cy); return; }
    for (let i = 0; i < count; i++) {
      await this.moveTo(cx + amplitude, cy);
      await this.moveTo(cx - amplitude, cy);
    }
    await this.moveTo(cx, cy);
  }

  /** Glide to (x,y) at a constant velocity in CSS px/sec (not eased). Used to chain
   *  waypoints together in a `glide` so the path doesn't slow at each one. */
  linearMoveTo(x: number, y: number, pxPerSec = 700): Promise<void> {
    this.show();
    if (this.reduced) { this.place(x, y); return Promise.resolve(); }
    this.resolveTween();
    this.orbit = null;
    const ax = this.x;
    const ay = this.y;
    const dist = Math.hypot(x - ax, y - ay);
    const dur = clamp(0.1, 1.6, dist / Math.max(60, pxPerSec));
    this.tween = { ax, ay, bx: x, by: y, cx: (ax + x) / 2, cy: (ay + y) / 2, t: 0, dur, linear: true };
    return new Promise((res) => {
      this.tweenResolve = res;
      this.tweenTimer = window.setTimeout(() => this.resolveTween(), Math.round(dur * 1000) + 500);
    });
  }

  /** Flowing multi-waypoint path. Eased entry to the first point, then constant velocity
   *  through the rest so there's no slowdown at each waypoint. Empty array is a no-op. */
  async glide(points: Pt[], pxPerSec = 700): Promise<void> {
    if (points.length === 0) return;
    this.reenterNear(points[0].x, points[0].y);
    this.show();
    await this.moveTo(points[0].x, points[0].y);   // eased entry to the path start
    for (let i = 1; i < points.length; i++) {
      await this.linearMoveTo(points[i].x, points[i].y, pxPerSec);
    }
  }

  /** A wide clockwise oval through four anchor points (top, right, bottom, left). Now a
   *  single continuous ellipse orbit — one flowing loop that frames the subject without
   *  pausing at any anchor. */
  async oval(top: Pt, right: Pt, bottom: Pt, left: Pt, _pxPerSec = 700): Promise<void> {
    this.reenterNear(top.x, top.y);
    this.show();
    const cx = (left.x + right.x) / 2;
    const cy = (top.y + bottom.y) / 2;
    const rx = Math.max(24, (right.x - left.x) / 2);
    const ry = Math.max(18, (bottom.y - top.y) / 2);
    if (this.reduced) { this.place(cx, cy); return; }
    await this.moveTo(top.x, top.y);               // arc onto the rim
    await this.runOrbit(cx, cy, rx, ry, 1);
  }

  /** Slow left-to-right underline sweep — drawn as a slightly wavering polyline so it
   *  reads as a hand-drawn highlight rather than a laser-straight rule. */
  async underline(start: Pt, end: Pt, pxPerSec = 250): Promise<void> {
    this.reenterNear(start.x, start.y);
    await this.moveTo(start.x, start.y);
    if (this.reduced) { this.place(end.x, end.y); return; }
    const segs = 6;
    for (let i = 1; i <= segs; i++) {
      const f = i / segs;
      const wob = i === segs ? 0 : Math.sin(f * Math.PI * 2.2) * 1.6;
      await this.linearMoveTo(start.x + (end.x - start.x) * f, start.y + (end.y - start.y) * f + wob, pxPerSec);
    }
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
    // fade toward the target alpha (~5 frames to materialize, ~8 to dissolve)
    const fadeRate = this.targetAlpha > this.alpha ? 7.5 : 4.5;
    this.alpha += (this.targetAlpha - this.alpha) * Math.min(1, fadeRate * dt);
    if (this.targetAlpha === 0 && this.alpha < 0.02) { this.alpha = 0; this.visible = false; }

    if (this.tween) {
      const f = this.tween;
      f.t += dt;
      const p = clamp01(f.t / f.dur);
      const e = f.linear ? p : minJerk(p);
      // quadratic bezier through the control point — a shallow, hand-like arc
      const u = 1 - e;
      const nx = u * u * f.ax + 2 * u * e * f.cx + e * e * f.bx;
      const ny = u * u * f.ay + 2 * u * e * f.cy + e * e * f.by;
      this.vx = nx - this.x;
      this.vy = ny - this.y;
      this.x = nx;
      this.y = ny;
      if (p >= 1) {
        this.tween = null;
        this.resolveTween();
      }
    } else if (this.orbit) {
      const o = this.orbit;
      o.t += dt;
      const p = clamp01(o.t / o.dur);
      const a = o.a0 + (o.a1 - o.a0) * minJerk(p);
      // tiny radius wobble → hand-drawn loop, not a compass arc
      const w = 1 + Math.sin(a * 2.7 + o.phase) * o.wobble;
      const nx = o.cx + Math.cos(a) * o.rx * w;
      const ny = o.cy + Math.sin(a) * o.ry * w;
      this.vx = nx - this.x;
      this.vy = ny - this.y;
      this.x = nx;
      this.y = ny;
      if (p >= 1) {
        this.orbit = null;
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
    if (!this.visible || this.alpha <= 0.01) return;

    // gentle idle hand-drift so a resting pointer is never perfectly stiff (skip while
    // gliding/orbiting — the animation carries it then — and under reduced motion)
    const idle = !this.tween && !this.orbit && !this.reduced;
    const driftX = idle ? Math.sin(this.clock * 1.5) * 3 + Math.sin(this.clock * 0.8 + 1) * 1.6 : 0;
    const driftY = idle ? Math.cos(this.clock * 1.2) * 2.6 + Math.sin(this.clock * 0.55) * 1.4 : 0;
    const tipX = this.x + driftX;
    const tipY = this.y + driftY;

    // click ripple (ring expanding from the tip)
    if (this.clickT < 0.5) {
      const rp = this.clickT / 0.5;
      ctx.globalAlpha = (1 - rp) * 0.55 * this.alpha;
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

    ctx.globalAlpha = this.alpha;
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

/**
 * GuideOrb — the voice guide rendered as an animated halftone particle sphere.
 *
 * On-theme with the rest of the site (newsprint dots; see src/lib/halftone.ts):
 * a Fibonacci-distributed cloud of dots forms a shaded sphere, tinted with the
 * orb's ember palette (#f7a23a → --accent → #7c3905). Drawn on ONE full-viewport
 * overlay canvas (pointer-events: none), so the same orb can park top-right, fly
 * across the screen, dock into the panel header, and shoot out to point at things.
 *
 * Animated states (setState):
 *   idle      — slow tumble + gentle bob
 *   talking   — amplitude-driven squash/stretch + brightness pulse
 *   listening — calm breathing + outward sonar ring pulses
 *   thinking  — faster tumble + swirl + three orbiting "thought" satellites
 *   pointing  — particles morph into a pointing hand, aimed at a target, with a tap
 *
 * Motion (position) is independent of state:
 *   setTracker(fn) — spring toward an anchor each frame (dormant button / panel avatar)
 *   swooshTo(x,y,r)— a dramatic arc flight with a comet streak ("fly across screen")
 *   pointAt(x,y)   — fly beside a target, morph to the hand, point, then revert
 *
 * Self-contained, client-only (touches canvas/document only when methods run),
 * DPR- and resize-aware, and degrades to a near-static sphere under reduced motion.
 */

export type OrbState = 'idle' | 'talking' | 'listening' | 'thinking' | 'pointing';

interface Anchor {
  x: number;
  y: number;
  r: number;
}

interface Particle {
  // base unit-sphere coordinates (radius 1), pre-rotation
  bx: number;
  by: number;
  bz: number;
  // pointing-hand target in unit space (finger toward +x), assigned once
  hx: number;
  hy: number;
  seed: number; // phase offset for shimmer
  spikeAmp: number; // how far this dot juts out as a talking spine (0..1)
  spikePhase: number; // phase offset so spines extend/retract out of sync
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// Hard ceiling on talking spine length (fraction of radius the tip can exceed the
// surface). The spikes saturate toward this, so the corona stays contained even at
// full volume — the longest tip reaches ~1.32× the radius, never more.
const SPIKE_CAP = 0.32;

// Ember palette echoing the original orb gradient (radial #f7a23a → --accent → #7c3905).
const HI: [number, number, number] = [0xf7, 0xa2, 0x3a]; // lit highlight
const MID: [number, number, number] = [0xb4, 0x53, 0x09]; // --accent
const LO: [number, number, number] = [0x7c, 0x39, 0x05]; // deep shadow

// Light direction (upper-left, slightly toward the viewer) — matches the old
// highlight at ~32% 28%.
const LX = -0.45;
const LY = -0.62;
const LZ = 0.64;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** shade 0 (shadow) → 1 (lit) mapped through the three ember stops. */
function shadeColor(shade: number): [number, number, number] {
  return shade < 0.5 ? mix(LO, MID, shade * 2) : mix(MID, HI, (shade - 0.5) * 2);
}

export class GuideOrb {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private w = 0;
  private h = 0;

  private particles: Particle[] = [];
  private readonly N = 320;

  // position / size (CSS px, viewport coords)
  private x = 0;
  private y = 0;
  private r = 16;
  private vx = 0;
  private vy = 0;

  // dramatic flight (arc tween) — owns position while active
  private flight: { ax: number; ay: number; bx: number; by: number; br: number; cx: number; cy: number; t: number; dur: number } | null = null;

  private tracker: (() => Anchor) | null = null;
  // while pointing, spring to this fixed spot instead of the tracker (so the orb
  // stays out at the target until it reverts, rather than drifting back home)
  private hold: Anchor | null = null;

  // state
  private baseState: OrbState = 'idle';
  private state: OrbState = 'idle';
  private amp = 0; // 0..1 talking amplitude (smoothed externally is fine)
  private ampCur = 0;
  private morph = 0; // 0 = sphere, 1 = hand (eased toward morphTarget)
  private morphTarget = 0;
  private aim = 0; // hand aim angle (radians)
  private tapPhase = 0;

  // rotation
  private yaw = 0;
  private pitch = 0;

  // listening sonar rings
  private rings: { t: number }[] = [];
  private ringClock = 0;

  // pointing auto-revert
  private pointTimer: number | null = null;

  private shown = true;
  private running = false;
  private rafId = 0;
  private last = 0;
  private lastDraw = 0;
  private speedSmooth = 0; // low-passed travel speed → drives a smooth shrink while moving
  private reduced = false;

  private onResize = () => this.resize();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.buildParticles();
    this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  // ---- setup ----------------------------------------------------------------

  private buildParticles() {
    const hand = this.sampleHand(this.N);
    const ps: Particle[] = [];
    for (let i = 0; i < this.N; i++) {
      const y = 1 - ((i + 0.5) / this.N) * 2; // 1 → -1
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * GOLDEN_ANGLE;
      ps.push({
        bx: Math.cos(th) * rad,
        by: y,
        bz: Math.sin(th) * rad,
        hx: 0,
        hy: 0,
        seed: Math.random() * Math.PI * 2,
        spikeAmp: 0.35 + Math.random() * 0.65,
        spikePhase: Math.random() * Math.PI * 2,
      });
    }
    // Pair sphere dots to hand dots by angle so the morph "gathers" cleanly
    // rather than tangling across the cloud.
    const order = ps.map((_, i) => i).sort((a, b) => Math.atan2(ps[a].by, ps[a].bx) - Math.atan2(ps[b].by, ps[b].bx));
    hand.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));
    for (let k = 0; k < order.length; k++) {
      const p = ps[order[k]];
      const hpt = hand[k % hand.length];
      p.hx = hpt.x;
      p.hy = hpt.y;
    }
    this.particles = ps;
  }

  /**
   * Sample N interior points of a pointing-hand silhouette (index finger toward
   * +x) by rasterising primitive shapes to an offscreen canvas and reading alpha
   * — the same technique the desktop glyphs use (halftone-raster.ts). Returned
   * points are centred on the silhouette and scaled so radius ≈ 1.
   */
  private sampleHand(n: number): { x: number; y: number }[] {
    const S = 120;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const g = c.getContext('2d')!;
    g.fillStyle = '#000';
    const fillCircle = (cx: number, cy: number, rr: number) => {
      g.beginPath();
      g.arc(cx, cy, rr, 0, Math.PI * 2);
      g.fill();
    };
    const roundRect = (x: number, y: number, w: number, hh: number, rr: number) => {
      g.beginPath();
      g.moveTo(x + rr, y);
      g.arcTo(x + w, y, x + w, y + hh, rr);
      g.arcTo(x + w, y + hh, x, y + hh, rr);
      g.arcTo(x, y + hh, x, y, rr);
      g.arcTo(x, y, x + w, y, rr);
      g.fill();
    };
    // compact fist
    fillCircle(46, 66, 23);
    fillCircle(44, 82, 15);
    // thumb (upper-left of the fist)
    fillCircle(32, 54, 9);
    // folded knuckles along the top of the fist
    fillCircle(57, 60, 7);
    fillCircle(60, 53, 7);
    // long extended index finger pointing right (+x)
    roundRect(54, 52, 64, 15, 7);

    const data = g.getImageData(0, 0, S, S).data;
    const finger: { x: number; y: number }[] = [];
    const rest: { x: number; y: number }[] = [];
    for (let py = 0; py < S; py++) {
      for (let px = 0; px < S; px++) {
        if (data[(py * S + px) * 4 + 3] <= 20) continue;
        // the slice of finger that extends past the fist → its own pool
        if (px >= 62 && py >= 49 && py <= 70) finger.push({ x: px, y: py });
        else rest.push({ x: px, y: py });
      }
    }
    const shuffle = (arr: { x: number; y: number }[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    };
    shuffle(finger);
    shuffle(rest);
    const cx = 60;
    const cy = 62;
    const scale = 40; // finger tip (~118) lands near +1.45
    const nFinger = Math.round(n * 0.42); // bias particles into the thin finger so it reads
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const src = i < nFinger && finger.length ? finger : rest.length ? rest : finger;
      const pt = src[i % src.length];
      out.push({ x: (pt.x - cx) / scale, y: (pt.y - cy) / scale });
    }
    return out;
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

  // ---- public API -----------------------------------------------------------

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
    this.shown = true;
  }

  hide() {
    this.shown = false;
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  /** Place instantly (no animation) — for the first paint at the dormant anchor. */
  place(a: Anchor) {
    this.x = a.x;
    this.y = a.y;
    this.r = a.r;
    this.vx = 0;
    this.vy = 0;
    this.flight = null;
    this.hold = null;
    this.speedSmooth = 0;  // no leftover shrink across the jump
  }

  /** Cancel any in-progress pointing and return to the base state + tracker. */
  release() {
    if (this.pointTimer !== null) {
      clearTimeout(this.pointTimer);
      this.pointTimer = null;
    }
    this.hold = null;
    this.morphTarget = 0;
    this.state = this.baseState;
  }

  /** Spring-follow this anchor every frame (dormant button, or the panel avatar). */
  setTracker(fn: (() => Anchor) | null) {
    this.tracker = fn;
  }

  /** Dramatic arc flight to a point, with a comet streak. Resumes tracking after. */
  swooshTo(a: Anchor) {
    this.hold = null; // an explicit flight overrides any pointing hold
    if (this.reduced) {
      this.place(a);
      return;
    }
    const ax = this.x;
    const ay = this.y;
    const dist = Math.hypot(a.x - ax, a.y - ay);
    // control point bowed perpendicular to the travel line → an arc, not a chord
    const mx = (ax + a.x) / 2;
    const my = (ay + a.y) / 2;
    const nx = -(a.y - ay) / (dist || 1);
    const ny = (a.x - ax) / (dist || 1);
    const bow = Math.min(220, dist * 0.32);
    this.flight = {
      ax,
      ay,
      bx: a.x,
      by: a.y,
      br: a.r,
      cx: mx + nx * bow,
      cy: my + ny * bow,
      t: 0,
      dur: Math.max(0.42, Math.min(0.95, dist / 1000)), // seconds (f.t accumulates dt in seconds)
    };
  }

  /** Fly beside (tx,ty), morph into a pointing hand aimed at it, tap, then revert. */
  pointAt(tx: number, ty: number, ms = 2200) {
    if (this.reduced) return;
    if (this.pointTimer !== null) {
      clearTimeout(this.pointTimer);
      this.pointTimer = null;
    }
    this.state = 'pointing';
    this.morphTarget = 1;
    // approach point: up-and-left of the target so the finger reaches in
    const approach: Anchor = { x: tx - 78, y: ty - 64, r: Math.max(this.r, 22) };
    this.aim = Math.atan2(ty - approach.y, tx - approach.x);
    this.swooshTo(approach);
    this.hold = approach; // stay out at the target until we revert (don't drift home)
    this.pointTimer = window.setTimeout(() => {
      this.pointTimer = null;
      this.morphTarget = 0;
      this.state = this.baseState;
      if (this.tracker) this.swooshTo(this.tracker());
    }, ms);
  }

  setState(s: OrbState) {
    this.baseState = s;
    if (this.state !== 'pointing') this.state = s;
    if (s === 'listening') this.ringClock = 0; // start a fresh sonar cadence
  }

  setAmplitude(v: number) {
    this.amp = clamp01(v);
  }

  // ---- frame ----------------------------------------------------------------

  private tick = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt, now / 1000);
    if (this.shown) {
      // when nothing dynamic is happening (dormant idle), redraw at ~30fps to save battery;
      // anything lively (talking/listening/thinking/pointing, a flight, or trail particles)
      // keeps the full frame rate.
      const calm = !this.flight && this.rings.length === 0 && this.state === 'idle';
      if (!calm || now - this.lastDraw >= 33) {
        this.draw(now / 1000);
        this.lastDraw = now;
      }
    }
    this.rafId = requestAnimationFrame(this.tick);
  };

  private update(dt: number, t: number) {
    this.ampCur += (this.amp - this.ampCur) * 0.4;   // snappier → spines track the voice instead of lagging
    this.morph += (this.morphTarget - this.morph) * Math.min(1, dt * 9);

    // ---- position ----
    if (this.flight) {
      const f = this.flight;
      f.t += dt;
      const p = clamp01(f.t / f.dur);
      const e = easeInOut(p);
      const ix = (1 - e) * (1 - e);
      const mxk = 2 * (1 - e) * e;
      const bxk = e * e;
      const px = ix * f.ax + mxk * f.cx + bxk * f.bx;
      const py = ix * f.ay + mxk * f.cy + bxk * f.by;
      this.vx = px - this.x;
      this.vy = py - this.y;
      this.x = px;
      this.y = py;
      this.r += (f.br - this.r) * Math.min(1, dt * 6);
      if (p >= 1) this.flight = null;
    } else {
      // hold (while pointing) takes precedence over the tracker anchor
      const a = this.hold || (this.tracker ? this.tracker() : null);
      if (a) {
        // critically-damped-ish spring
        this.vx += (a.x - this.x) * 0.085;
        this.vy += (a.y - this.y) * 0.085;
        this.vx *= 0.78;
        this.vy *= 0.78;
        this.x += this.vx;
        this.y += this.vy;
        this.r += (a.r - this.r) * 0.12;
      }
    }

    // ---- rotation / state clocks ----
    if (!this.reduced) {
      let yawSpeed = 0.35; // idle drift
      if (this.state === 'thinking') yawSpeed = 1.7;
      else if (this.state === 'talking') yawSpeed = 0.55;
      else if (this.state === 'pointing') yawSpeed = 0.0;
      this.yaw += yawSpeed * dt;
      this.pitch = Math.sin(t * 0.5) * 0.22 + (this.state === 'thinking' ? Math.sin(t * 2.1) * 0.12 : 0);
    }

    // listening sonar
    if (this.state === 'listening' && !this.reduced) {
      this.ringClock += dt;
      if (this.ringClock >= 1.7) {
        this.ringClock = 0;
        this.rings.push({ t: 0 });
      }
    }
    for (const ring of this.rings) ring.t += dt;
    this.rings = this.rings.filter((ring) => ring.t < 1.1);

    // travel speed (low-passed) → drives the smooth shrink-while-moving in draw()
    const speed = Math.hypot(this.vx, this.vy);
    this.speedSmooth += (speed - this.speedSmooth) * Math.min(1, dt * 8); // dt-aware → frame-rate independent

    if (this.state === 'pointing') this.tapPhase += dt * 6;
  }

  private draw(t: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);

    // idle bob + listening breathe
    const bob = this.reduced ? 0 : Math.sin(t * 1.6) * (this.state === 'idle' ? this.r * 0.06 : this.r * 0.03);
    const breathe = this.state === 'listening' && !this.reduced ? 1 + Math.sin(t * 2.2) * 0.04 : 1;
    const amp = this.reduced ? 0 : this.ampCur;
    // Talking: the dimensional motion is in the spines (drawn per-particle below) —
    // dots jut out radially along their normal and retract with the voice. The body
    // keeps only a subtle breathe + twist so the spines, not pure scaling, carry it.
    // Gate on amplitude, not just the discrete state, so the orb still bristles while
    // it is mid-point gesture during the tour (setState can't flip to 'talking' then).
    const talking = !this.reduced && (this.state === 'talking' || amp > 0.06);
    const expand = talking ? 0.97 + amp * 0.12 : 1;
    const twist = talking ? amp * 0.14 : 0;
    const ct = Math.cos(twist);
    const st = Math.sin(twist);
    const pulse = 1 + (talking ? amp * 0.08 : 0);

    // shrink in on itself while travelling: faster motion → smaller radius, smoothly
    // (speedSmooth is low-passed in update, so this never jitters). Settles back at rest.
    const moveShrink = clamp01(this.speedSmooth / 16);
    const moveScale = this.reduced ? 1 : 1 - moveShrink * 0.4;

    const cx0 = this.x;
    const cy0 = this.y + bob;
    const R = this.r * breathe * expand * moveScale;
    const m = this.morph;

    // hand tap: nudge the whole orb toward the aim while pointing
    let tapx = 0;
    let tapy = 0;
    if (this.state === 'pointing' && m > 0.4) {
      const tap = Math.max(0, Math.sin(this.tapPhase)) * this.r * 0.5 * m;
      tapx = Math.cos(this.aim) * tap;
      tapy = Math.sin(this.aim) * tap;
    }

    const dotBase = this.r * 0.06;
    const cosA = Math.cos(this.aim);
    const sinA = Math.sin(this.aim);

    ctx.lineCap = 'round';

    // sonar rings (listening)
    for (const ring of this.rings) {
      const rp = ring.t / 1.1;
      const rr = R * (1 + rp * 1.5);
      ctx.globalAlpha = (1 - rp) * 0.4;
      ctx.strokeStyle = 'rgba(180,83,9,1)';
      ctx.lineWidth = Math.max(1, this.r * 0.06);
      ctx.beginPath();
      ctx.arc(cx0, cy0, rr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // particles
    for (const p of this.particles) {
      // rotate base sphere
      const x1 = p.bx * cy + p.bz * sy;
      const z1 = -p.bx * sy + p.bz * cy;
      const y1 = p.by;
      const y2 = y1 * cp - z1 * sp;
      const z2 = y1 * sp + z1 * cp;
      const x2 = x1;

      // talking spine: this dot juts out along its own normal and retracts with the
      // voice (each at its own phase), so the surface bristles in three dimensions.
      let spike = 0;
      if (talking) {
        const wob = 0.5 + 0.5 * Math.sin(t * 9 + p.spikePhase);
        const raw = amp * 0.8 * p.spikeAmp * wob;
        spike = SPIKE_CAP * Math.tanh(raw / SPIKE_CAP); // smooth saturation → contained at max volume
      }
      const tip = R * (1 + spike);

      // surface root + spike tip, both twisted (the spine is drawn between them)
      const bx2 = x2 * R;
      const by2 = y2 * R;
      const baseX = cx0 + bx2 * ct - by2 * st;
      const baseY = cy0 + bx2 * st + by2 * ct;
      const tx2 = x2 * tip;
      const ty2 = y2 * tip;
      const sphX = cx0 + tx2 * ct - ty2 * st;
      const sphY = cy0 + tx2 * st + ty2 * ct;

      // hand screen position (rotate authored hand by aim)
      const hxr = p.hx * cosA - p.hy * sinA;
      const hyr = p.hx * sinA + p.hy * cosA;
      const handX = cx0 + tapx + hxr * R * 1.05;
      const handY = cy0 + tapy + hyr * R * 1.05;

      const px = lerp(sphX, handX, m);
      const py = lerp(sphY, handY, m);

      // lambert shade from rotated normal
      const ndotl = clamp01(x2 * LX + y2 * LY + z2 * LZ);
      const shade = m > 0.5 ? lerp(ndotl, 0.62, (m - 0.5) * 2) : ndotl; // hand reads flatter/ember
      const [cr, cg, cb] = shadeColor(shade);

      // halftone: darker → bigger dot; front dots a touch bigger; amp pulse
      const sizeF = lerp(1.3, 0.5, shade);
      const depthF = 0.74 + 0.26 * (z2 * 0.5 + 0.5);
      const shimmer = this.reduced ? 1 : 1 + Math.sin(t * 3 + p.seed) * 0.06;
      const rr = Math.max(0.4, dotBase * sizeF * depthF * pulse * shimmer);

      // back dots fade so the cloud reads volumetric (less so once morphed flat)
      const backFade = 0.34 + 0.66 * (z2 * 0.5 + 0.5);
      const alpha = lerp(backFade, 0.95, m);

      ctx.globalAlpha = alpha;
      if (spike > 0.04 && m < 0.6) {
        // the spine: a tapering ember shaft from the surface out to the tip dot
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = `rgb(${cr | 0},${cg | 0},${cb | 0})`;
        ctx.lineWidth = Math.max(0.8, rr * 0.95);
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.globalAlpha = alpha;
      }
      ctx.fillStyle = `rgb(${cr | 0},${cg | 0},${cb | 0})`;
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, Math.PI * 2);
      ctx.fill();
    }

    // thinking: three orbiting "thought" satellites
    if (this.state === 'thinking' && !this.reduced) {
      for (let k = 0; k < 3; k++) {
        const a = t * 2.4 + (k * Math.PI * 2) / 3;
        const ox = cx0 + Math.cos(a) * R * 1.5;
        const oy = cy0 + Math.sin(a) * R * 0.55 - R * 0.2;
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = 'rgba(180,83,9,1)';
        ctx.beginPath();
        ctx.arc(ox, oy, this.r * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }
}

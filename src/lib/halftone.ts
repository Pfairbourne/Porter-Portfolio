// Halftone math — verbatim port of design_handoff_halftone_desktop/halftone-app.jsx.
// Used at build time by the icon and portrait glyph components, and at runtime
// (via inline script in index.astro) by the wallpaper canvas.

export const TAU = Math.PI * 2;

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export type Field = (x: number, y: number, W: number, H: number) => number;

export interface DotsOpts {
  W: number;
  H: number;
  pitch: number;
  maxR: number;
  minR: number;
  angleDeg: number;
  field: Field;
  /** Minimum radius below which we omit the dot entirely. */
  cutoff?: number;
}

export interface Dot {
  x: number;
  y: number;
  r: number;
}

// Iterate the (rotated) lattice and return per-cell dot coordinates + radii.
export function makeDots(opts: DotsOpts): Dot[] {
  const { W, H, pitch, maxR, minR, angleDeg, field, cutoff = 0.18 } = opts;
  const ang = (angleDeg * Math.PI) / 180;
  const cs = Math.cos(ang);
  const sn = Math.sin(ang);
  const cx = W / 2;
  const cy = H / 2;
  const span = Math.hypot(W, H);
  const out: Dot[] = [];
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

// "Newsprint" preset — heavy ink pool at bottom-left, fading up-right.
// Recommended default for both file and folder glyphs.
export const NEWSPRINT = {
  pitch: 4.6,
  maxR: 2.1,
  minR: 0,
  angleDeg: 0,
  field: ((x, y, W, H) => {
    const t = 1 - y / H;
    const u = 1 - x / W;
    return Math.pow(Math.max(0, 1 - t * 0.7 - u * 0.2), 1.2);
  }) satisfies Field,
};

// Portrait silhouette — head circle + shoulders ellipse + rim shading.
export const PORTRAIT_FIELD: Field = (x, y, W, H) => {
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

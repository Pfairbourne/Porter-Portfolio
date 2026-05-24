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
// Used by file and folder desktop glyphs (FileGlyph / FolderGlyph).
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

// Folder desktop icons — fine print-halftone lattice, rasterised to a PNG
// at runtime (src/lib/halftone-raster.ts) and embedded as one <image> per
// icon. A tight pitch + small dots give a smooth newsprint feel: dark
// (brand) areas overlap (2·brandR > pitch → near-solid), light areas get
// sub-pixel dots so the base pattern recedes into the paper. `blur` softens
// the brand field's edges; `contrast` sharpens the ramp to full density.
export const FOLDER_HALFTONE = {
  pitch: 1.15,
  baseR: 0.18, // sparse sub-pixel dots where brand field = 0
  brandR: 0.74, // dense overlapping dots where brand field = 1
  blur: 0.55, // gaussian blur on the brand field → soft halftone falloff
  contrast: 1.5, // power curve on sampled intensity → faster ramp to full
};

// Desktop FILE icons — coarse vertical-gradient halftone. Wider grid and
// bigger dots than the folder lattice give files a chunky newsprint feel,
// and the dense bottom band reads as the dark label area behind the white
// extension text. Linear top→bottom ramp = the most even transition.
export const FILE_HALFTONE = {
  pitch: 2.8,
  minR: 0.42, // small sparse dots at the top (light)
  maxR: 1.75, // large overlapping dots at the bottom (2·maxR > pitch → solid)
};

// Fine-grain newsprint — same field as NEWSPRINT but with a denser lattice
// and smaller dots. Used by AgentGlyph because agent cards render the icon
// at 56×56 (40×40 on mobile) — at that size the desktop NEWSPRINT dots are
// chunky and the silhouette dominates. NEWSPRINT_FINE keeps the icon
// readable as detail (lines, accents) without the dots clumping together.
//
// Tuning:
//   pitch 2.8 → roughly 2× the dot density of NEWSPRINT
//   maxR  1.15 → ≈40% of pitch, leaves visible paper between dots
//   cutoff stays at the default 0.18 so faint edges drop out cleanly
export const NEWSPRINT_FINE = {
  pitch: 2.8,
  maxR: 1.15,
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

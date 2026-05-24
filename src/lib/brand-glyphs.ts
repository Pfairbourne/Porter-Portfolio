/**
 * Brand glyphs baked into folder desktop icons.
 *
 * Each glyph is authored in the parent 72×72 viewBox space, centered around
 * (36, 40). The halftone raster (src/lib/halftone-raster.ts) composites these
 * layers into a blurred "brand field" — a 0..1 intensity map sampled per
 * lattice point to size each halftone dot. The brand emerges as a denser dot
 * region within the folder's continuous halftone (no hard outline; the lines
 * and pads become bands/clusters of denser dots rather than solid ink).
 *
 * Layer roles (see buildBrandField in halftone-raster.ts):
 *   silhouette    → ADDS ink (filled)        — the dense brand-dot region
 *   accent        → ADDS ink (filled)        — small solid marks (circuit pads)
 *   detail        → ADDS ink (stroked @1.2)  — thin lines (circuit traces)
 *   accentStroke  → ADDS ink (stroked @1.6)  — heavier content lines
 *   holes         → REMOVES ink (filled)     — robot eyes, gear hub
 *   paperCutouts  → REMOVES ink (filled)     — clean paper planes (also drawn
 *                                              as paper paths atop the image)
 *   paperStrokes  → REMOVES ink (stroked @1.4) — gap channels carved into a
 *                                              filled silhouette (cube seams)
 *
 * Each layer is one SVG path string OR an array of `{ d, transform? }` parts.
 */

export type BrandName = 'robot' | 'prototype' | 'toolbox';

/** A single sub-path with an optional SVG transform (e.g. "rotate(45 36 40)"). */
export interface BrandPart {
  d: string;
  transform?: string;
}

/** A layer is either one path string OR an array of parts. */
export type BrandLayer = string | BrandPart[];

export interface BrandSpec {
  silhouette: BrandLayer;
  holes?: BrandLayer;
  paperCutouts?: BrandLayer;
  paperStrokes?: BrandLayer;
  detail?: BrandLayer;
  accent?: BrandLayer;
  accentStroke?: BrandLayer;
}

export const BRAND_GLYPHS: Record<BrandName, BrandSpec> = {
  // ai-agents — boxy robot head: rounded-rect head, two large eye holes
  // (base halftone shows through), antenna nub on top, rectangular ear pods.
  // Eye rings (detail) bake into the field as soft denser bands — crisp eyes
  // without the hard dark discs the old solid-stroke rendering produced.
  robot: {
    silhouette:
      // head 30×26, rounded corners
      'M 24 28 Q 21 28 21 31 L 21 49 Q 21 52 24 52 L 48 52 Q 51 52 51 49 L 51 31 Q 51 28 48 28 Z ' +
      // left ear pod
      'M 18 36 L 21 36 L 21 44 L 18 44 Q 16 44 16 42 L 16 38 Q 16 36 18 36 Z ' +
      // right ear pod
      'M 54 36 L 51 36 L 51 44 L 54 44 Q 56 44 56 42 L 56 38 Q 56 36 54 36 Z ' +
      // antenna nub
      'M 34 25 L 38 25 L 38 28 L 34 28 Z',
    holes:
      'M 30 40 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 ' +
      'M 42 40 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
    detail:
      'M 30 40 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0 ' +
      'M 42 40 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',
  },

  // full-app-prototype — solid isometric Rubik's cube. The silhouette is a
  // filled hexagon; 9 paperStrokes carve the 3 face seams + each face's 2×2
  // subdivision as paper-colored gap channels, so it reads as a 3×3×3 cube.
  prototype: {
    silhouette: 'M 36 24.3 L 49.1 32.1 L 49.1 47.9 L 36 55.8 L 22.9 47.9 L 22.9 32.1 Z',
    paperStrokes:
      // 3 face-boundary spokes from centre C (36,40)
      'M 36 40 L 49.1 32.1 ' +
      'M 36 40 L 22.9 32.1 ' +
      'M 36 40 L 36 55.8 ' +
      // top face — 2×2 subdivision
      'M 42.6 28.2 L 29.4 36.1 ' +
      'M 29.4 28.2 L 42.6 36.1 ' +
      // right face — 2×2 subdivision
      'M 49.1 40 L 36 47.9 ' +
      'M 42.6 36.1 L 42.6 51.8 ' +
      // left face — 2×2 subdivision
      'M 29.4 36.1 L 29.4 51.8 ' +
      'M 22.9 40 L 36 47.9',
  },

  // internal-tools — half gear (left) + circuit board (right). Gear: 8 teeth,
  // centre (36,40), R_out=15.4, R_in=11; left semicircle hub punched as a hole.
  // Circuit: vertical spine + 5 branch traces (detail) ending in 5 pads (accent).
  toolbox: {
    silhouette:
      'M 36 24.6 L 33.4 24.8 L 31.8 29.9 L 29.7 31.0 L 25.1 29.1 L 23.4 31.2 ' +
      'L 25.9 35.8 L 25.2 38.1 L 20.6 40.0 L 20.8 42.6 L 25.9 44.2 L 27.0 46.3 ' +
      'L 25.1 50.9 L 27.2 52.7 L 31.8 50.1 L 34.1 50.9 L 36.0 55.4 Z',
    holes: 'M 36 33.9 A 6.1 6.1 0 0 0 36 46.1 Z',
    detail:
      // spine
      'M 36 25.7 L 36 54.3 ' +
      // 5 horizontal branch traces
      'M 36 29.0 L 48.1 29.0 ' +
      'M 36 35.1 L 54.7 35.1 ' +
      'M 36 40.0 L 59.1 40.0 ' +
      'M 36 44.9 L 54.7 44.9 ' +
      'M 36 51.0 L 48.1 51.0',
    accent:
      // 5 pads at the branch ends (filled circles r=2.75)
      'M 45.4 29.0 m -2.75 0 a 2.75 2.75 0 1 0 5.5 0 a 2.75 2.75 0 1 0 -5.5 0 ' +
      'M 52.0 35.1 m -2.75 0 a 2.75 2.75 0 1 0 5.5 0 a 2.75 2.75 0 1 0 -5.5 0 ' +
      'M 56.4 40.0 m -2.75 0 a 2.75 2.75 0 1 0 5.5 0 a 2.75 2.75 0 1 0 -5.5 0 ' +
      'M 52.0 44.9 m -2.75 0 a 2.75 2.75 0 1 0 5.5 0 a 2.75 2.75 0 1 0 -5.5 0 ' +
      'M 45.4 51.0 m -2.75 0 a 2.75 2.75 0 1 0 5.5 0 a 2.75 2.75 0 1 0 -5.5 0',
  },
};

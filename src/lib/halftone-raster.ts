/**
 * CLIENT-ONLY halftone rasteriser for desktop folder/file icons.
 *
 * The desktop glyphs render their dot field as a single PNG <image> rather
 * than thousands of <circle> elements (at pitch 1.15 that's ~2750 dots/icon).
 * This module rasterises that PNG in the browser via the Canvas 2D API and
 * fills the placeholder <image> elements that FolderGlyph / FileGlyph emit.
 *
 * Verbatim port of the design handoff (design_handoff_halftone_icons/
 * halftone-app.jsx → FolderGlyph / FileGlyph / buildBrandField).
 *
 * Only ever imported from a client <script> (see DesktopIcon.astro). No
 * top-level browser API calls, so it's safe to bundle; canvas/document are
 * touched only when the exported functions run.
 */
import { FOLDER_HALFTONE, FILE_HALFTONE } from './halftone';
import {
  BRAND_GLYPHS,
  type BrandName,
  type BrandLayer,
  type BrandPart,
} from './brand-glyphs';

const W = 72;
const H = 72;

// Geometry — MUST match FolderGlyph.astro / FileGlyph.astro.
const FOLDER = { x0: 6, y0: 14, w: 60, h: 50, tabH: 8 };
const FILE = { x0: 8, y0: 4, w: 56, h: 64 };

function asParts(layer: BrandLayer | undefined): BrandPart[] | null {
  if (!layer) return null;
  if (typeof layer === 'string') return [{ d: layer }];
  return layer;
}

/** Parse `rotate(angle cx cy)` (the only transform BrandGlyphs use). */
function applyTransformToCtx(ctx: CanvasRenderingContext2D, transform?: string) {
  if (!transform) return;
  const m = /rotate\(\s*([-\d.]+)(?:[ ,]+([-\d.]+)(?:[ ,]+([-\d.]+))?)?\s*\)/i.exec(transform);
  if (!m) return;
  const angle = (parseFloat(m[1]) * Math.PI) / 180;
  const cx = m[2] ? parseFloat(m[2]) : 0;
  const cy = m[3] ? parseFloat(m[3]) : 0;
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.translate(-cx, -cy);
}

type FieldSampler = (x: number, y: number) => number;

/**
 * Rasterise a brand glyph's layers (additive silhouette/accent/detail/stroke,
 * subtractive holes/paperCutouts/paperStrokes) to an offscreen canvas with a
 * gaussian blur, and return a sampler (x,y) → 0..1 brand-field intensity.
 */
function buildBrandField(spec: import('./brand-glyphs').BrandSpec, blurPx: number): FieldSampler {
  const RES = 3; // oversample for smooth sampling
  const canvas = document.createElement('canvas');
  canvas.width = W * RES;
  canvas.height = H * RES;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(RES, RES);
  ctx.filter = `blur(${blurPx * RES}px)`;
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const silhouetteParts = asParts(spec.silhouette);
  const holesParts = asParts(spec.holes);
  const paperCutoutsParts = asParts(spec.paperCutouts);
  const paperStrokeParts = asParts(spec.paperStrokes);
  const detailParts = asParts(spec.detail);
  const accentParts = asParts(spec.accent);
  const accentStrokeParts = asParts(spec.accentStroke);

  const fillParts = (parts: BrandPart[] | null) => {
    if (!parts) return;
    for (const p of parts) {
      ctx.save();
      applyTransformToCtx(ctx, p.transform);
      ctx.fill(new Path2D(p.d));
      ctx.restore();
    }
  };
  const strokeParts = (parts: BrandPart[] | null, width: number) => {
    if (!parts) return;
    ctx.lineWidth = width;
    for (const p of parts) {
      ctx.save();
      applyTransformToCtx(ctx, p.transform);
      ctx.stroke(new Path2D(p.d));
      ctx.restore();
    }
  };

  // Additive: silhouette + accent fills + thin stroke layers.
  fillParts(silhouetteParts);
  fillParts(accentParts);
  strokeParts(detailParts, 1.2);
  strokeParts(accentStrokeParts, 1.6);

  // Subtractive: holes / paperCutouts / paperStrokes punch back to paper.
  if (
    (holesParts && holesParts.length) ||
    (paperCutoutsParts && paperCutoutsParts.length) ||
    (paperStrokeParts && paperStrokeParts.length)
  ) {
    ctx.globalCompositeOperation = 'destination-out';
    fillParts(holesParts);
    fillParts(paperCutoutsParts);
    strokeParts(paperStrokeParts, 1.4);
    ctx.globalCompositeOperation = 'source-over';
  }

  const data = ctx.getImageData(0, 0, W * RES, H * RES).data;
  const stride = W * RES;
  return (x, y) => {
    const px = Math.round(x * RES);
    const py = Math.round(y * RES);
    if (px < 0 || py < 0 || px >= W * RES || py >= H * RES) return 0;
    return data[(py * stride + px) * 4 + 3] / 255;
  };
}

function inkColor(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() ||
    '#161513'
  );
}

// Cache keyed by variant+brand — the file gradient and each folder brand are
// identical across icons, so we rasterise each at most once.
const cache = new Map<string, string>();

export function rasterizeFolder(brand?: string): string {
  const key = `folder:${brand || ''}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const { pitch, baseR, brandR, blur, contrast } = FOLDER_HALFTONE;
  const SCALE = 3; // 3× keeps dots crisp at the larger (90px) display size
  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = inkColor();

  const spec = brand && (brand as BrandName) in BRAND_GLYPHS ? BRAND_GLYPHS[brand as BrandName] : undefined;
  const sampleBrand = spec ? buildBrandField(spec, blur) : null;

  const { x0, y0, w, h, tabH } = FOLDER;
  for (let y = y0 - tabH + 2; y <= y0 + h + pitch; y += pitch) {
    for (let x = x0 - pitch; x <= x0 + w + pitch; x += pitch) {
      const t = sampleBrand ? sampleBrand(x, y) : 0;
      const dotR = baseR + (brandR - baseR) * Math.pow(Math.max(0, Math.min(1, t)), contrast);
      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

export function rasterizeFile(): string {
  const key = 'file';
  const hit = cache.get(key);
  if (hit) return hit;

  const { pitch, minR, maxR } = FILE_HALFTONE;
  const SCALE = 3;
  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = inkColor();

  const { x0, y0, w, h } = FILE;
  const top = y0 + 1;
  const bottom = y0 + h - 1;
  for (let y = top - pitch; y <= bottom + pitch; y += pitch) {
    for (let x = x0 - pitch; x <= x0 + w + pitch; x += pitch) {
      const t = Math.max(0, Math.min(1, (y - top) / (bottom - top)));
      const r = minR + (maxR - minR) * t;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

/** Fill every placeholder <image data-ht="..."> under `root` with its PNG. */
export function fillHalftoneImages(root: ParentNode = document): void {
  const imgs = root.querySelectorAll<SVGImageElement>('image[data-ht]');
  imgs.forEach((img) => {
    if (img.getAttribute('href')) return; // already filled
    const kind = img.getAttribute('data-ht');
    const url =
      kind === 'folder'
        ? rasterizeFolder(img.getAttribute('data-ht-brand') || undefined)
        : rasterizeFile();
    img.setAttribute('href', url);
  });
}

/**
 * Generates public/og-default.png — the link-preview card shown when the site
 * is shared (iMessage, Slack, social). Echoes the desktop UI: a macOS menu bar,
 * the serif name, a mono tagline, and a row of "file" icons.
 *
 * Text is outlined to vector paths with opentype.js so the brand fonts render
 * exactly, independent of whatever fonts the rasterizer can find. Run with:
 *   node scripts/generate-og-image.mjs   (or: npm run og:image)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const FONTS = join(HERE, 'fonts');
const OUT = join(HERE, '..', 'public', 'og-default.png');

const load = (file) => {
  const b = readFileSync(join(FONTS, file));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const serif = load('InstrumentSerif-Regular.ttf');
const serifItalic = load('InstrumentSerif-Italic.ttf');
const mono = load('JetBrainsMono-Regular.ttf');

const W = 1200;
const H = 630;

const C = {
  bg: '#fafaf7',
  elev: '#ffffff',
  ink: '#161513',
  ink2: '#3d3a36',
  muted: '#8a847d',
  rule: '#e8e4dd',
  accent: '#b45309',
};

// Render glyph-by-glyph via charToGlyph to bypass opentype's layout/feature
// engine (it throws on some GSUB lookups in the variable fonts). Plain Latin
// text needs no ligature/shaping, so per-glyph advance is exact.
const advance = (font, ch, size) =>
  (font.charToGlyph(ch).advanceWidth * size) / font.unitsPerEm;

const width = (font, str, size) => {
  let w = 0;
  for (const ch of str) w += advance(font, ch, size);
  return w;
};

/** A run of text (optionally letter-spaced) as one SVG <path> at baseline (x, y). */
function text(font, str, x, y, size, fill, ls = 0) {
  let cx = x;
  let d = '';
  for (const ch of str) {
    d += font.charToGlyph(ch).getPath(cx, y, size).toPathData(2);
    cx += advance(font, ch, size) + ls;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

const trackedWidth = (font, str, size, ls) =>
  width(font, str, size) + ls * Math.max(0, [...str].length - 1);

/** FileGlyph body: 56x64 paper with a 14px folded top-right corner, scaled. */
function fileGlyph(cx, topY, scale, ext) {
  const w = 56 * scale;
  const h = 64 * scale;
  const fold = 14 * scale;
  const x0 = cx - w / 2;
  const y0 = topY;
  const body = `M ${x0} ${y0 + 2} Q ${x0} ${y0}, ${x0 + 2} ${y0} L ${x0 + w - fold} ${y0} L ${x0 + w} ${y0 + fold} L ${x0 + w} ${y0 + h - 2} Q ${x0 + w} ${y0 + h}, ${x0 + w - 2} ${y0 + h} L ${x0 + 2} ${y0 + h} Q ${x0} ${y0 + h}, ${x0} ${y0 + h - 2} Z`;
  const foldLine = `M ${x0 + w - fold} ${y0} L ${x0 + w - fold} ${y0 + fold} L ${x0 + w} ${y0 + fold}`;
  const bandH = 17 * scale;
  const bandY = y0 + h - bandH;
  // ext label centered in the dark band
  const labelSize = 11 * scale;
  const lw = width(mono, ext, labelSize);
  const label = text(mono, ext, cx - lw / 2, bandY + bandH - 5 * scale, labelSize, '#ffffff');
  return `
    <g>
      <path d="${body}" fill="#ffffff"/>
      <clipPath id="clip-${ext}-${Math.round(cx)}"><path d="${body}"/></clipPath>
      <rect x="${x0}" y="${bandY}" width="${w}" height="${bandH}" fill="${C.ink}" clip-path="url(#clip-${ext}-${Math.round(cx)})"/>
      <path d="${body}" fill="none" stroke="${C.rule}" stroke-width="${1.5}"/>
      <path d="${foldLine}" fill="none" stroke="${C.rule}" stroke-width="${1.5}"/>
      ${label}
    </g>`;
}

// ---- compose ----
const parts = [];
parts.push(`<rect width="${W}" height="${H}" fill="${C.bg}"/>`);

// menu bar
parts.push(`<rect x="0" y="0" width="${W}" height="56" fill="${C.elev}"/>`);
parts.push(`<line x1="0" y1="56" x2="${W}" y2="56" stroke="${C.rule}" stroke-width="1"/>`);
// brand (left)
const brand = 'Porter Fairbourne';
parts.push(text(serif, brand, 40, 38, 27, C.ink));
parts.push(text(serif, '.', 40 + width(serif, brand, 27), 38, 27, C.accent));
// status + clock (right)
const clock = '10:24 MST';
const clockW = trackedWidth(mono, clock, 15, 0.5);
parts.push(text(mono, clock, W - 40 - clockW, 37, 15, C.muted, 0.5));
const status = 'Busy building';
const statusW = trackedWidth(mono, status, 15, 0.5);
const statusX = W - 40 - clockW - 28 - statusW;
parts.push(text(mono, status, statusX, 37, 15, C.ink2, 0.5));
parts.push(`<circle cx="${statusX - 16}" cy="32" r="4.5" fill="#3fae5a"/>`);

// hero name (centered)
const nameSize = 132;
const nameW = width(serif, brand, nameSize);
const dotW = width(serif, '.', nameSize);
const nameX = (W - (nameW + dotW)) / 2;
const nameBaseline = 318;
parts.push(text(serif, brand, nameX, nameBaseline, nameSize, C.ink));
parts.push(text(serif, '.', nameX + nameW, nameBaseline, nameSize, C.accent));

// tagline (mono, letterspaced, centered)
const tagline = 'PRODUCT MANAGER  ·  BUILDER  ·  OPERATOR';
const tagSize = 21;
const tagLs = 1.5;
const tagW = trackedWidth(mono, tagline, tagSize, tagLs);
parts.push(text(mono, tagline, (W - tagW) / 2, 372, tagSize, C.accent, tagLs));

// sub-line (serif italic, centered)
const sub = 'Click around. Every icon is a file.';
const subSize = 33;
const subW = width(serifItalic, sub, subSize);
parts.push(text(serifItalic, sub, (W - subW) / 2, 440, subSize, C.muted));

// file-glyph row (centered) — files stay white per the desktop design
const glyphScale = 1.15;
const glyphW = 56 * glyphScale;
const gap = 56;
const files = [
  { ext: '.pdf', name: 'resume' },
  { ext: '.md', name: 'about' },
  { ext: '.txt', name: 'now' },
  { ext: '.md', name: 'work' },
];
const rowW = files.length * glyphW + (files.length - 1) * gap;
let gx = (W - rowW) / 2 + glyphW / 2;
const glyphTop = 486;
for (const f of files) {
  parts.push(fileGlyph(gx, glyphTop, glyphScale, f.ext));
  const capSize = 14;
  const capW = width(mono, f.name, capSize);
  parts.push(text(mono, f.name, gx - capW / 2, glyphTop + 64 * glyphScale + 24, capSize, C.muted));
  gx += glyphW + gap;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log(`Wrote ${OUT} (${W}x${H})`);

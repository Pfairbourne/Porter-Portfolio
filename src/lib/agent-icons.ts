/**
 * Per-agent halftone icons rendered on the /agents listing.
 *
 * Each icon is a single closed silhouette (the halftone-clipped shape) plus
 * optional inner stroke detail (lines, sub-frames, content marks) and an
 * optional ember-filled accent shape (a sun, door knob, traffic-light,
 * data-point, etc.) drawn on top of the dots for a single intentional
 * highlight. Designed at 72×72 viewBox so the rendered SVG matches
 * FolderGlyph / FileGlyph; cards display them at 56×56 (40×40 on mobile).
 *
 * Layer order in AgentGlyph.astro:
 *   paper fill → halftone dots clipped to silhouette → detail stroke
 *   → accent fill (ember) → outline stroke.
 *
 * Naming convention: generic nouns (envelope, bell, house, …) so the
 * library can grow as new agents come online without coupling to any
 * specific agent.
 */

export const ICON_NAMES = [
  'envelope',
  'house',
  'bell',
  'funnel',
  'tag',
  'bar-chart',
  'document',
  'browser',
  'waveform',
  'frame',
  'duplicate',
  'briefcase',
  'clipboard',
  'pipeline',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export interface IconSpec {
  /** Closed path describing the icon's outer silhouette. Halftone dots clip to this. */
  silhouette: string;
  /** Optional inner stroke(s) drawn on top of the dots (V-flap, content lines, ticks, frames…). */
  detail?: string;
  /** Optional ink-filled solid shape(s) drawn on top of the dots — for shapes
   *  that need to read as solid silhouettes against the dot pattern (e.g. the
   *  person inside the magnifying-glass lens). Rendered between dots and
   *  outline so the silhouette's outline stroke still draws on top. */
  detailFill?: string;
  /** Optional ember-filled solid shape(s) drawn on top of the dots for a single accent. */
  accent?: string;
  /** Optional ember-stroked path(s) — for accent details that are lines, not fills
   *  (e.g. the waveform bars inside the sales-call speech bubble). */
  accentStroke?: string;
  /** Optional override for the halftone dot clip region. When set, dots clip to
   *  THIS path instead of the silhouette — useful when the icon needs an empty
   *  area within the silhouette (e.g. the empty rim above a funnel's water line). */
  dotsClip?: string;
}

export const AGENT_ICONS: Record<IconName, IconSpec> = {
  // Envelope — postal style. The V-flap stays in ink as the dominant
  // structural crease; the stamp box (with diagonal cross) and two short
  // address lines are ember-stroked — "the personalized touch on each
  // outgoing email" — giving the icon its ember pop.
  envelope: {
    silhouette:
      'M 11 18 Q 8 18 8 21 L 8 51 Q 8 54 11 54 L 61 54 Q 64 54 64 51 L 64 21 Q 64 18 61 18 Z',
    detail:
      // V-flap
      'M 8 19 L 36 38 L 64 19',
    // ember stamp box + diagonal cross + two address lines
    accentStroke:
      // stamp box, top-right interior
      'M 48 22 L 60 22 L 60 30 L 48 30 Z ' +
      // stamp diagonal cross
      'M 48 22 L 60 30 M 60 22 L 48 30 ' +
      // address lines, bottom-left
      'M 12 44 L 32 44 M 12 48 L 26 48',
  },

  // Lead-finder — magnifying glass with a person silhouette inside the
  // lens. The PERSON is the ember pop — ember-filled head + shoulders
  // reads as the active search target. The lens + handle stay ink with
  // halftone dots; the person being orange gives this icon the same
  // ember weight as the sales-call waveform bars.
  //
  // Keeping the IconName key as `funnel` so existing agent frontmatter
  // (`icon: funnel`) keeps working — semantically still finding leads.
  funnel: {
    silhouette:
      // lens (full circle, center 28,28, radius 16)
      'M 44 28 A 16 16 0 0 1 12 28 A 16 16 0 0 1 44 28 Z ' +
      // handle — slim rectangle along the 45° axis from rim to (54, 54)
      'M 37.2 41.4 L 41.4 37.2 L 56.1 51.9 L 51.9 56.1 Z',
    // ember-filled person silhouette inside the lens — head + bust
    accent:
      // head circle at (28, 23), r=3
      'M 28 23 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 ' +
      // shoulders/bust arch
      'M 22 33 Q 22 27 28 27 Q 34 27 34 33 Z',
  },

  // Duplicate — two offset rounded sheets. The four content lines on the
  // front sheet are ember-stroked, matching the ember weight of the
  // sales-call waveform bars (this is exactly the "interior content"
  // treatment — the lines that get duplicated literally become ember).
  duplicate: {
    silhouette:
      // back sheet
      'M 24 12 Q 22 12 22 14 L 22 44 Q 22 46 24 46 L 56 46 Q 58 46 58 44 L 58 14 Q 58 12 56 12 Z ' +
      // front sheet
      'M 14 22 Q 12 22 12 24 L 12 56 Q 12 58 14 58 L 46 58 Q 48 58 48 56 L 48 24 Q 48 22 46 22 Z',
    // ember content lines on the front sheet — the thing being duplicated
    accentStroke:
      'M 18 32 L 42 32 M 18 38 L 42 38 M 18 44 L 36 44 M 18 50 L 42 50',
  },

  // Bell — rounded body with the classic crown, a flared lip at the bottom,
  // a small handle on top, and an ember clapper hanging below. Single
  // ember accent (the clapper) so the bell silhouette + halftone dots
  // dominate — the clapper is small but visually centered, like a single
  // ember beat the agent rings each morning.
  bell: {
    silhouette:
      // top handle nub + bell body + flared lip
      'M 31 10 Q 31 8 33 8 L 39 8 Q 41 8 41 10 L 41 14 ' +
      'Q 54 17 54 38 L 56 46 Q 58 50 54 50 L 18 50 Q 14 50 16 46 L 18 38 ' +
      'Q 18 17 31 14 Z',
    detail:
      // crown band
      'M 24 16 L 48 16 ' +
      // shoulder highlight curve on the left
      'M 22 38 Q 22 22 30 19',
    // ember clapper hanging from the lip
    accent: 'M 33 52 L 39 52 L 39 56 Q 39 58 36 58 Q 33 58 33 56 Z',
  },

  // Bar chart — three ascending bars sitting on a baseline with a Y-axis.
  // The trend line through the bar tops + the three Y-ticks are all
  // ember-stroked — the dominant orange element giving this icon the
  // same ember weight as the sales-call waveform bars.
  'bar-chart': {
    silhouette:
      'M 12 44 L 22 44 L 22 56 L 12 56 Z ' +
      'M 28 34 L 38 34 L 38 56 L 28 56 Z ' +
      'M 44 22 L 54 22 L 54 56 L 44 56 Z',
    detail:
      // baseline + Y-axis
      'M 8 56 L 60 56 M 8 18 L 8 56',
    // ember trend line + Y-ticks — the icon's "data" surfaces
    accentStroke:
      'M 17 44 L 33 34 L 49 22 ' +
      'M 8 46 L 11 46 M 8 36 L 11 36 M 8 26 L 11 26',
  },

  // Photo frame — outer frame with an inset matte; the mountain range is
  // ember-stroked (the icon's main subject) and the sun is the ember
  // fill on top — same ember weight as the sales-call waveform bars.
  frame: {
    silhouette: 'M 10 14 L 62 14 L 62 58 L 10 58 Z',
    detail:
      // inset matte
      'M 14 18 L 58 18 L 58 54 L 14 54 Z',
    // ember mountains — the artwork inside the frame
    accentStroke: 'M 14 50 L 24 36 L 32 44 L 42 28 L 58 50',
    // ember sun above the right peak
    accent: 'M 48 26 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
  },

  // House — pentagonal silhouette with a chimney + roof seam in ink, and
  // an ember 4-pane window + ember door outline as the dominant ember
  // weight. Knob remains as an ember fill accent.
  house: {
    silhouette: 'M 36 10 L 60 30 L 60 58 L 12 58 L 12 30 Z',
    detail:
      // chimney
      'M 48 14 L 54 14 L 54 21 ' +
      // roof seam
      'M 12 30 L 60 30',
    // ember 4-pane window + door outline — the house's "openings"
    accentStroke:
      // 4-pane window
      'M 18 36 L 28 36 L 28 46 L 18 46 Z M 23 36 L 23 46 M 18 41 L 28 41 ' +
      // door
      'M 32 58 L 32 44 Q 32 42 34 42 L 40 42 Q 42 42 42 44 L 42 58',
    // ember door knob — small filled accent on top of the door stroke
    accent: 'M 39 51 m -1.1 0 a 1.1 1.1 0 1 0 2.2 0 a 1.1 1.1 0 1 0 -2.2 0',
  },

  // Sales call / audio — speech bubble with a centered audio-waveform
  // "meter" (seven vertical bars, low→tall→low). The bubble + tail
  // immediately read as "conversation"; the bars read as "this is audio
  // we transcribed and scored". Bars are tucked inside the bubble with
  // ~5px padding on each side so the bubble shape stays legible. The
  // bars themselves are the ember pop — a live signal inside the convo.
  waveform: {
    silhouette:
      // rounded speech bubble with a tail pointing down-and-left
      'M 16 12 Q 10 12 10 18 L 10 44 Q 10 50 16 50 L 22 50 L 18 60 L 30 50 L 56 50 Q 62 50 62 44 L 62 18 Q 62 12 56 12 Z',
    // seven vertical waveform bars, centered around (36, 31), 4px apart,
    // padded ~6px inside the bubble body on every side
    accentStroke:
      'M 24 29 L 24 33 ' +
      'M 28 26 L 28 36 ' +
      'M 32 23 L 32 39 ' +
      'M 36 21 L 36 41 ' +
      'M 40 24 L 40 38 ' +
      'M 44 27 L 44 35 ' +
      'M 48 29 L 48 33',
  },

  // SKU tag — pentagonal price tag with a solid ember-filled hole on the
  // left as the single ember pop. Clean and uncluttered — the tag shape
  // + halftone dots carry the structure, the ember hole reads as the
  // identifier punched through.
  tag: {
    silhouette:
      'M 14 22 L 50 22 L 60 36 L 50 50 L 14 50 Q 12 50 12 48 L 12 24 Q 12 22 14 22 Z',
    // ember hole — solid filled circle as the accent
    accent: 'M 22 36 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0',
  },

  // Browser — window chrome with chrome divider + traffic lights + URL
  // pill in ink, and ember-stroked 4-line page content + ember close
  // button. The page content becomes the ember pop — matching the
  // sales-call waveform weight.
  browser: {
    silhouette:
      'M 12 14 Q 10 14 10 16 L 10 56 Q 10 58 12 58 L 60 58 Q 62 58 62 56 L 62 16 Q 62 14 60 14 Z',
    detail:
      // chrome divider
      'M 10 24 L 62 24 ' +
      // two outlined traffic lights (the third is the ember accent)
      'M 22 19 m -1.6 0 a 1.6 1.6 0 1 0 3.2 0 a 1.6 1.6 0 1 0 -3.2 0 ' +
      'M 28 19 m -1.6 0 a 1.6 1.6 0 1 0 3.2 0 a 1.6 1.6 0 1 0 -3.2 0 ' +
      // URL pill
      'M 34 16.5 L 56 16.5 Q 58 16.5 58 18.5 L 58 19.5 Q 58 21.5 56 21.5 L 34 21.5 Q 32 21.5 32 19.5 L 32 18.5 Q 32 16.5 34 16.5 Z',
    // ember page content — four lines
    accentStroke:
      'M 16 32 L 56 32 M 16 38 L 50 38 M 16 44 L 56 44 M 16 50 L 44 50',
    // ember close button (first traffic light)
    accent: 'M 16 19 m -1.6 0 a 1.6 1.6 0 1 0 3.2 0 a 1.6 1.6 0 1 0 -3.2 0',
  },

  // Document — page with a folded top-right corner in ink, and five
  // ember-stroked text lines + ember bookmark. Text lines carry the
  // ember weight, matching the sales-call waveform bars.
  document: {
    silhouette:
      'M 14 10 Q 12 10 12 12 L 12 60 Q 12 62 14 62 L 58 62 Q 60 62 60 60 L 60 22 L 48 10 Z',
    detail:
      // corner fold
      'M 48 10 L 48 22 L 60 22',
    // ember text lines — the document's content
    accentStroke:
      'M 20 32 L 50 32 M 20 38 L 50 38 M 20 44 L 50 44 M 20 50 L 50 50 M 20 56 L 38 56',
    // ember bookmark/seal at top-left
    accent: 'M 18 14 L 22 14 L 22 22 L 20 20 L 18 22 Z',
  },

  // Briefcase — rounded body with an inverted-U handle and a lid seam in ink,
  // and a single ember-filled clasp straddling the seam at center. The job
  // icon: the case carries the halftone dots, the ember clasp is the pop.
  briefcase: {
    silhouette:
      'M 14 24 L 58 24 Q 62 24 62 28 L 62 54 Q 62 58 58 58 L 14 58 Q 10 58 10 54 L 10 28 Q 10 24 14 24 Z',
    detail:
      // handle
      'M 29 24 L 29 18 Q 29 14 33 14 L 39 14 Q 43 14 43 18 L 43 24 ' +
      // lid seam
      'M 10 35 L 62 35',
    // ember clasp/latch straddling the seam at center
    accent:
      'M 33 31 Q 32 31 32 32 L 32 37 Q 32 38 33 38 L 39 38 Q 40 38 40 37 L 40 32 Q 40 31 39 31 Z',
  },

  // Clipboard — board with a metal clip on top in ink, three row lines, and
  // three ember checkmarks down the left as the dominant ember weight — the
  // weekly "met / exceeded" accountability scorecard.
  clipboard: {
    silhouette:
      'M 16 14 L 56 14 Q 60 14 60 18 L 60 58 Q 60 62 56 62 L 16 62 Q 12 62 12 58 L 12 18 Q 12 14 16 14 Z',
    detail:
      // clip cap straddling the board's top edge
      'M 28 16 L 28 12 Q 28 9 31 9 L 41 9 Q 44 9 44 12 L 44 16 ' +
      // three row lines, to the right of each check
      'M 33 30 L 52 30 M 33 42 L 52 42 M 33 54 L 52 54',
    // three ember checkmarks — the scorecard's pass marks
    accentStroke:
      'M 19 30 L 22 33 L 28 26 ' +
      'M 19 42 L 22 45 L 28 38 ' +
      'M 19 54 L 22 57 L 28 50',
  },

  // Pipeline — a funnel: wide mouth narrowing to a spout, with a contents
  // line across the cone in ink and a single ember drop emerging below the
  // spout. The autonomous sort-and-file flow distilled to one symbol.
  pipeline: {
    silhouette: 'M 10 16 L 62 16 L 40 38 L 40 54 L 32 54 L 32 38 Z',
    detail:
      // contents/fill level line inside the cone
      'M 20 24 L 52 24',
    // ember drop emerging from the spout — the filed evidence
    accent: 'M 36 57 Q 32.5 61.5 36 64 Q 39.5 61.5 36 57 Z',
  },
};

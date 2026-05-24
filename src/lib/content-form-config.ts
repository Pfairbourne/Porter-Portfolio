/**
 * Single source of truth for the Settings CMS forms. Each collection's
 * definition mirrors its Zod schema in src/content.config.ts.
 *
 * Adding a new field type? Update the FieldType union, the FORM_DEFINITIONS
 * config, and the renderer in src/components/ContentForm.astro.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'url'
  | 'tags'
  | 'image'
  | 'select'
  | 'checkbox';

export interface FieldDefinition {
  /** Dot-path supported for nested keys (e.g. "links.live"). */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  default?: string | number | boolean;
  /** For 'select'. */
  options?: string[];
  /** For 'image' — subdir under public/images/. */
  dir?: string;
  /** For 'textarea' — max length hint. */
  maxLength?: number;
  /** Inline helper text under the input. */
  help?: string;
}

export interface CollectionFormDefinition {
  /** Display label used in dashboard cards + breadcrumbs. */
  label: string;
  /** Short description for the dashboard. */
  description: string;
  fields: FieldDefinition[];
  /** Whether the file has a markdown body in addition to frontmatter. */
  body: boolean;
  /** 'md' for markdown with frontmatter, 'json' for pure JSON. */
  extension: 'md' | 'json';
  /** Field name whose value generates the slug for new entries. */
  slugFrom: string;
  /** Filter for the list view — hide drafts toggle, etc. */
  hasDraftField?: boolean;
}

export const FORM_DEFINITIONS: Record<string, CollectionFormDefinition> = {
  writing: {
    label: 'Writing',
    description: 'Notes, essays, and posts.',
    body: true,
    extension: 'md',
    slugFrom: 'title',
    hasDraftField: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true, maxLength: 240, help: 'One-line summary shown in the writing index.' },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'draft', label: 'Draft', type: 'checkbox', default: false, help: 'Drafts are hidden from the public site.' },
    ],
  },

  projects: {
    label: 'Case studies',
    description: 'Selected work — full case studies.',
    body: true,
    extension: 'md',
    slugFrom: 'title',
    hasDraftField: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'tagline', label: 'Tagline', type: 'text', required: true, help: 'One-sentence pitch — the H1 on the case study page.' },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'team', label: 'Team', type: 'text', help: 'e.g. "3 engineers, 1 designer"' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ['live', 'shipped', 'archived', 'in-progress'] },
      { name: 'order', label: 'Order', type: 'number', default: 0, help: 'Higher numbers appear first.' },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'hero', label: 'Hero image', type: 'image', dir: 'projects' },
      { name: 'heroAlt', label: 'Hero alt text', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, help: 'Shown on the case study list and as the italic line on the case study page.' },
      { name: 'featured', label: 'Featured', type: 'checkbox', default: true },
      { name: 'draft', label: 'Draft', type: 'checkbox', default: false },
      { name: 'links.live', label: 'Live URL', type: 'url' },
      { name: 'links.repo', label: 'Repo URL', type: 'url' },
      { name: 'links.docs', label: 'Docs URL', type: 'url' },
      { name: 'links.press', label: 'Press URL', type: 'url' },
    ],
  },

  fun: {
    label: 'Fun projects',
    description: 'Small things built for fun.',
    body: true,
    extension: 'md',
    slugFrom: 'title',
    hasDraftField: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'link', label: 'External link', type: 'url', help: 'If set, clicking the card opens this URL (external).' },
      { name: 'hero', label: 'Hero image', type: 'image', dir: 'fun' },
      { name: 'order', label: 'Order', type: 'number', default: 0 },
      { name: 'draft', label: 'Draft', type: 'checkbox', default: false },
    ],
  },

  agents: {
    label: 'MindStudio agents',
    description: 'Agents and automations.',
    body: true,
    extension: 'md',
    slugFrom: 'title',
    hasDraftField: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'link', label: 'External link', type: 'url' },
      { name: 'hero', label: 'Hero image', type: 'image', dir: 'agents' },
      { name: 'order', label: 'Order', type: 'number', default: 0 },
      { name: 'draft', label: 'Draft', type: 'checkbox', default: false },
    ],
  },

  books: {
    label: 'Reading list',
    description: 'Books you\'re reading or want to surface.',
    body: true,
    extension: 'md',
    slugFrom: 'title',
    hasDraftField: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'section', label: 'Section', type: 'select', required: true, options: ['currently-reading', 'shaped-me', 'recent'] },
      { name: 'cover', label: 'Cover image', type: 'image', dir: 'books' },
      { name: 'reaction', label: 'One-line reaction', type: 'textarea', help: 'Your take in a sentence.' },
      { name: 'finishedAt', label: 'Finished date', type: 'date' },
      { name: 'order', label: 'Order', type: 'number', default: 0 },
      { name: 'draft', label: 'Draft', type: 'checkbox', default: false },
    ],
  },

  movies: {
    label: 'Favorite movies',
    description: 'Films I love, shown on the Movies app.',
    body: false,
    extension: 'md',
    slugFrom: 'title',
    hasDraftField: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'director', label: 'Director', type: 'text' },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'poster', label: 'Poster image', type: 'image', dir: 'movies' },
      { name: 'reaction', label: 'Why I love it', type: 'textarea', help: 'Your short analysis — a sentence or three.' },
      { name: 'quote', label: 'Favorite line', type: 'text', help: 'A memorable line, rendered as a pull-quote (optional).' },
      { name: 'order', label: 'Order', type: 'number', default: 0, help: 'Lower numbers appear first.' },
      { name: 'draft', label: 'Draft', type: 'checkbox', default: false },
    ],
  },

  headshots: {
    label: 'Headshots',
    description: 'Portraits shown on the Photos app.',
    body: false,
    extension: 'json',
    slugFrom: 'label',
    fields: [
      { name: 'src', label: 'Image', type: 'image', dir: 'photos', required: true },
      { name: 'label', label: 'Label', type: 'text', required: true, help: 'Short name — "Formal", "Casual", etc.' },
      { name: 'description', label: 'Description / alt text', type: 'textarea' },
      { name: 'order', label: 'Order', type: 'number', default: 0 },
    ],
  },

  pages: {
    label: 'Pages',
    description: 'About + Now page bodies.',
    body: true,
    extension: 'md',
    slugFrom: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'updated', label: 'Last updated', type: 'date' },
    ],
  },
};

export type CollectionId = keyof typeof FORM_DEFINITIONS;

export const COLLECTION_IDS = Object.keys(FORM_DEFINITIONS) as CollectionId[];

export function isCollectionId(value: unknown): value is CollectionId {
  return typeof value === 'string' && value in FORM_DEFINITIONS;
}

export function getDefinition(id: CollectionId): CollectionFormDefinition {
  return FORM_DEFINITIONS[id];
}

/** Set a possibly-nested value (e.g. "links.live") on a plain object. */
export function setByPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.');
  let cursor: Record<string, unknown> = target;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    if (typeof cursor[key] !== 'object' || cursor[key] === null || Array.isArray(cursor[key])) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = value;
}

/** Read a possibly-nested value from a plain object. */
export function getByPath(source: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.');
  let cursor: unknown = source;
  for (const key of segments) {
    if (cursor && typeof cursor === 'object' && key in cursor) {
      cursor = (cursor as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return cursor;
}

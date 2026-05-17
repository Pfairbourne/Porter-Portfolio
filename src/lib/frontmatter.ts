/**
 * Parse + serialize the frontmatter / body split used by Astro content
 * collections. Wraps js-yaml for safe round-trips.
 *
 *   ---
 *   title: Foo
 *   tags: [a, b]
 *   ---
 *   Body markdown here...
 */
import yaml from 'js-yaml';

const SEPARATOR = '---';

export interface MarkdownDocument {
  data: Record<string, unknown>;
  body: string;
}

/** Parse a `.md` source string into { data, body }. */
export function parseMarkdown(source: string): MarkdownDocument {
  const trimmed = source.trimStart();
  if (!trimmed.startsWith(SEPARATOR)) {
    return { data: {}, body: source };
  }
  const rest = trimmed.slice(SEPARATOR.length);
  const closeIdx = rest.indexOf(`\n${SEPARATOR}`);
  if (closeIdx === -1) {
    return { data: {}, body: source };
  }
  const fmRaw = rest.slice(0, closeIdx).replace(/^\r?\n/, '');
  let body = rest.slice(closeIdx + SEPARATOR.length + 1);
  // Strip leading newline so the body starts clean
  body = body.replace(/^\r?\n/, '');

  let data: Record<string, unknown> = {};
  try {
    const parsed = yaml.load(fmRaw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    }
  } catch {
    // Treat malformed YAML as empty frontmatter; body stays intact.
  }
  return { data, body };
}

/** Serialize { data, body } back to a `.md` source string. */
export function stringifyMarkdown(doc: MarkdownDocument): string {
  const cleanedData = stripEmpty(doc.data);
  const fm = yaml.dump(cleanedData, {
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  });
  const trimmedBody = doc.body.replace(/^\r?\n+/, '');
  return `---\n${fm}---\n\n${trimmedBody}`;
}

/** Recursively drop keys with `undefined`, `null`, empty string, empty array. */
export function stripEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      const nested = stripEmpty(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) out[key] = nested;
      continue;
    }
    out[key] = value;
  }
  return out;
}

/** Convert a free-form title to a kebab-case slug. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

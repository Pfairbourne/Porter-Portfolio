import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../../../lib/auth';
import { checkContentSaveRateLimit } from '../../../../lib/ratelimit';
import { getFile, putFile, isGithubConfigured } from '../../../../lib/github';
import { stringifyMarkdown } from '../../../../lib/frontmatter';
import {
  isCollectionId,
  getDefinition,
  type CollectionId,
  type CollectionFormDefinition,
} from '../../../../lib/content-form-config';

export const prerender = false;

interface SaveBody {
  collection: string;
  slug: string;
  frontmatter: Record<string, unknown>;
  body?: string;
}

function pathFor(def: CollectionFormDefinition, collection: CollectionId, slug: string): string {
  return `src/content/${collection}/${slug}.${def.extension}`;
}

function buildFileContent(def: CollectionFormDefinition, frontmatter: Record<string, unknown>, body: string): string {
  if (def.extension === 'json') {
    return JSON.stringify(frontmatter, null, 2) + '\n';
  }
  return stringifyMarkdown({ data: frontmatter, body: body ?? '' });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) return jsonResponse(403, { ok: false, error: 'bad_origin' });
  if (!isGithubConfigured()) return jsonResponse(503, { ok: false, error: 'github_not_configured' });

  const rl = await checkContentSaveRateLimit(context.request);
  if (!rl.success) return jsonResponse(429, { ok: false, error: 'rate_limited' });

  const body = (await context.request.json().catch(() => null)) as SaveBody | null;
  if (!body || typeof body !== 'object') return jsonResponse(400, { ok: false, error: 'bad_body' });

  if (!isCollectionId(body.collection)) return jsonResponse(400, { ok: false, error: 'unknown_collection' });
  if (typeof body.slug !== 'string' || !body.slug) return jsonResponse(400, { ok: false, error: 'missing_slug' });
  const def = getDefinition(body.collection);

  // Field-level validation against FORM_DEFINITIONS.
  const errors: Record<string, string> = {};
  for (const field of def.fields) {
    const value = getField(body.frontmatter, field.name);
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = 'required';
      continue;
    }
    if (field.type === 'url' && typeof value === 'string' && value.length > 0) {
      try { new URL(value); } catch { errors[field.name] = 'invalid_url'; }
    }
    if (field.type === 'number' && value !== undefined && value !== null && value !== '' && Number.isNaN(Number(value))) {
      errors[field.name] = 'invalid_number';
    }
  }
  if (Object.keys(errors).length > 0) {
    return jsonResponse(400, { ok: false, error: 'validation_failed', fields: errors });
  }

  // Update-only: file must already exist on GitHub. New entries are added in code.
  const path = pathFor(def, body.collection, body.slug);
  const existing = await getFile(path).catch(() => null);
  if (!existing) return jsonResponse(404, { ok: false, error: 'not_found' });

  const content = buildFileContent(def, body.frontmatter, body.body ?? '');
  const message = `cms: update ${body.collection}/${body.slug}`;

  try {
    await putFile({ path, content, message, sha: existing.sha });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return jsonResponse(502, { ok: false, error: 'github_failed', detail });
  }

  return jsonResponse(200, { ok: true, slug: body.slug, path });
};

function getField(source: Record<string, unknown>, name: string): unknown {
  const segments = name.split('.');
  let cursor: unknown = source;
  for (const seg of segments) {
    if (cursor && typeof cursor === 'object' && seg in cursor) {
      cursor = (cursor as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  return cursor;
}

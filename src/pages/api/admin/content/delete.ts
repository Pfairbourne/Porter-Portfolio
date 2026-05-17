import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../../../lib/auth';
import { checkContentSaveRateLimit } from '../../../../lib/ratelimit';
import { getFile, deleteFile, isGithubConfigured } from '../../../../lib/github';
import { isCollectionId, getDefinition } from '../../../../lib/content-form-config';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403, headers: { 'content-type': 'application/json' },
    });
  }

  if (!isGithubConfigured()) {
    return new Response(JSON.stringify({ ok: false, error: 'github_not_configured' }), {
      status: 503, headers: { 'content-type': 'application/json' },
    });
  }

  const rl = await checkContentSaveRateLimit(context.request);
  if (!rl.success) {
    return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
      status: 429, headers: { 'content-type': 'application/json' },
    });
  }

  const body = (await context.request.json().catch(() => null)) as { collection?: string; slug?: string } | null;
  if (!body || !isCollectionId(body.collection) || typeof body.slug !== 'string' || !body.slug) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_body' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }

  const def = getDefinition(body.collection);
  const path = `src/content/${body.collection}/${body.slug}.${def.extension}`;
  const existing = await getFile(path).catch(() => null);
  if (!existing) {
    return new Response(JSON.stringify({ ok: false, error: 'not_found' }), {
      status: 404, headers: { 'content-type': 'application/json' },
    });
  }

  try {
    await deleteFile({ path, message: `cms: delete ${body.collection}/${body.slug}`, sha: existing.sha });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: 'github_failed', detail }), {
      status: 502, headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
};

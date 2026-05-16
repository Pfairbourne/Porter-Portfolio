import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../../lib/auth';
import { setVisibility, type VisibilityScope } from '../../../lib/kv';

export const prerender = false;

/**
 * POST /api/admin/visibility — body { scope: 'dock'|'desktop', id: string, visible: boolean }
 * Auth handled by middleware.ts. Same-origin check belt-and-suspenders.
 */
export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }
  const body = await context.request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return new Response(JSON.stringify({ ok: false, error: 'bad_body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  const { scope, id, visible } = body as { scope?: string; id?: string; visible?: boolean };
  if (scope !== 'dock' && scope !== 'desktop') {
    return new Response(JSON.stringify({ ok: false, error: 'bad_scope' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (typeof id !== 'string' || !id || typeof visible !== 'boolean') {
    return new Response(JSON.stringify({ ok: false, error: 'bad_fields' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  await setVisibility(scope as VisibilityScope, id, visible);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

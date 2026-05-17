import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../../lib/auth';
import { setIconLabel } from '../../../lib/kv';

export const prerender = false;

const MAX_LABEL = 40;

/**
 * POST /api/admin/labels — body { id: string, label: string }
 * `label: ''` resets to the default label.
 */
export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403, headers: { 'content-type': 'application/json' },
    });
  }
  const body = await context.request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return new Response(JSON.stringify({ ok: false, error: 'bad_body' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }
  const { id, label } = body as { id?: string; label?: string };
  if (typeof id !== 'string' || !id) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_id' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }
  if (typeof label !== 'string') {
    return new Response(JSON.stringify({ ok: false, error: 'bad_label' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }
  const trimmed = label.trim().slice(0, MAX_LABEL);
  await setIconLabel(id, trimmed);
  return new Response(JSON.stringify({ ok: true, label: trimmed }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
};

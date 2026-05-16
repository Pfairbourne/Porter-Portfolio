import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../../lib/auth';
import { setMenubarStatus } from '../../../lib/kv';

export const prerender = false;

/**
 * POST /api/admin/menubar-status — body { status: string }
 * Updates the "Busy Building" → whatever string in the menubar. Auth handled
 * by middleware. Trims and caps at 80 chars to keep the bar from breaking.
 */
export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }
  const body = await context.request.json().catch(() => null);
  const raw = body && typeof body === 'object' ? (body as { status?: unknown }).status : null;
  if (typeof raw !== 'string') {
    return new Response(JSON.stringify({ ok: false, error: 'bad_status' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  const status = raw.trim().slice(0, 80);
  if (!status) {
    return new Response(JSON.stringify({ ok: false, error: 'empty' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  await setMenubarStatus(status);
  return new Response(JSON.stringify({ ok: true, status }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

import type { APIRoute } from 'astro';
import { getSession, verifyPassword, isSameOriginRequest } from '../../../lib/auth';
import { checkLoginRateLimit } from '../../../lib/ratelimit';

export const prerender = false;

/**
 * POST /api/admin/login
 *
 * Accepts both JSON ({ password }) and form-urlencoded (HTML form fallback).
 * On success: sets session cookie, returns 200 (JSON callers) or redirects to
 * `next` (form callers). On failure: 401 or redirect back with ?error=1.
 */
export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  const rl = await checkLoginRateLimit(context.request);
  if (!rl.success) {
    return new Response(
      JSON.stringify({ ok: false, error: 'rate_limited' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    );
  }

  const contentType = context.request.headers.get('content-type') ?? '';
  let password = '';
  let next = '/settings';
  let isForm = false;

  if (contentType.includes('application/json')) {
    const body = await context.request.json().catch(() => ({}));
    password = String(body.password ?? '');
    next = typeof body.next === 'string' ? body.next : '/settings';
  } else {
    isForm = true;
    const data = await context.request.formData();
    password = String(data.get('password') ?? '');
    const nextField = data.get('next');
    if (typeof nextField === 'string' && nextField.startsWith('/')) next = nextField;
  }

  const ok = password.length > 0 && (await verifyPassword(password));
  if (!ok) {
    if (isForm) {
      const back = new URL('/settings/login', context.url);
      back.searchParams.set('error', '1');
      if (next !== '/settings') back.searchParams.set('next', next);
      return Response.redirect(back, 303);
    }
    return new Response(
      JSON.stringify({ ok: false, error: 'invalid_password' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    );
  }

  const session = await getSession(context);
  const now = Date.now();
  session.authedAt = now;
  session.lastSeen = now;
  await session.save();

  if (isForm) {
    return Response.redirect(new URL(next, context.url), 303);
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

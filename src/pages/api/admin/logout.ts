import type { APIRoute } from 'astro';
import { getSession, isSameOriginRequest } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }
  const session = await getSession(context);
  session.destroy();
  // Form callers expect a redirect; JS callers can ignore.
  const contentType = context.request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
  return Response.redirect(new URL('/', context.url), 303);
};

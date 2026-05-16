/**
 * Auth gate for /settings/* (UI) and /api/admin/* (write APIs).
 *
 * Public routes pass through untouched. Admin routes check the iron-session
 * cookie and redirect / 401 if invalid. The login + logout endpoints are
 * explicitly allowed so the user can actually log in.
 */
import { defineMiddleware } from 'astro:middleware';
import { isAuthed, touchSession } from './lib/auth';

const PROTECTED_PAGE_PREFIX = '/settings';
const PROTECTED_API_PREFIX = '/api/admin';
const AUTH_PAGE = '/settings/login';
const ALLOWED_API_ROUTES = new Set(['/api/admin/login', '/api/admin/logout']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;
  const path = url.pathname;
  const isProtectedPage =
    path.startsWith(PROTECTED_PAGE_PREFIX) && path !== AUTH_PAGE;
  const isProtectedApi =
    path.startsWith(PROTECTED_API_PREFIX) && !ALLOWED_API_ROUTES.has(path);

  if (!isProtectedPage && !isProtectedApi) {
    return next();
  }

  const authed = await isAuthed(context).catch(() => false);

  if (!authed) {
    if (isProtectedApi) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    const redirectTo = new URL(AUTH_PAGE, url);
    redirectTo.searchParams.set('next', path);
    return Response.redirect(redirectTo, 302);
  }

  // Sliding-window refresh — only on protected hits, so anonymous traffic
  // never touches the session cookie.
  await touchSession(context).catch(() => {});
  return next();
});

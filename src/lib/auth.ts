/**
 * Session + password helpers for the admin CMS.
 *
 * Sessions are sealed cookies via iron-session — no DB. Password is compared
 * against a bcrypt hash stored in an env var. Sliding 7-day expiry, 30-day cap.
 */
import { getIronSession, type SessionOptions } from 'iron-session';
import bcrypt from 'bcryptjs';
import type { APIContext } from 'astro';

export interface AdminSession {
  authedAt?: number; // ms timestamp of original login
  lastSeen?: number; // ms timestamp of latest refresh
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const SESSION_COOKIE = 'porter_admin';

function sessionOptions(): SessionOptions {
  const password = import.meta.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    // In production, this is a hard error. In dev without a secret, callers
    // should fall through to "not authed" — getSession will throw and the
    // caller can catch.
    throw new Error('SESSION_SECRET must be set to a value of at least 32 characters.');
  }
  return {
    password,
    cookieName: SESSION_COOKIE,
    cookieOptions: {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS_MS / 1000,
    },
  };
}

export async function getSession(ctx: APIContext) {
  return getIronSession<AdminSession>(ctx.cookies as never, sessionOptions());
}

/** Returns true when the session cookie is valid and not past its hard expiry. */
export async function isAuthed(ctx: APIContext): Promise<boolean> {
  try {
    const session = await getSession(ctx);
    if (!session.authedAt) return false;
    if (Date.now() - session.authedAt > THIRTY_DAYS_MS) return false;
    return true;
  } catch {
    return false;
  }
}

/** Refresh `lastSeen` on each authed request so the sliding window stays open. */
export async function touchSession(ctx: APIContext): Promise<void> {
  const session = await getSession(ctx);
  if (!session.authedAt) return;
  session.lastSeen = Date.now();
  await session.save();
}

/** Verify a candidate password against the stored bcrypt hash. */
export async function verifyPassword(candidate: string): Promise<boolean> {
  const hash = import.meta.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  try {
    return await bcrypt.compare(candidate, hash);
  } catch {
    return false;
  }
}

/** Convenience: same-origin Origin / Referer check for state-changing POSTs.
 *
 * On hosted platforms behind aliases (e.g. Vercel), `request.url` reports the
 * internal deployment URL, not the canonical public domain — so we compare
 * against the `host` header the visitor is connecting to, not the URL Astro
 * built the request from.
 */
export function isSameOriginRequest(request: Request): boolean {
  const host = request.headers.get('host');
  if (!host) return true; // unknown host — fall through; auth is the real gate
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const expectedOrigin = `${proto}://${host}`;

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).origin === expectedOrigin;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin;
    } catch {
      return false;
    }
  }
  // Some user agents omit both for top-level navigations; allow GET-equivalent
  // safe cases. State-changing admin routes are also guarded by middleware
  // (session cookie required), which is the primary defense.
  return true;
}

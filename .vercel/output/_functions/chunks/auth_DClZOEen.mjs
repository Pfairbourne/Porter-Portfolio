import { getIronSession } from 'iron-session';
import 'bcryptjs';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1e3;
function sessionOptions() {
  {
    throw new Error("SESSION_SECRET must be set to a value of at least 32 characters.");
  }
}
async function getSession(ctx) {
  return getIronSession(ctx.cookies, sessionOptions());
}
async function isAuthed(ctx) {
  try {
    const session = await getSession(ctx);
    if (!session.authedAt) return false;
    if (Date.now() - session.authedAt > THIRTY_DAYS_MS) return false;
    return true;
  } catch {
    return false;
  }
}
async function touchSession(ctx) {
  const session = await getSession(ctx);
  if (!session.authedAt) return;
  session.lastSeen = Date.now();
  await session.save();
}
async function verifyPassword(candidate) {
  return false;
}
function isSameOriginRequest(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (origin) return new URL(origin).origin === url.origin;
  if (referer) return new URL(referer).origin === url.origin;
  return true;
}

export { isSameOriginRequest as a, getSession as g, isAuthed as i, touchSession as t, verifyPassword as v };

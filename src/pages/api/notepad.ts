import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../lib/auth';
import { checkNotepadRateLimit } from '../../lib/ratelimit';
import { addNote, type NoteRecord } from '../../lib/kv';

export const prerender = false;

/**
 * POST /api/notepad — public, rate-limited.
 *
 * Body:  { name, message, email?, company? }   (company is honeypot)
 * Reply: { ok: true } on success/honeypot-trip, { ok: false, error } otherwise.
 *
 * Notes are stored in Upstash KV under `notepad:notes` (hash). Browse + delete
 * them via /settings/notes. The honeypot is treated as success silently so
 * bots don't get feedback.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function newId(): string {
  // Sortable-by-time prefix + short random suffix.
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  const rl = await checkNotepadRateLimit(context.request);
  if (!rl.success) {
    return new Response(
      JSON.stringify({ ok: false, error: 'rate_limited' }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    );
  }

  const body = await context.request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return new Response(JSON.stringify({ ok: false, error: 'bad_body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { name, message, email, company } = body as {
    name?: unknown;
    message?: unknown;
    email?: unknown;
    company?: unknown;
  };

  // Honeypot trip — silent success.
  if (typeof company === 'string' && company.trim() !== '') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';

  if (!cleanName || cleanName.length > 80) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_name' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!cleanMessage || cleanMessage.length > 2000) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_message' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (cleanEmail && !EMAIL_RE.test(cleanEmail)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_email' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const record: NoteRecord = {
    id: newId(),
    name: cleanName,
    message: cleanMessage,
    ...(cleanEmail ? { email: cleanEmail } : {}),
    receivedAt: Date.now(),
  };

  try {
    await addNote(record);
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: 'storage_failed' }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

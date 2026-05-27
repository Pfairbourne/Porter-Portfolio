import type { APIRoute } from 'astro';
import { checkTourSessionRateLimit } from '../../../lib/ratelimit';

export const prerender = false;

/**
 * GET /api/tour/agent-url — mints a short-lived ElevenLabs Conversational AI
 * signed URL for the desktop voice tour. Keeps ELEVENLABS_API_KEY and the agent
 * id entirely server-side; the client receives only a transient signed URL.
 *
 * Always returns 200/4xx JSON the client can act on:
 *   { ok: true, signedUrl }            → start the agent session
 *   { ok: false, reason }              → fall back to the scripted narration
 * Never throws to the client (the tour must never dead-end).
 */
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request }) => {
  // Same-origin guard (first gate, defense-in-depth alongside the rate limit): minting a
  // signed URL starts a billable ElevenLabs session, so reject obvious cross-site /
  // scripted callers up front. Browser same-origin GETs send a same-host Referer; a
  // foreign/mismatched host is rejected. A missing Referer (privacy settings) is allowed
  // so legit visitors never break.
  const host = request.headers.get('host');
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const sameHost = (u: string | null) => {
    if (!u || !host) return false;
    try { return new URL(u).host === host; } catch { return false; }
  };
  if ((origin && !sameHost(origin)) || (!origin && referer && !sameHost(referer))) {
    return json({ ok: false, reason: 'forbidden' }, 403);
  }

  const apiKey = import.meta.env.ELEVENLABS_API_KEY;
  const agentId = import.meta.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) return json({ ok: false, reason: 'not_configured' });

  const { success } = await checkTourSessionRateLimit(request);
  if (!success) return json({ ok: false, reason: 'rate_limited' }, 429);

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { 'xi-api-key': apiKey } },
    );
    if (!res.ok) {
      // Pass the upstream reason through (no secrets in it) so the client console can
      // name the real problem, e.g. an API key missing the `convai_write` permission.
      let detail = '';
      try {
        const err = (await res.json()) as { detail?: { message?: string; status?: string } };
        detail = err?.detail?.message || err?.detail?.status || '';
      } catch {}
      return json({ ok: false, reason: 'elevenlabs_error', status: res.status, detail }, 502);
    }
    const data = (await res.json()) as { signed_url?: string };
    if (!data.signed_url) return json({ ok: false, reason: 'no_url' }, 502);
    return json({ ok: true, signedUrl: data.signed_url });
  } catch {
    return json({ ok: false, reason: 'fetch_failed' }, 502);
  }
};

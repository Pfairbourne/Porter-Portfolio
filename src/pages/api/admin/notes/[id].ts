import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../../../lib/auth';
import { deleteNote } from '../../../../lib/kv';

export const prerender = false;

/**
 * DELETE /api/admin/notes/[id]
 * Auth handled by middleware. Removes the note from KV.
 */
export const DELETE: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }
  const id = context.params.id;
  if (typeof id !== 'string' || !id) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_id' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  await deleteNote(id);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

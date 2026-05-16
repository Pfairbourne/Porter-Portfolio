import { a as isSameOriginRequest } from '../../../chunks/auth_DClZOEen.mjs';
import { b as setVisibility } from '../../../chunks/kv_DZZmj91-.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: "bad_origin" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }
  const body = await context.request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return new Response(JSON.stringify({ ok: false, error: "bad_body" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  const { scope, id, visible } = body;
  if (scope !== "dock" && scope !== "desktop") {
    return new Response(JSON.stringify({ ok: false, error: "bad_scope" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  if (typeof id !== "string" || !id || typeof visible !== "boolean") {
    return new Response(JSON.stringify({ ok: false, error: "bad_fields" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  await setVisibility(scope, id, visible);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

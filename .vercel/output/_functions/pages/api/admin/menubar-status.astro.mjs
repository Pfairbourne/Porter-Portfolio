import { a as isSameOriginRequest } from '../../../chunks/auth_DClZOEen.mjs';
import { s as setMenubarStatus } from '../../../chunks/kv_DZZmj91-.mjs';
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
  const raw = body && typeof body === "object" ? body.status : null;
  if (typeof raw !== "string") {
    return new Response(JSON.stringify({ ok: false, error: "bad_status" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  const status = raw.trim().slice(0, 80);
  if (!status) {
    return new Response(JSON.stringify({ ok: false, error: "empty" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  await setMenubarStatus(status);
  return new Response(JSON.stringify({ ok: true, status }), {
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

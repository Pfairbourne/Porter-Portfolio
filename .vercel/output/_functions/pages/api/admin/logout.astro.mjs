import { a as isSameOriginRequest, g as getSession } from '../../../chunks/auth_DClZOEen.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: "bad_origin" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }
  const session = await getSession(context);
  session.destroy();
  const contentType = context.request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }
  return Response.redirect(new URL("/", context.url), 303);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

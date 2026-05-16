import { a as isSameOriginRequest } from '../../chunks/auth_DClZOEen.mjs';
import { a as checkNotepadRateLimit } from '../../chunks/ratelimit_BLsLFh_C.mjs';
export { renderers } from '../../renderers.mjs';

async function sendNotepad(args) {
  const from = "Porter Portfolio <onboarding@resend.dev>";
  const to = "pfairbourne@gmail.com";
  const subject = `Notepad: ${args.name}`;
  const replyTo = args.fromEmail || void 0;
  const body = [
    `From: ${args.name}${args.fromEmail ? ` <${args.fromEmail}>` : ""}`,
    "",
    args.message
  ].join("\n");
  {
    console.log("[notepad] RESEND_API_KEY not set — would have sent:", { to, from, subject, replyTo, body });
    return { ok: true, delivered: false };
  }
}

const prerender = false;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POST = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: "bad_origin" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }
  const rl = await checkNotepadRateLimit(context.request);
  if (!rl.success) {
    return new Response(
      JSON.stringify({ ok: false, error: "rate_limited" }),
      { status: 429, headers: { "content-type": "application/json" } }
    );
  }
  const body = await context.request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return new Response(JSON.stringify({ ok: false, error: "bad_body" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  const { name, message, email, company } = body;
  if (typeof company === "string" && company.trim() !== "") {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  if (!cleanName || cleanName.length > 80) {
    return new Response(JSON.stringify({ ok: false, error: "bad_name" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  if (!cleanMessage || cleanMessage.length > 2e3) {
    return new Response(JSON.stringify({ ok: false, error: "bad_message" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  if (cleanEmail && !EMAIL_RE.test(cleanEmail)) {
    return new Response(JSON.stringify({ ok: false, error: "bad_email" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  const result = await sendNotepad({
    name: cleanName,
    message: cleanMessage,
    fromEmail: cleanEmail || void 0
  });
  if (!result.ok) {
    return new Response(
      JSON.stringify({ ok: false, error: "send_failed" }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
  return new Response(JSON.stringify({ ok: true, delivered: result.delivered }), {
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

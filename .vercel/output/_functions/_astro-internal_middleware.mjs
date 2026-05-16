import { d as defineMiddleware, s as sequence } from './chunks/index_JvGJPTnX.mjs';
import { i as isAuthed, t as touchSession } from './chunks/auth_DClZOEen.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_CDMGBSbD.mjs';
import 'piccolore';
import './chunks/astro/server_Cf05cWyX.mjs';
import 'clsx';

const PROTECTED_PAGE_PREFIX = "/settings";
const PROTECTED_API_PREFIX = "/api/admin";
const AUTH_PAGE = "/settings/login";
const ALLOWED_API_ROUTES = /* @__PURE__ */ new Set(["/api/admin/login", "/api/admin/logout"]);
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { url } = context;
  const path = url.pathname;
  const isProtectedPage = path.startsWith(PROTECTED_PAGE_PREFIX) && path !== AUTH_PAGE;
  const isProtectedApi = path.startsWith(PROTECTED_API_PREFIX) && !ALLOWED_API_ROUTES.has(path);
  if (!isProtectedPage && !isProtectedApi) {
    return next();
  }
  const authed = await isAuthed(context).catch(() => false);
  if (!authed) {
    if (isProtectedApi) {
      return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" }
      });
    }
    const redirectTo = new URL(AUTH_PAGE, url);
    redirectTo.searchParams.set("next", path);
    return Response.redirect(redirectTo, 302);
  }
  await touchSession(context).catch(() => {
  });
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };

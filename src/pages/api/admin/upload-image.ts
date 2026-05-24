import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../../lib/auth';
import { checkContentSaveRateLimit } from '../../../lib/ratelimit';
import { putFile, isGithubConfigured } from '../../../lib/github';
import { slugify } from '../../../lib/frontmatter';

export const prerender = false;

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_DIRS = new Set([
  'projects', 'fun', 'agents', 'books', 'photos', 'pages', 'about',
]);
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_origin' }), {
      status: 403, headers: { 'content-type': 'application/json' },
    });
  }

  if (!isGithubConfigured()) {
    return new Response(JSON.stringify({ ok: false, error: 'github_not_configured' }), {
      status: 503, headers: { 'content-type': 'application/json' },
    });
  }

  const rl = await checkContentSaveRateLimit(context.request);
  if (!rl.success) {
    return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
      status: 429, headers: { 'content-type': 'application/json' },
    });
  }

  let form: FormData;
  try {
    form = await context.request.formData();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad_form' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }

  const file = form.get('file');
  const dir = String(form.get('dir') ?? '').trim();
  const baseHint = String(form.get('name') ?? '').trim();

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ ok: false, error: 'missing_file' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }
  if (!ALLOWED_DIRS.has(dir)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad_dir' }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }
  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ ok: false, error: 'too_large', max: MAX_BYTES }), {
      status: 413, headers: { 'content-type': 'application/json' },
    });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return new Response(JSON.stringify({ ok: false, error: 'unsupported_type', type: file.type }), {
      status: 415, headers: { 'content-type': 'application/json' },
    });
  }

  // Build a safe filename: <slug>-<timestamp36>.<ext>
  const base = slugify(baseHint || file.name.replace(/\.[^.]+$/, '')) || 'image';
  const stamp = Date.now().toString(36);
  const filename = `${base}-${stamp}.${ext}`;
  const path = `public/images/${dir}/${filename}`;
  const publicUrl = `/images/${dir}/${filename}`;

  let buffer: Buffer;
  try {
    const ab = await file.arrayBuffer();
    buffer = Buffer.from(ab);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'read_failed' }), {
      status: 500, headers: { 'content-type': 'application/json' },
    });
  }

  try {
    await putFile({
      path,
      content: buffer,
      message: `cms: upload ${filename}`,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: 'github_failed', detail }), {
      status: 502, headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, url: publicUrl, filename }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
};

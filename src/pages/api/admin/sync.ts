import type { APIRoute } from 'astro';
import { isSameOriginRequest } from '../../../lib/auth';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

export const prerender = false;

const execAsync = promisify(exec);

/**
 * POST /api/admin/sync — run `git pull --ff-only origin main` on the working
 * tree. Lets the admin manually pull CMS commits back down to the local dev
 * filesystem after editing on localhost. Dev-only — Vercel's filesystem is
 * read-only at runtime, so this is meaningless in production.
 */
export const POST: APIRoute = async (context) => {
  if (!isSameOriginRequest(context.request)) {
    return jsonResponse(403, { ok: false, error: 'bad_origin' });
  }
  if (process.env.VERCEL) {
    return jsonResponse(400, { ok: false, error: 'not_supported_on_vercel' });
  }

  const cwd = process.cwd();
  try {
    const { stdout, stderr } = await execAsync('git pull --ff-only origin main', {
      cwd,
      timeout: 30_000,
    });
    const output = `${stdout}${stderr ? `\n${stderr}` : ''}`.trim();
    const summary = parseSummary(output);
    return jsonResponse(200, { ok: true, summary, output });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return jsonResponse(500, { ok: false, error: 'git_failed', detail });
  }
};

function parseSummary(output: string): string {
  if (/Already up to date/i.test(output)) return 'Already up to date.';
  const m = output.match(/(\d+ files? changed)/);
  if (m) return `Pulled — ${m[1]}.`;
  if (/Fast-forward/i.test(output)) return 'Pulled — fast-forward.';
  return 'Pulled.';
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}

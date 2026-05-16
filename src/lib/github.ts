/**
 * Thin GitHub Contents-API wrapper for the CMS.
 *
 * The CMS persists content (markdown + JSON) by committing to the repo. Each
 * commit triggers a Vercel rebuild, so changes go live in ~30–60s. Use this
 * for everything except instant-toggle KV state.
 *
 * Falls back to throwing if not configured — the API routes that depend on
 * GitHub will surface a clean error to the admin UI.
 */
import { Octokit } from '@octokit/rest';

let octokit: Octokit | null = null;

function getOctokit(): Octokit {
  if (octokit) return octokit;
  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not set. Configure it in your Vercel env.');
  }
  octokit = new Octokit({ auth: token });
  return octokit;
}

function getRepo(): { owner: string; repo: string; branch: string } {
  const repoStr = import.meta.env.GITHUB_REPO;
  if (!repoStr || !repoStr.includes('/')) {
    throw new Error('GITHUB_REPO must be set in "owner/name" format.');
  }
  const [owner, repo] = repoStr.split('/');
  const branch = import.meta.env.GITHUB_BRANCH || 'main';
  return { owner, repo, branch };
}

/** Get a file's contents + SHA (needed for updates). Returns null if missing. */
export async function getFile(
  path: string,
): Promise<{ content: string; sha: string } | null> {
  const { owner, repo, branch } = getRepo();
  try {
    const res = await getOctokit().repos.getContent({ owner, repo, path, ref: branch });
    if (Array.isArray(res.data) || res.data.type !== 'file') return null;
    const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
    return { content, sha: res.data.sha };
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 404) {
      return null;
    }
    throw err;
  }
}

/** Create or update a file. Pass `sha` for updates; omit for new files. */
export async function putFile(args: {
  path: string;
  content: string | Buffer;
  message: string;
  sha?: string;
}): Promise<{ sha: string; commit: string }> {
  const { owner, repo, branch } = getRepo();
  const encoded =
    typeof args.content === 'string'
      ? Buffer.from(args.content, 'utf-8').toString('base64')
      : args.content.toString('base64');
  const res = await getOctokit().repos.createOrUpdateFileContents({
    owner,
    repo,
    path: args.path,
    message: args.message,
    content: encoded,
    branch,
    sha: args.sha,
  });
  return {
    sha: res.data.content?.sha ?? '',
    commit: res.data.commit.sha ?? '',
  };
}

/** Delete a file at the given path. */
export async function deleteFile(args: {
  path: string;
  message: string;
  sha: string;
}): Promise<void> {
  const { owner, repo, branch } = getRepo();
  await getOctokit().repos.deleteFile({
    owner,
    repo,
    path: args.path,
    message: args.message,
    sha: args.sha,
    branch,
  });
}

export function isGithubConfigured(): boolean {
  return Boolean(import.meta.env.GITHUB_TOKEN && import.meta.env.GITHUB_REPO);
}

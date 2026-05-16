/**
 * Thin Upstash Redis wrapper with graceful local fallback.
 *
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set (e.g. local
 * dev without an Upstash account), reads return default values and writes are
 * no-ops. This keeps `npm run dev` working without a network round-trip while
 * still using the real KV in production.
 */
import { Redis } from '@upstash/redis';

let client: Redis | null = null;

function getClient(): Redis | null {
  if (client) return client;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

export type VisibilityScope = 'dock' | 'desktop';
export type VisibilityMap = Record<string, boolean>;

const VISIBILITY_KEY = (scope: VisibilityScope) => `${scope}:visibility`;
const MENUBAR_STATUS_KEY = 'menubar:status';

const DEFAULT_VISIBILITY: VisibilityMap = {
  // Dock apps
  photos: true,
  notepad: true,
  books: true,
  music: true,
  calendar: true,
  settings: true,
  // Desktop files / folders
  'selected-work': true,
  ember: true,
  yoodlize: true,
  'fun-projects': true,
  'mindstudio-agents': true,
  writing: true,
  about: true,
  now: true,
  resume: true,
  'style-guide': true,
};

const DEFAULT_MENUBAR_STATUS = 'Busy Building';

export async function getVisibility(scope: VisibilityScope): Promise<VisibilityMap> {
  const c = getClient();
  if (!c) return DEFAULT_VISIBILITY;
  try {
    const stored = await c.get<VisibilityMap>(VISIBILITY_KEY(scope));
    return { ...DEFAULT_VISIBILITY, ...(stored ?? {}) };
  } catch {
    return DEFAULT_VISIBILITY;
  }
}

export async function setVisibility(
  scope: VisibilityScope,
  id: string,
  visible: boolean,
): Promise<void> {
  const c = getClient();
  if (!c) return;
  const current = (await c.get<VisibilityMap>(VISIBILITY_KEY(scope))) ?? {};
  current[id] = visible;
  await c.set(VISIBILITY_KEY(scope), current);
}

export async function getMenubarStatus(): Promise<string> {
  const c = getClient();
  if (!c) return DEFAULT_MENUBAR_STATUS;
  try {
    const stored = await c.get<string>(MENUBAR_STATUS_KEY);
    return stored ?? DEFAULT_MENUBAR_STATUS;
  } catch {
    return DEFAULT_MENUBAR_STATUS;
  }
}

export async function setMenubarStatus(value: string): Promise<void> {
  const c = getClient();
  if (!c) return;
  await c.set(MENUBAR_STATUS_KEY, value);
}

export function isKvConfigured(): boolean {
  return getClient() !== null;
}

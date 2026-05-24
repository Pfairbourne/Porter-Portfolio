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
export type IconLabelMap = Record<string, string>;

const VISIBILITY_KEY = (scope: VisibilityScope) => `${scope}:visibility`;
const MENUBAR_STATUS_KEY = 'menubar:status';
const ICON_LABELS_KEY = 'icon:labels';

const DEFAULT_VISIBILITY: VisibilityMap = {
  // Dock apps
  photos: true,
  quote: true,
  reader: true,
  movies: true,
  calendar: true,
  mail: true,
  settings: true,
  // Desktop files / folders
  'selected-work': true,
  ember: true,
  'fun-projects': true,
  'ai-agents': true,
  about: true,
  now: true,
  stack: true,
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

/** Read every icon-label override (icon id → custom label). Empty when unset. */
export async function getIconLabels(): Promise<IconLabelMap> {
  const c = getClient();
  if (!c) return {};
  try {
    const stored = await c.get<IconLabelMap>(ICON_LABELS_KEY);
    return stored ?? {};
  } catch {
    return {};
  }
}

/** Set or clear (label === '') a single icon's display label. */
export async function setIconLabel(id: string, label: string): Promise<void> {
  const c = getClient();
  if (!c) return;
  const current = (await c.get<IconLabelMap>(ICON_LABELS_KEY)) ?? {};
  if (label === '') {
    delete current[id];
  } else {
    current[id] = label;
  }
  await c.set(ICON_LABELS_KEY, current);
}

export function isKvConfigured(): boolean {
  return getClient() !== null;
}

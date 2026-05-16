import '@upstash/redis';

function getClient() {
  return null;
}
const VISIBILITY_KEY = (scope) => `${scope}:visibility`;
const MENUBAR_STATUS_KEY = "menubar:status";
const DEFAULT_VISIBILITY = {
  // Dock apps
  photos: true,
  notepad: true,
  books: true,
  music: true,
  calendar: true,
  settings: true,
  // Desktop files / folders
  "selected-work": true,
  ember: true,
  yoodlize: true,
  "fun-projects": true,
  "mindstudio-agents": true,
  writing: true,
  about: true,
  now: true,
  resume: true,
  "style-guide": true
};
const DEFAULT_MENUBAR_STATUS = "Busy Building";
async function getVisibility(scope) {
  const c = getClient();
  if (!c) return DEFAULT_VISIBILITY;
  try {
    const stored = await c.get(VISIBILITY_KEY(scope));
    return { ...DEFAULT_VISIBILITY, ...stored ?? {} };
  } catch {
    return DEFAULT_VISIBILITY;
  }
}
async function setVisibility(scope, id, visible) {
  const c = getClient();
  if (!c) return;
  const current = await c.get(VISIBILITY_KEY(scope)) ?? {};
  current[id] = visible;
  await c.set(VISIBILITY_KEY(scope), current);
}
async function getMenubarStatus() {
  const c = getClient();
  if (!c) return DEFAULT_MENUBAR_STATUS;
  try {
    const stored = await c.get(MENUBAR_STATUS_KEY);
    return stored ?? DEFAULT_MENUBAR_STATUS;
  } catch {
    return DEFAULT_MENUBAR_STATUS;
  }
}
async function setMenubarStatus(value) {
  const c = getClient();
  if (!c) return;
  await c.set(MENUBAR_STATUS_KEY, value);
}
function isKvConfigured() {
  return getClient() !== null;
}

export { getVisibility as a, setVisibility as b, getMenubarStatus as g, isKvConfigured as i, setMenubarStatus as s };

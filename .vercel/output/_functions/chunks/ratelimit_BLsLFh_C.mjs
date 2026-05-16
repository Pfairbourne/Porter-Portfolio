import { Ratelimit } from '@upstash/ratelimit';
import '@upstash/redis';

function getRedis() {
  return null;
}
let loginLimiter = null;
function getLoginLimiter() {
  if (loginLimiter) return loginLimiter;
  const r = getRedis();
  if (!r) return null;
  loginLimiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: false,
    prefix: "porter:rl:login"
  });
  return loginLimiter;
}
let notepadLimiter = null;
function getNotepadLimiter() {
  if (notepadLimiter) return notepadLimiter;
  const r = getRedis();
  if (!r) return null;
  notepadLimiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: false,
    prefix: "porter:rl:notepad"
  });
  return notepadLimiter;
}
function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
async function checkLoginRateLimit(request) {
  const limiter = getLoginLimiter();
  if (!limiter) return { success: true, remaining: 999 };
  const ip = clientIp(request);
  const { success, remaining } = await limiter.limit(ip);
  return { success, remaining };
}
async function checkNotepadRateLimit(request) {
  const limiter = getNotepadLimiter();
  if (!limiter) return { success: true, remaining: 999 };
  const ip = clientIp(request);
  const { success, remaining } = await limiter.limit(ip);
  return { success, remaining };
}

export { checkNotepadRateLimit as a, checkLoginRateLimit as c };

/**
 * Rate limiting for the admin login endpoint.
 *
 * Backed by Upstash Redis when configured; no-op in local dev so the developer
 * can iterate without provisioning anything. 5 attempts per IP per 15 minutes.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

let loginLimiter: Ratelimit | null = null;
function getLoginLimiter(): Ratelimit | null {
  if (loginLimiter) return loginLimiter;
  const r = getRedis();
  if (!r) return null;
  loginLimiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: false,
    prefix: 'porter:rl:login',
  });
  return loginLimiter;
}

let notepadLimiter: Ratelimit | null = null;
function getNotepadLimiter(): Ratelimit | null {
  if (notepadLimiter) return notepadLimiter;
  const r = getRedis();
  if (!r) return null;
  notepadLimiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: false,
    prefix: 'porter:rl:notepad',
  });
  return notepadLimiter;
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function checkLoginRateLimit(request: Request): Promise<{
  success: boolean;
  remaining: number;
}> {
  const limiter = getLoginLimiter();
  if (!limiter) return { success: true, remaining: 999 };
  const ip = clientIp(request);
  const { success, remaining } = await limiter.limit(ip);
  return { success, remaining };
}

export async function checkNotepadRateLimit(request: Request): Promise<{
  success: boolean;
  remaining: number;
}> {
  const limiter = getNotepadLimiter();
  if (!limiter) return { success: true, remaining: 999 };
  const ip = clientIp(request);
  const { success, remaining } = await limiter.limit(ip);
  return { success, remaining };
}

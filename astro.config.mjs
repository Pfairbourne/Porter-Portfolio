import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Hybrid: every page is prerendered (static) unless it opts into SSR with
// `export const prerender = false`. The homepage opts in so the dock/menubar
// can read instant-toggle state from KV; admin/api routes also opt in.
export default defineConfig({
  site: 'https://porterfairbourne.com',
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  build: {
    format: 'directory',
  },
  // Astro's built-in checkOrigin compares the Origin header to `site` above.
  // Our admin routes hit it with a different host on Vercel preview URLs and
  // *.vercel.app aliases, so the built-in check 403s. We have our own
  // host-based isSameOriginRequest() in src/lib/auth.ts that handles this
  // correctly, so the built-in check is redundant — turn it off.
  security: {
    checkOrigin: false,
  },
});

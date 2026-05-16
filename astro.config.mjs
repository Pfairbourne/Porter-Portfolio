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
});

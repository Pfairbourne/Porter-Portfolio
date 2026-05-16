import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    year: z.number(),
    role: z.string(),
    team: z.string().optional(),
    status: z.enum(['live', 'shipped', 'archived', 'in-progress']),
    order: z.number().default(0),
    tags: z.array(z.string()).default([]),
    hero: z.string().optional(),
    heroAlt: z.string().optional(),
    summary: z.string(),
    featured: z.boolean().default(true),
    draft: z.boolean().default(false),
    links: z
      .object({
        live: z.string().url().optional(),
        repo: z.string().url().optional(),
        docs: z.string().url().optional(),
        press: z.string().url().optional(),
      })
      .default({}),
  }),
});

const fun = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fun' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    hero: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const agents = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/agents' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    hero: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

// Filenames starting with `_` are templates / examples — they live in the
// repo to show schema shape but don't render. Add real entries as normal
// `*.md` or `*.json` files alongside them.

const books = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    cover: z.string().optional(),
    reaction: z.string().optional(),
    section: z.enum(['currently-reading', 'shaped-me', 'recent']),
    finishedAt: z.coerce.date().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const tracks = defineCollection({
  loader: glob({ pattern: ['**/*.json', '!**/_*.json'], base: './src/content/tracks' }),
  schema: z.object({
    spotifyTrackId: z.string(),
    title: z.string(),
    artist: z.string(),
    note: z.string().optional(),
    order: z.number().default(0),
  }),
});

const headshots = defineCollection({
  loader: glob({ pattern: ['**/*.json', '!**/_*.json'], base: './src/content/headshots' }),
  schema: z.object({
    src: z.string(),
    label: z.string(),
    description: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { projects, fun, writing, agents, books, tracks, headshots };

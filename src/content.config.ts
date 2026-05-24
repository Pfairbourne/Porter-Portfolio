import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { ICON_NAMES } from './lib/agent-icons';

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
    /** Optional icon name — renders a unique halftone glyph on the listing card. */
    icon: z.enum(ICON_NAMES).optional(),
    order: z.number().default(0),
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
    /** One-line caption rendered under the hero image on the detail page. */
    heroCaption: z.string().optional(),
    /** Optional preview card for a real artifact the agent produced. */
    exampleOutput: z
      .object({
        /** Optional URL — omit for outputs that aren't public (SMS, Slack, etc.). */
        url: z.string().url().optional(),
        title: z.string(),
        description: z.string().optional(),
        /** Optional screenshot path (e.g. /images/agents/<slug>/example.png). */
        image: z.string().optional(),
        /** Short label rendered above the card (e.g. "live yoodlize.com post"). */
        kicker: z.string().optional(),
      })
      .optional(),
    /** Optional icon name — renders a unique halftone glyph on the listing card. */
    icon: z.enum(ICON_NAMES).optional(),
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
    /** Memorable closing line — rendered as an italic pull-quote under the reason. */
    quote: z.string().optional(),
    section: z.enum(['currently-reading', 'shaped-me', 'recent']),
    finishedAt: z.coerce.date().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const movies = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/movies' }),
  schema: z.object({
    title: z.string(),
    director: z.string().optional(),
    year: z.number().optional(),
    poster: z.string().optional(),
    /** Why I love it — the short analysis rendered under the title. */
    reaction: z.string().optional(),
    /** A favorite line from the film, rendered as an italic pull-quote. */
    quote: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
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

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { projects, fun, agents, books, movies, headshots, pages };

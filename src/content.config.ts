import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './lib/site';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(120),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      category: z.enum(CATEGORIES),
      tags: z.array(z.string()).default([]),
      thumbnail: image().optional(),
      thumbnailAlt: z.string().optional(),
      /** true でPR表記を自動表示（ステマ規制対応） */
      pr: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { articles };

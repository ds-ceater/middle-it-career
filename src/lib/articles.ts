import { getCollection } from 'astro:content';

/** 公開記事を新しい順で取得（本番では draft を除外） */
export async function getPublishedArticles() {
  const all = await getCollection('articles', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

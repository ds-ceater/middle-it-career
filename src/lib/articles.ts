import { getCollection, type CollectionEntry } from 'astro:content';
import { TOPICS, topicsOf } from './topics';

type Article = CollectionEntry<'articles'>;

/** 公開記事を新しい順で取得（本番では draft を除外） */
export async function getPublishedArticles() {
  const all = await getCollection('articles', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

/**
 * src/lib/topics.ts に書いた slug が実在するかをビルド時に確認する
 * （フォルダ名の変更・打ち間違いでリンク切れになるのを防ぐ）
 */
export async function assertTopicSlugsExist() {
  const ids = new Set((await getCollection('articles')).map((e) => e.id));
  for (const topic of TOPICS) {
    const slugs = [...topic.articles, ...('tags' in topic ? topic.tags.map((t) => t.slug) : [])];
    const missing = slugs.filter((s) => !ids.has(s));
    if (missing.length > 0) {
      throw new Error(`src/lib/topics.ts の「${topic.title}」に存在しない記事があります: ${missing.join(', ')}`);
    }
  }
}

// どの記事にも付いていて、関連度の判定に役立たないタグ
const GENERIC_TAGS = new Set(['40代', '50代', '転職']);

/**
 * 関連記事を選ぶ。点数の高い順（同点なら新しい順）に limit 件。
 * - 同じテーマ（topics.ts）：+3
 * - 共通のタグ（「40代」「50代」「転職」を除く）：1つにつき +1
 * - 同じ category：+1
 */
export function getRelatedArticles(current: Article, articles: Article[], limit = 4): Article[] {
  const currentTopics = new Set(topicsOf(current.id).map((t) => t.id));
  const currentTags = new Set(current.data.tags.filter((t) => !GENERIC_TAGS.has(t)));

  const score = (a: Article) =>
    (topicsOf(a.id).some((t) => currentTopics.has(t.id)) ? 3 : 0) +
    a.data.tags.filter((t) => currentTags.has(t)).length +
    (a.data.category === current.data.category ? 1 : 0);

  return articles
    .filter((a) => a.id !== current.id)
    .map((a) => ({ a, s: score(a) }))
    .sort((x, y) => y.s - x.s || y.a.data.publishedAt.valueOf() - x.a.data.publishedAt.valueOf())
    .slice(0, limit)
    .map(({ a }) => a);
}

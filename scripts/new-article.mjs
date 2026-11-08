// 新しい記事フォルダをテンプレートから作る
// 使い方：npm run new:article -- <フォルダ名> ["記事タイトル"]
// 例　　：npm run new:article -- resume-writing "職務経歴書の書き方"
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [slug, title = ''] = process.argv.slice(2);

if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('フォルダ名を半角英小文字・数字・ハイフンで指定してください（例：resume-writing）');
  process.exit(1);
}

const root = new URL('../', import.meta.url);
const dir = new URL(`src/content/articles/${slug}/`, root);
const file = new URL('index.mdx', dir);

if (existsSync(file)) {
  console.error(`すでに存在します：${fileURLToPath(file)}`);
  process.exit(1);
}

const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }); // YYYY-MM-DD
const template = readFileSync(new URL('docs/templates/article.mdx', root), 'utf8');

mkdirSync(dir, { recursive: true });
writeFileSync(file, template.replace('__TITLE__', title.replaceAll("'", "''")).replace('__DATE__', today));
// 画像を差し替えるまでビルドが通るよう、仮のサムネイルを置く
copyFileSync(new URL('docs/templates/thumbnail-placeholder.jpg', root), new URL('thumbnail.jpg', dir));

console.log(`作成しました：${fileURLToPath(dir)}`);
console.log('次にやること：thumbnail.jpg を差し替える → 本文を書く → draft: false にする');

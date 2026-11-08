# 動作制約ルール（必須遵守）

## 1. 進行とステップ実行の制限

- **1ターン（1回の出力）につき、実行または提示するアクション（コマンドやファイル修正）は必ず最大「1つ」に制限してください。**
- 1つのアクションを実行または提示したら、先の予測や2手目以降の手順を絶対に思考・出力せず、そこで出力を完全にストップしてください。
- 必ずユーザー（人間）のターミナル入力や確認の返答（y/nなど）を待ち、その結果を確認してから次のステップを考えてください。
- 先々のステップのために不要な思考トークンを消費することを厳禁とします。

## 2. コマンド実行のプロセス

- コマンドを実行する際は自動実行（`-y`などのフラグ）をせず、必ずユーザーの承認を挟んでください。
- 前のステップがエラーになった場合や、想定と違う挙動になった場合は、当初の予定を破棄してその場でユーザーに指示を仰いでください。

# ミドルITキャリア — 開発ルール

転職情報アフィリエイトサイト。作者のポートフォリオも兼ねるので、コードの品質・説明可能性を重視する。

## スタック

- Astro 6（SSG）+ TypeScript strict + MDX
- SCSS（`src/styles/abstracts` は全SCSSに自動 `@use` される。CSSを出力するコードは置かない）
- 動的UIが必要な部分のみ React（`client:visible` などで部分的にハイドレート）
- デプロイ：GitHub Actions → ロリポップ（FTPS）。`main` への push で本番反映

## CSS

- 命名は **BEM**（`block__element--modifier`）。Element の入れ子は1階層まで。
- Figma レイヤーとの対応は `docs/figma-bem-mapping.md` を正とする。
- モバイルファースト。ブレークポイントは `@include mq(md)` を使い、px の直書きをしない。
- 色・余白・文字サイズは `src/styles/base/_tokens.scss` の CSS 変数を使う。Figma の px は `rem()` で変換。
- `:hover` は `@include hover` を使う（タッチ端末対策）。

## アクセシビリティ（必須）

- WCAG 2.2 AA を目標。コントラスト比 本文4.5:1 / 大きい文字・UI 3:1。
- 見出しは階層を飛ばさない。ページに h1 は1つ。
- インタラクティブ要素はキーボード操作可・フォーカスが見えること・タップ領域 44px 以上。
- 開閉UIは `aria-expanded` / `aria-controls`、現在地は `aria-current`。
- 画像の `alt` は必須（装飾画像は `alt=""`）。
- アニメーションは `prefers-reduced-motion` を尊重。

## アフィリエイト

- リンクは必ず `<AffiliateLink id="…">` 経由。URL は `src/lib/affiliates.ts` で一元管理。
- 広告を含む記事は frontmatter に `pr: true`（PR表記が自動で出る）。

## 記事

- 1記事1フォルダ：`src/content/articles/<slug>/index.mdx`。画像も同じフォルダに置く（フォルダ名＝URL）。
- 新規作成は `npm run new:article -- <slug> "タイトル"`（テンプレートは `docs/templates/article.mdx`）。手順は `docs/how-to-add-article.md`。
- frontmatter は `src/content.config.ts` のスキーマに従う。本文の見出しは `##` から（h1 は自動）。
- `draft: true` は開発時のみ表示され、本番ビルドに含まれない。

## コマンド

- `npm run dev` / `npm run build`（型チェック込み） / `npm run preview`

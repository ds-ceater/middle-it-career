# ミドルITキャリア

ミドル世代のIT職向け転職情報サイト。

## 技術スタック

| 領域 | 採用技術 | 選定理由 |
|---|---|---|
| フレームワーク | Astro 6（SSG） | 記事中心のサイトのため、JSを最小限にして表示速度とSEOを優先 |
| 言語 | TypeScript（strict） | 記事メタデータをスキーマで型安全に管理 |
| スタイル | SCSS + BEM + CSS変数 | Figma Variables をデザイントークンとして一元管理 |
| 動的UI | React（Islands） | 必要な部分だけハイドレート |
| CI/CD | GitHub Actions → FTPS | push だけで本番反映 |
| ホスティング | ロリポップ | 静的HTMLのみ配置し、サーバー側の攻撃面をなくす |

## アクセシビリティ

WCAG 2.2 AA を目標に、スキップリンク・ランドマーク・キーボード操作・フォーカス表示・`prefers-reduced-motion` などに対応。

## 開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 型チェック + ビルド（dist/）
npm run preview
```

## デプロイ

`main` に push すると GitHub Actions がビルドし、ロリポップへ FTPS でアップロードする。
リポジトリの Secrets に `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` / `FTP_SERVER_DIR` を登録すること。

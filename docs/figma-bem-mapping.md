# Figma レイヤー ↔ BEM 対応表

PC と SP で Figma のフォルダ（レイヤー）構造が違っても、**HTML は1つ**にして CSS で出し分ける。
このファイルで「どの Figma レイヤーが、どの Block / Element に対応するか」をすり合わせる。

## ルール

1. **Block の名前は PC / SP で共通**にする（例：`header`、`hero`、`article-card`）。
2. Figma の構造が違う場合は、**意味（役割）を基準に**どちらかに寄せる。見た目のグループ分けではなく「何のための要素か」で決める。
3. 並び順だけが違う → CSS（`grid-template-areas` / `order`）で対応。DOMの順序は**読み上げ順・Tab順として正しい方**に合わせる（`order` で見た目と読み上げ順がずれすぎないよう注意）。
4. SP だけにある要素（ハンバーガー等）→ 同じ Block の Element として追加し、PC では非表示。
5. 内容自体が PC / SP で違う → 原則は文言を揃える。どうしても違う場合のみ両方をDOMに置き、`display:none` で出し分ける（片方が読み上げられない＝問題なし）。
6. Element の入れ子は1階層（`block__elem`）。`block__elem__child` にはしない。必要なら新しい Block に切り出す。
7. Modifier は状態・バリエーションのみ（`button--primary`、`nav--open`）。状態は可能なら `aria-expanded` 等の属性セレクタで表す。

## 対応表

Figma：`middle-it-top`（fileKey `4MMn9gfWtRuI0qHXjoIIIb`）
フレーム：PC `middle01-top_pc`（node 1-4）／SP `middle01-top_sp`（node 18-315）／SPメニュー展開 `middle01-top_sp-menu`（node 27-1169）

Figma のレイヤー名はほぼ BEM になっているので、**原則 PC のレイヤー名をそのままクラス名にする**。
「—」はそのフレームに無いことを示す。「コードのみ」は Figma に無いがマークアップ上必要な要素。

### 共通（全ページ）

| Block | Element / Modifier | Figma PC | Figma SP | 備考 |
|---|---|---|---|---|
| header | header__caution | header__caution | header__caution | PR表記「本ページには広告が含まれています。」 |
| header | header__inner | header__inner | header__inner | `.container` と併用 |
| header | header__logo | header__logo | header__logo | ロゴは1枚のSVG（`logo.svg`）。`header__logo-icon` / `-text-middle` / `-text-it` / `-text-career` はSVG内部のパーツなのでクラスにしない |
| header | header__toggle | — | menu-button | SPのみ。PCでは非表示。`aria-expanded` / `aria-controls` |
| header | header__toggle-bar | — | menu-button__icon / menu-button__line | 三本線。CSS で描画 |
| header | header__nav | header__nav | header__nav（展開時：menu__open / menu_sp） | SPの開閉状態は `header__toggle[aria-expanded="true"]` で表す（Modifier は作らない） |
| header | header__nav-item | header__nav-item | header__nav-item | `<li>` |
| header | header__nav-item--search | header__nav-item--search | header__nav-item--search | 検索ボタン |
| header | header__nav-link | — | — | コードのみ（`<a>`）。現在地は `aria-current="page"` |
| footer | footer__body | footer__body | footer__body | `.container` と併用 |
| footer | footer__logo | footer__logo | footer__logo | 白抜きロゴSVG（`logo-white.svg`）。内部パーツはクラスにしない |
| footer | footer__nav / footer__nav-item | footer__nav / footer__nav-item | footer__nav / footer__nav-item | |
| footer | footer__nav-link | — | — | コードのみ（`<a>`） |
| footer | footer__copy | （名前なし：© テキスト） | （名前なし） | コピーライト |

### トップページ

| Block | Element / Modifier | Figma PC | Figma SP | 備考 |
|---|---|---|---|---|
| mv | mv__bg | mv__bg | mv__bg | 装飾画像（`alt=""`）か CSS 背景 |
| mv | mv__title | mv__title | （名前なし：テキスト） | ページの **h1** |
| mv | mv__lead | mv__lead | （名前なし：テキスト） | |
| mv | mv__cta | mv__cta | mv__cta | |
| mv | mv__guide-list / mv__guide-btn | mv__guide-list / mv__guide-btn | mv__guide-list / mv__guide-btn | |
| worry | worry__title / worry__lead | worry__title / worry__lead | h2 / lead | SPはコンポーネント名。PCの名前に揃える。h2 |
| worry | worry__list / worry__item | worry__list / worry__item | worry__list / worry__item | |
| worry | worry__icon | worry__icon | worry__icon01〜06 | 6種の画像違い。Modifier は作らず画像の差し替えで対応。`worry__icon-img` / `-path` はSVG内部 |
| worry | worry__label | worry__label | worry__label | |
| service | service__inner | service__inner | service__inner | `.container` と併用 |
| service | service__title / service__lead | service__title / service__lead | h2 / lead | h2 |
| service | service__body | service__body | service__body | |
| service | service__visual / service__img | service__visual / service__img | service__visual / service__img | |
| service | service__ranking | service__ranking | service__ranking | `service__ranking-inner` は不要なら省く |
| service | service__ranking-list / service__ranking-item | service__ranking-list / service__ranking-item | 同左 | `<ol>`（順位なので順序付きリスト）。item は `<li>` |
| service | service__ranking-link | （service__ranking-item 自体） | 同左 | コードのみ（`<a>`）。行全体をリンクにする。順位・名前・矢印を grid で横並び |
| service | service__ranking-rank | Frame（55×55・塗りあり）＋ テキスト「1」 | 同左 | 順位バッジ。`<ol>` の番号と二重に読まれないよう `aria-hidden="true"` |
| service | service__ranking-name | テキスト「IT専門転職エージェント」 | 同左 | |
| service | service__ranking-arrow | Frame ＞ Vector（矢印） | 同左 | 装飾アイコン（`aria-hidden="true"`）。順位＋名前を包む Frame は grid で不要になるので作らない |
| service | service__more-btn | service__more-btn | service__more-btn | |
| age-guide | age-guide__inner | — | age-guide__inner | PCに無い。`.container` 用にコードでは付ける |
| age-guide | age-guide__title / age-guide__lead | age-guide__title / age-guide__lead | h2 / lead | h2 |
| age-guide | age-guide__list / age-guide__card | age-guide__list / age-guide__card | 同左 | |
| age-guide | age-guide__card-title / -desc / -btn | 同左 | 同左 | card-title は h3 |
| category-section | category-section__inner | job-guide__inner / work-guide__inner / knowhow__inner | 同左 | **共通 Block**。3セクションが同じ構成のため1つに切り出す。`.container` と併用 |
| category-section | category-section__title / category-section__lead | ○○__title / ○○__lead | h2 / lead | h2 |
| category-section | category-section__tag-list / category-section__tag | ○○__tag-list / ○○__tag | 同左 | タグはカテゴリ記事へのリンク |
| category-section | category-section__more-btn | ○○__more-btn | 同左 | |
| category-section | category-section--tinted | job-guide / knowhow（背景 `#eff8fd`） | 同左 | 背景色ありのバリエーション。work-guide は背景なし（交互の縞模様） |

`job-guide` / `work-guide` / `knowhow` の名前はクラスにせず、各 `<section>` の `id`（ページ内リンク用）として残す。
| about | about__inner / about__title | 同左 | __inner / h2 | h2 |
| about | about__card / about__profile / about__profile-body | 同左 | 同左 | |
| about | about__avatar | about__avatar | about__avatar | 人物画像。`alt` 必須 |
| about | about__link | about__link | about__link | 運営者情報へのリンク |

### 採用しない Figma レイヤー

| Figma レイヤー | 理由 |
|---|---|
| first-view（PC/SP） | header と mv をまとめる見た目上のグループ。header は全ページ共通で BaseLayout に置くため、Block にしない |
| main | `<main>` 要素そのもの（BaseLayout にある） |
| btn_set（SP） | mv__cta と mv__guide-list をまとめる枠。PCに無いので、mv のレイアウト（gap / grid）で対応 |
| menu-line（SP） | メニュー内の区切り線。`border` で描画 |
| `Frame`（service__ranking-item 内） | 名前なしの枠。実装時に Element 名を付ける |

### 実装時に追加した Element（コードのみ）

| Block | Element | 理由 |
|---|---|---|
| header | header__logo-img / header__nav-list | ロゴSVG（`<Logo />`）と `<ul>` |
| footer | footer__logo-img / footer__nav-list | 同上 |
| mv | mv__body | `.container` と併用する中身の枠 |
| mv | mv__cta-text-pc / mv__cta-text-sp | ボタン文言が PC「おすすめのIT転職サービスを比較する」/ SP「IT転職サービスを比較」で違うため両方置く。読み上げは常に PC 側 |
| worry | worry__link | カード全体を `<a>` にする |
| service | service__ranking-title / service__more | 「人気のサービス」（h3）、ボタンを包む `<p>` |
| age-guide | age-guide__card-num | 「40」「50」「55」の大きい数字 |
| category-section | category-section__more | ボタンを包む `<p>` |
| about | about__name / about__text | 「ミドルITキャリア 運営者」（h3）と紹介文 |

※ SP の worry は Figma 上で4番目以降の文言がずれている（「今の年収を維持して」が重複）ため、PC の文言に揃えた。

### Figma に無い Block

| Block | 使う場所 | 備考 |
|---|---|---|
| article-card | 記事一覧 | Figma 未デザイン。トップページの「新着記事」は廃止 |

## 画像・アイコンの書き出し規約

| 種類 | 形式 | 置き場所 | 命名 |
|---|---|---|---|
| ロゴ | SVG（文字はアウトライン化） | `src/assets/icons/logo.svg` | `logo.svg` / `logo-white.svg` |
| アイコン | SVG（線はアウトライン化、塗りは `currentColor` にできる単色） | `src/assets/icons/` | `icon-{名前}.svg` |
| 写真・イラスト | PNG または JPG（**2x** で書き出し） | `src/assets/images/` | `{ページ}-{用途}.png` |
| OGP | PNG 1200×630 | `public/og-default.png` | |

写真は WebP/AVIF 変換やリサイズを Astro（`astro:assets`）が自動で行うので、元画像は大きめ（2x）でよい。

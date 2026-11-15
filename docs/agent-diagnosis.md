# 転職エージェント診断の仕組み（React を使っていない人向け）

このドキュメントは、HTML・CSS・素の JavaScript（または jQuery）は書けるが、React はまだ使っていない人向けに、転職エージェント診断の作りを説明するものです。

- 実物：`/diagnosis/`（専用ページ）と、IT専門転職エージェント比較記事の比較表の下
- 関係するファイル：

| ファイル | 役割 | 書かれている言語 |
|---|---|---|
| `src/lib/diagnosis.ts` | 質問・選択肢・点数のデータと、点数を計算する関数 | TypeScript（React なし） |
| `src/components/diagnosis/AgentDiagnosisApp.tsx` | 画面の表示とクリックなどの操作 | React（TSX） |
| `src/components/diagnosis/AgentDiagnosisApp.scss` | 見た目 | SCSS（BEM） |
| `src/components/diagnosis/AgentDiagnosis.astro` | Astro と React をつなぐ入口。広告ボタンを作って React に渡す | Astro |
| `src/pages/diagnosis.astro` | 専用ページ | Astro |
| `src/lib/diagnosis.test.ts` / `AgentDiagnosisApp.test.tsx` | テスト | TypeScript（Vitest） |

---

## 1. まず全体像

このサイトは基本的に「ビルド時に HTML を作って置いておく」静的サイトです（Astro）。ほとんどのページは JavaScript を使いません。

診断だけは「選択肢をクリックすると結果が変わる」動きが必要なので、その部分だけ React で作っています。ページ全体を React にしているわけではありません。

```
┌─────────────── ページ（Astro が作る普通の HTML） ───────────────┐
│ 見出し・本文・表 …                                               │
│                                                                  │
│  ┌──────── 診断の部分だけ React が動かす（アイランド） ───────┐  │
│  │ Q1〜Q4 の選択肢 → 「診断する」 → 結果（3社の順位）         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ 本文の続き …                                                     │
└──────────────────────────────────────────────────────────────────┘
```

このように「静かな HTML の海に、動く部分だけが島のように浮かんでいる」作りを、Astro では **アイランド（Islands）** と呼びます。

### データの流れ

```
src/lib/diagnosis.ts
  QUESTIONS（質問と点数のデータ）
  SERVICES（3社のデータ）
  diagnose()（点数を計算する関数）
        │
        │ import（読み込み）
        ▼
AgentDiagnosisApp.tsx（React）
  ・QUESTIONS をもとに質問を表示
  ・クリックされた回答を覚えておく（state）
  ・「診断する」で diagnose() を呼び、結果を表示
        ▲
        │ 広告ボタンを「スロット」として渡す
        │ JS をいつ読み込むかを指定（client:visible）
AgentDiagnosis.astro（Astro）
        ▲
        │ <AgentDiagnosis /> と書いて使う
記事（MDX）・専用ページ
```

---

## 2. React の考え方：「DOM を書き換える」のではなく「状態から画面を作り直す」

素の JavaScript や jQuery では、クリックされたら **DOM を直接書き換え** ます。

```js
// 素の JavaScript の場合（イメージ）
button.addEventListener('click', () => {
  form.style.display = 'none';
  result.innerHTML = '<p>1位：TechGO</p>…';
  result.style.display = 'block';
});
```

React では DOM を直接さわりません。代わりに、

1. 画面の元になる **データ（状態 ＝ state）** を持っておく
2. 「この状態ならこの HTML」という **作り方（関数）** を書いておく
3. 状態が変わると、React が自動で関数を実行し直し、**変わった部分だけ** DOM を更新する

という流れになります。

```tsx
// React の場合（イメージ）
const [result, setResult] = useState(null); // 状態：最初は「結果なし」

return result
  ? <div>1位：{result.ranking[0].service.name}</div>  // 結果があれば結果を表示
  : <form>…質問…</form>;                              // なければ質問を表示

// クリックされたら状態を変えるだけ。表示の切り替えは React に任せる
setResult(diagnose(answers));
```

「どの要素を消して、どこに何を差し込むか」を自分で書かなくてよいのが React の利点です。画面の状態がいくつも組み合わさっても、表示がおかしくなりにくくなります。

---

## 3. React のファイル（.tsx）の読み方

### 3-1. コンポーネント ＝ HTML を返す関数

```tsx
export default function AgentDiagnosisApp({ title = '転職エージェント診断', ...ctaSlots }: Props) {
  // …準備の処理…
  return (
    <section className="agent-diagnosis">
      <p className="agent-diagnosis__title">{title}</p>
      …
    </section>
  );
}
```

- 関数が **HTML のようなもの（JSX）** を `return` します。これが画面になります。
- JSX は HTML とほぼ同じですが、次の点が違います。

| HTML | JSX | 理由 |
|---|---|---|
| `class="…"` | `className="…"` | `class` は JavaScript の予約語のため |
| `for="…"` | `htmlFor="…"` | 同上 |
| `tabindex="-1"` | `tabIndex={-1}` | 属性名はキャメルケース。数値や変数は `{ }` で書く |
| `<!-- コメント -->` | `{/* コメント */}` | |
| 文字の埋め込みはできない | `{title}` | `{ }` の中に JavaScript の値や式を書ける |

### 3-2. props ＝ コンポーネントに渡す引数

コンポーネントは関数なので、外から値を渡せます。これを **props** と呼びます。HTML の属性のように書きます。

```astro
<!-- 渡す側（Astro） -->
<AgentDiagnosisApp title="4つの質問で診断する" />
```

```tsx
// 受け取る側（React）：引数のオブジェクトから title を取り出す
function AgentDiagnosisApp({ title = '転職エージェント診断' }) { … }
//                                   ↑ 渡されなかったときの初期値
```

`Props` という型（`interface Props`）で「何を受け取れるか」を決めているので、名前を打ち間違えるとビルド時にエラーになります。

### 3-3. 繰り返し表示：`map`

質問や選択肢は、データの配列から `map` で HTML を作ります。PHP の `foreach` や、テンプレートエンジンのループと同じ考え方です。

```tsx
{QUESTIONS.map((question, i) => (
  <fieldset key={question.id}>
    <legend>Q{i + 1} {question.text}</legend>
    {question.choices.map((choice) => (
      <label key={choice.id}>
        <input type="radio" … />
        {choice.label}
      </label>
    ))}
  </fieldset>
))}
```

- `key` は、React が「どの要素がどのデータか」を見分けるための目印です。画面には出ません。
- 質問を増やしたいときは、`diagnosis.ts` の `QUESTIONS` にデータを足すだけで、画面にも自動で出ます。HTML を書き足す必要はありません。

### 3-4. 条件で出し分け：`? :` と `&&`

```tsx
{result ? <結果の HTML /> : <質問の HTML />}   // result があれば結果、なければ質問
{reasons.length > 0 && <ul>…</ul>}            // 理由があるときだけリストを出す
```

---

## 4. このコンポーネントで使っている React の機能

React の機能は `use〇〇` という名前の関数（**フック**）で使います。診断で使っているのは次の4つです。

### 4-1. `useState`：画面の元になるデータを覚えておく

```tsx
const [answers, setAnswers] = useState<Answers>({});
const [result, setResult] = useState<DiagnosisResult | null>(null);
const [showErrors, setShowErrors] = useState(false);
```

| 状態 | 中身 | 例 |
|---|---|---|
| `answers` | 各質問で選ばれた選択肢 | `{ current: 'sier', goal: 'salary' }` |
| `result` | 診断結果。まだなら `null` | 3社の順位・理由・注意書き |
| `showErrors` | 未回答のエラーを出すかどうか | `true` / `false` |

- `useState(初期値)` は、`[今の値, 値を変える関数]` の2つを返します。
- 値を変えるときは、必ず `setAnswers(…)` のような **専用の関数** を使います。`answers.goal = 'salary'` と直接書き換えても、React は変化に気づかず画面が更新されません。

選択肢がクリックされたときの処理は次のとおりです。

```tsx
function handleChange(questionId: string, choiceId: string) {
  setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
}
```

`{ ...prev }` で今までの回答をコピーし、クリックされた質問の分だけ上書きした **新しいオブジェクト** を作って渡しています。「元のデータは書き換えず、新しく作って差し替える」のが React の決まりです。

#### 状態にしないもの

未回答の質問の一覧（`unanswered`）は状態として持っていません。`answers` があれば毎回計算で求められるからです。

```tsx
const unanswered = findUnanswered(answers);
```

同じ情報を2か所で持つと、片方だけ更新し忘れて食い違うバグが起きやすくなります。「計算で求められるものは状態にしない」が基本です。

### 4-2. イベント：`onChange` / `onSubmit` / `onClick`

HTML の `onclick` 属性と似た書き方で、処理を結び付けます。

```tsx
<input type="radio" onChange={() => handleChange(question.id, choice.id)} />
<form onSubmit={handleSubmit}>
<button type="button" onClick={handleRetry}>もう一度診断する</button>
```

`addEventListener` を自分で書く必要はありません。

フォームの送信処理は次のとおりです。

```tsx
function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
  e.preventDefault();                 // ページの再読み込み（通常のフォーム送信）を止める

  if (unanswered.length > 0) {        // 未回答があれば
    setShowErrors(true);              //   エラーを表示する状態にして
    document.getElementById(…)?.focus(); //   最初の未回答の質問にフォーカス
    return;
  }

  const next = diagnose(answers);     // 点数を計算（diagnosis.ts の関数）
  setResult(next);                    // 結果を状態に入れる → React が結果画面に切り替える
  pushDataLayer(answers, next);       // GA4 用に、診断の完了を記録
}
```

### 4-3. `useRef` と `useEffect`：画面が切り替わったあとにフォーカスを移す

結果を出したら、キーボードやスクリーンリーダーの利用者が迷わないように、フォーカスを結果の領域へ移します。

ただし `setResult()` を呼んだ直後は、まだ結果の HTML が画面にできていません。そこで、**描画が終わったあとに実行される** `useEffect` を使います。

```tsx
const resultRef = useRef<HTMLDivElement>(null);   // 結果の <div> を指す「目印」

useEffect(() => {
  if (result) {
    resultRef.current?.focus();   // 結果の <div> にフォーカス
  }
}, [result]);                     // result が変わったときだけ実行する

<div ref={resultRef} tabIndex={-1}>…結果…</div>
```

- `useRef` は、特定の DOM 要素を後から操作するための目印です。jQuery の `$('#result')` で要素を取ってくるのに近い使い方です。
- `useEffect(処理, [result])` の `[result]` は「この値が変わったときだけ実行する」という指定です。

### 4-4. `useId`：重複しない ID を作る

`<label for>` と `<input id>` の関連付けや `aria-labelledby` には ID が必要です。でも、同じページに診断が2つ置かれても ID が重ならないようにしたいので、React に作ってもらいます。

```tsx
const id = useId();               // 例：「«r0»」のような一意の文字列
const titleId = `${id}-title`;
```

`useId` はサーバー（ビルド時）とブラウザで同じ値になるので、ビルド時に作った HTML と、ブラウザで React が作る HTML の ID がずれません。

---

## 5. Astro と React のつなぎ方

### 5-1. `client:visible`：JS を読み込むタイミング

```astro
<AgentDiagnosisApp client:visible … />
```

1. **ビルド時**：Astro が React のコンポーネントを一度実行し、最初の画面（質問の一覧）を **普通の HTML** として書き出します。
2. **ブラウザ**：診断が画面に入った（スクロールして見えた）タイミングで、初めて React の JavaScript を読み込みます。
3. 読み込まれると、React が既存の HTML にクリックなどの処理を結び付けます。これを **ハイドレーション** と呼びます。

そのため、ページを開いた直後の表示速度はほとんど落ちません。ほかに `client:load`（すぐ読み込む）、`client:idle`（ブラウザの手が空いたら読み込む）なども選べます。

### 5-2. スロット：広告ボタンは Astro で作って React に渡す

このサイトでは、広告リンクは必ず `AffiliateLink`（Astro のコンポーネント）を通すルールです。広告 URL の管理や、`rel="sponsored"` を付けるのを1か所にまとめるためです。

ところが、Astro のコンポーネントは React の中では使えません。そこで **スロット** という仕組みを使います。

```astro
<!-- AgentDiagnosis.astro -->
<AgentDiagnosisApp client:visible>
  <AffiliateLink slot="atpro"     id="at-pro-jin" variant="button" newTab>…</AffiliateLink>
  <AffiliateLink slot="techgo"    id="techgo"     variant="button" newTab>…</AffiliateLink>
  <AffiliateLink slot="techclips" id="techclips"  variant="button" newTab>…</AffiliateLink>
</AgentDiagnosisApp>
```

（実際のコードでは、`SERVICES` の配列から `map` で3つ作っています。）

- `slot="techgo"` を付けた中身は、Astro が先に HTML にしてから、React に **`props.techgo`** として渡します。
- React 側は、それを「どこに置くか」を決めるだけです。

```tsx
// AgentDiagnosisApp.tsx：結果のカードの中で、その会社のボタンを置く
{ctaSlots[service.id]}   // service.id が 'techgo' なら props.techgo（TechGO のボタン）
```

ボタンを出すのは結果を表示したときだけなので、それまでの間、ボタンの HTML は `<template>` タグの中にしまわれています（画面には出ません）。

---

## 6. CSS について

- React のコンポーネントには、Astro の `<style>`（そのコンポーネントの中だけに効く CSS）が使えません。そのため、`AgentDiagnosisApp.scss` を `import` して読み込み、**BEM のクラス名**（`agent-diagnosis__〇〇`）でほかと衝突しないようにしています。
- 記事本文の中に置くので、本文用の CSS（`.prose ul { padding-left: … }`）が診断のリストにも効いてしまいます。打ち消したい箇所だけ、`.agent-diagnosis .agent-diagnosis__ranking` のように詳細度を上げて書いています。
- 選んだ選択肢の見た目は `:has(:checked)` で付けています（JavaScript は使っていません）。

---

## 7. よくある変更のやり方

| やりたいこと | 直す場所 |
|---|---|
| 質問・選択肢の文言を変える | `src/lib/diagnosis.ts` の `QUESTIONS` |
| 点数を調整する | `QUESTIONS` の各選択肢の `points` |
| おすすめの理由・注意書きを変える | `QUESTIONS` の `reasons` / `note` |
| 会社の説明文・評判記事の URL を変える | `src/lib/diagnosis.ts` の `SERVICES` |
| 広告のリンク先を変える | `src/lib/affiliates.ts`（診断のファイルは直さない） |
| 見た目を変える | `AgentDiagnosisApp.scss` |
| 別の記事に診断を置く | 記事の MDX に `<AgentDiagnosis />` と書く（frontmatter に `pr: true` が必要。ないとビルドが止まる） |

変更したら、`npm test` でテストを実行してください。点数を変えた結果、ある会社が一度も1位にならなくなった場合なども、テストが失敗して教えてくれます。

---

## 8. 用語のまとめ

| 用語 | 意味 |
|---|---|
| コンポーネント | HTML（JSX）を返す関数。部品 |
| JSX / TSX | JavaScript の中に HTML のような書き方ができる記法。TSX はその TypeScript 版 |
| props | コンポーネントに外から渡す値（関数の引数） |
| state（状態） | コンポーネントが覚えておくデータ。変わると画面が作り直される |
| フック | `useState` など、`use` で始まる React の機能を使うための関数 |
| 再描画（レンダリング） | 状態が変わったときに、React がコンポーネントの関数を実行し直して画面を更新すること |
| アイランド | 静的な HTML のページの中で、一部だけ JavaScript で動かす作り |
| ハイドレーション | ビルド時に作った HTML に、ブラウザで React の処理を結び付けること |
| スロット | 親（Astro）から子（React）に、HTML のかたまりを渡す仕組み |

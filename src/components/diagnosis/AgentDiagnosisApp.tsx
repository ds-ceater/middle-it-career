// 転職エージェント診断の画面（React）
// - Astro からは AgentDiagnosis.astro 経由で使う（ここを直接 MDX に置かない）
// - 判定ロジックとデータは src/lib/diagnosis.ts。このファイルは「表示」と「操作」だけを受け持つ
// - 公式サイトのボタンは Astro 側で AffiliateLink から作られ、名前付きスロット（props）で届く
import { useEffect, useId, useRef, useState, type ReactNode, type SubmitEvent } from 'react';
import {
  QUESTIONS,
  diagnose,
  findUnanswered,
  type Answers,
  type DiagnosisResult,
  type ServiceId,
} from '@/lib/diagnosis';
import './AgentDiagnosisApp.scss';

/** スロット名 = サービス ID。Astro の <AffiliateLink slot="techgo"> が props.techgo になる */
type CtaSlots = Partial<Record<ServiceId, ReactNode>>;

interface Props extends CtaSlots {
  /** 枠の上に出すタイトル。見出しタグは使わない（置かれたページの見出し階層を崩さないため） */
  title?: string;
}

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export default function AgentDiagnosisApp({ title = '転職エージェント診断', ...ctaSlots }: Props) {
  // useId：サーバーとブラウザで同じ値になる ID（label と input の関連付けなどに使う）
  const id = useId();
  const titleId = `${id}-title`;
  const errorId = `${id}-error`;
  const resultTitleId = `${id}-result-title`;
  const inputId = (questionId: string, choiceId: string) => `${id}-${questionId}-${choiceId}`;

  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  /** 「診断する」を押したのに未回答の質問があるときだけ true */
  const [showErrors, setShowErrors] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  /** 「もう一度診断する」で質問に戻ったときだけ、最初の選択肢にフォーカスを戻す */
  const focusFormOnReset = useRef(false);

  const unanswered = findUnanswered(answers);

  // 画面の切り替え後にフォーカスを移す（キーボード・スクリーンリーダー利用者が迷子にならないように）
  // DOM が描画されてから動かす必要があるので useEffect で行う
  useEffect(() => {
    if (result) {
      resultRef.current?.focus();
    } else if (focusFormOnReset.current) {
      focusFormOnReset.current = false;
      const first = QUESTIONS[0];
      document.getElementById(inputId(first.id, first.choices[0].id))?.focus();
    }
    // 結果を出したとき・消したときだけ動けばよいので、依存は result のみ
    // （inputId は id から決まるだけで、描画のたびに変わらない）
  }, [result]);

  function handleChange(questionId: string, choiceId: string) {
    // state は直接書き換えず、新しいオブジェクトを作って渡す（React が変更を検知できるように）
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // ページの再読み込み（フォームの通常の送信）を止める

    if (unanswered.length > 0) {
      setShowErrors(true);
      // 最初の未回答の質問の、最初の選択肢へフォーカスを移す
      const first = unanswered[0];
      document.getElementById(inputId(first.id, first.choices[0].id))?.focus();
      return;
    }

    const next = diagnose(answers);
    setShowErrors(false);
    setResult(next);
    pushDataLayer(answers, next);
  }

  function handleRetry() {
    focusFormOnReset.current = true;
    setAnswers({});
    setResult(null);
  }

  return (
    <section className="agent-diagnosis" aria-labelledby={titleId}>
      <p className="agent-diagnosis__title" id={titleId}>
        {title}
      </p>

      {result ? (
        <div
          className="agent-diagnosis__result"
          ref={resultRef}
          // tabIndex={-1}：Tab では止まらないが、プログラムからはフォーカスできる
          tabIndex={-1}
          aria-labelledby={resultTitleId}
          role="region"
        >
          <p className="agent-diagnosis__result-title" id={resultTitleId}>
            あなたに合う転職エージェントの診断結果
          </p>

          <ol className="agent-diagnosis__ranking">
            {result.ranking.map(({ service, reasons }, i) => (
              <li
                key={service.id}
                className={i === 0 ? 'agent-diagnosis__card agent-diagnosis__card--top' : 'agent-diagnosis__card'}
              >
                <p className="agent-diagnosis__rank">{i === 0 ? '1位 いちばんおすすめ' : `${i + 1}位`}</p>
                <p className="agent-diagnosis__name">{service.name}</p>
                <p className="agent-diagnosis__summary">{service.summary}</p>

                {reasons.length > 0 && (
                  <>
                    <p className="agent-diagnosis__reasons-title">あなたの回答に合う点</p>
                    <ul className="agent-diagnosis__reasons">
                      {reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="agent-diagnosis__actions">
                  {ctaSlots[service.id]}
                  <a className="agent-diagnosis__review" href={service.reviewHref}>
                    {service.name}の評判・口コミを読む
                  </a>
                </div>
              </li>
            ))}
          </ol>

          {result.notes.length > 0 && (
            <div className="agent-diagnosis__notes">
              <p className="agent-diagnosis__notes-title">注意点</p>
              <ul className="agent-diagnosis__notes-list">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="agent-diagnosis__disclaimer">
            ※診断結果は、各社の公式サイトなどの公開情報をもとにした目安です。紹介される求人は、年齢・経験・希望条件によって異なります。複数のサービスに登録して比べることをおすすめします。
          </p>

          <button type="button" className="agent-diagnosis__retry" onClick={handleRetry}>
            もう一度診断する
          </button>
        </div>
      ) : (
        <>
          <p className="agent-diagnosis__lead">
            {QUESTIONS.length}つの質問に答えると、IT専門の転職エージェント3社を、あなたに合う順に表示します。
          </p>

          {/* noValidate：ブラウザ標準のエラー表示ではなく、下の独自のエラー表示を使う */}
          <form className="agent-diagnosis__form" onSubmit={handleSubmit} noValidate>
            {QUESTIONS.map((question, i) => {
              const isMissing = showErrors && unanswered.includes(question);
              return (
                <fieldset key={question.id} className="agent-diagnosis__question">
                  <legend className="agent-diagnosis__legend">
                    <span className="agent-diagnosis__number">Q{i + 1}</span>
                    <span>{question.text}</span>
                    {isMissing && <span className="agent-diagnosis__missing">未回答</span>}
                  </legend>
                  <div className="agent-diagnosis__choices">
                    {question.choices.map((choice) => (
                      // label で input を囲むと、枠のどこを押しても選べる（タップ領域を広く取れる）
                      <label key={choice.id} className="agent-diagnosis__choice">
                        <input
                          className="agent-diagnosis__radio"
                          type="radio"
                          id={inputId(question.id, choice.id)}
                          name={`${id}-${question.id}`}
                          value={choice.id}
                          checked={answers[question.id] === choice.id}
                          onChange={() => handleChange(question.id, choice.id)}
                          aria-describedby={isMissing ? errorId : undefined}
                        />
                        <span>{choice.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}

            {/* role="alert"：表示された瞬間にスクリーンリーダーが読み上げる */}
            {showErrors && unanswered.length > 0 && (
              <p className="agent-diagnosis__error" id={errorId} role="alert">
                未回答の質問があります（{unanswered.map((q) => `Q${QUESTIONS.indexOf(q) + 1}`).join('・')}）。すべて選んでから診断してください。
              </p>
            )}

            <button type="submit" className="agent-diagnosis__submit">
              診断する
            </button>
          </form>
        </>
      )}
    </section>
  );
}

/** 診断の完了を GTM（dataLayer）に通知する。GTM 側で「diagnosis_complete」をトリガーに GA4 へ送る */
function pushDataLayer(answers: Answers, result: DiagnosisResult) {
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: 'diagnosis_complete',
    diagnosis_top: result.ranking[0]?.service.id,
    // 例：current:sier,goal:salary,support:interview,area:capital
    diagnosis_answers: QUESTIONS.map((q) => `${q.id}:${answers[q.id]}`).join(','),
  });
}

// 診断画面（AgentDiagnosisApp.tsx）のテスト
// 利用者と同じように「ラベルの文字で選択肢を探してクリックする」操作でテストする
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AgentDiagnosisApp from './AgentDiagnosisApp';

/** Astro から届く公式サイトのボタン（スロット）の代わり */
const slots = {
  atpro: <a href="https://example.com/atpro">＠PRO人の公式サイトを見る</a>,
  techgo: <a href="https://example.com/techgo">TechGOの公式サイトを見る</a>,
  techclips: <a href="https://example.com/techclips">TechClipsの公式サイトを見る</a>,
  enworld: <a href="https://example.com/enworld">エンワールドの公式サイトを見る</a>,
};

function setup() {
  const user = userEvent.setup();
  render(<AgentDiagnosisApp {...slots} />);
  return { user };
}

/** 4問すべてに答える（TechGO が1位になる組み合わせ） */
async function answerAll(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText('SIer・SESで働いている'));
  await user.click(screen.getByLabelText('年収を上げたい'));
  await user.click(screen.getByLabelText('面接対策をしっかりしてほしい'));
  await user.click(screen.getByLabelText('首都圏（東京・神奈川・埼玉・千葉）'));
}

describe('AgentDiagnosisApp', () => {
  it('最初は4つの質問と「診断する」ボタンが表示される', () => {
    setup();
    // fieldset は role="group"、legend がその名前になる
    expect(screen.getAllByRole('group')).toHaveLength(4);
    expect(screen.getByRole('button', { name: '診断する' })).toBeInTheDocument();
  });

  it('未回答のまま診断すると、エラーを出して最初の未回答の質問にフォーカスする', async () => {
    const { user } = setup();
    await user.click(screen.getByLabelText('SIer・SESで働いている'));
    await user.click(screen.getByRole('button', { name: '診断する' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Q2・Q3・Q4');
    // Q2 の最初の選択肢にフォーカスが移る
    expect(screen.getByLabelText('年収を上げたい')).toHaveFocus();
    // 結果はまだ出ない
    expect(screen.queryByText(/診断結果/)).not.toBeInTheDocument();
  });

  it('全問答えると、合う順の結果と公式サイトのボタンを表示し、結果にフォーカスする', async () => {
    const { user } = setup();
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: '診断する' }));

    const result = screen.getByRole('region', { name: 'あなたに合う転職エージェントの診断結果' });
    expect(result).toHaveFocus();

    const cards = within(result).getAllByRole('listitem').filter((li) => li.className.includes('__card'));
    expect(cards.map((card) => card.querySelector('.agent-diagnosis__name')?.textContent)).toEqual([
      'TechGO（テックゴー）',
      'TechClipsエージェント',
      '＠PRO人',
      'エンワールド（IT・SaaS向け）',
    ]);
    // 1位のカードに、Astro から渡したボタン（スロット）と評判記事へのリンクがある
    expect(within(cards[0]).getByRole('link', { name: 'TechGOの公式サイトを見る' })).toBeInTheDocument();
    expect(within(cards[0]).getByRole('link', { name: /評判・口コミを読む/ })).toHaveAttribute(
      'href',
      '/articles/techgo-agent-review/',
    );
  });

  it('診断が終わると dataLayer にイベントを送る', async () => {
    const { user } = setup();
    window.dataLayer = [];
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: '診断する' }));

    expect(window.dataLayer).toContainEqual({
      event: 'diagnosis_complete',
      diagnosis_top: 'techgo',
      diagnosis_answers: 'current:sier,goal:salary,support:interview,area:capital',
    });
  });

  it('「もう一度診断する」で回答が消え、最初の選択肢にフォーカスが戻る', async () => {
    const { user } = setup();
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: '診断する' }));
    await user.click(screen.getByRole('button', { name: 'もう一度診断する' }));

    const first = screen.getByLabelText('SIer・SESで働いている');
    expect(first).toHaveFocus();
    expect(first).not.toBeChecked();
  });
});

// テストの中で window.dataLayer を型付きで扱うための宣言
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

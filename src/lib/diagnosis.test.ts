// 診断ロジック（src/lib/diagnosis.ts）の単体テスト
import { describe, expect, it } from 'vitest';
import { AFFILIATES } from '@/lib/affiliates';
import { QUESTIONS, SERVICES, diagnose, findUnanswered, type Answers, type ServiceId } from '@/lib/diagnosis';

/** 結果の順位を ID の配列で取り出す（期待値を短く書くため） */
const order = (answers: Answers) => diagnose(answers).ranking.map((r) => r.service.id);

describe('diagnose', () => {
  it('SIer・SESから年収アップ・面接対策重視なら TechGO が1位', () => {
    // techgo: 1 + 2 + 2 = 5 / techclips: 2 + 1 = 3 / atpro: 1
    expect(order({ current: 'sier', goal: 'salary', support: 'interview', area: 'capital' })).toEqual([
      'techgo',
      'techclips',
      'atpro',
    ]);
  });

  it('キャリアを整理したい・丁寧な相談重視なら ＠PRO人 が1位', () => {
    // atpro: 1 + 2 + 2 = 5 / techclips: 1 + 1 = 2 / techgo: 1
    expect(order({ current: 'company', goal: 'plan', support: 'careful', area: 'capital' })).toEqual([
      'atpro',
      'techclips',
      'techgo',
    ]);
  });

  it('SIer・SESから事業会社へ・技術の話が通じる担当者なら TechClips が1位', () => {
    // techclips: 2 + 2 + 2 = 6 / techgo: 1 + 1 + 1 = 3 / atpro: 1
    expect(order({ current: 'sier', goal: 'company', support: 'tech', area: 'capital' })).toEqual([
      'techclips',
      'techgo',
      'atpro',
    ]);
  });

  it('同点のときは SERVICES の並び順になる', () => {
    // 何も答えていなければ全社 0 点
    expect(order({})).toEqual(SERVICES.map((s) => s.id));
  });

  it('選んだ回答の「おすすめの理由」を、質問の順に集める', () => {
    const techgo = diagnose({ current: 'sier', goal: 'salary', support: 'interview', area: 'major' }).ranking.find(
      (r) => r.service.id === 'techgo',
    );
    expect(techgo?.reasons).toEqual([
      'SESから自社開発企業への転職相談にも対応している',
      '年収アップ成功率86％・平均144万円アップを公表している（2026年3月の内定承諾者）',
      '企業ごとの面接対策と、模擬面接を複数回実施している',
      '東京・神奈川のほか、愛知・大阪・福岡の求人も案内している',
    ]);
  });

  it('未経験・地方を選ぶと注意書きが出る', () => {
    const { notes } = diagnose({ current: 'none', goal: 'plan', support: 'careful', area: 'other' });
    expect(notes).toHaveLength(2);
    expect(notes[0]).toContain('未経験');
    expect(notes[1]).toContain('全国');
  });

  it('存在しない選択肢 ID は無視する', () => {
    expect(diagnose({ current: 'unknown' }).ranking.every((r) => r.score === 0)).toBe(true);
  });
});

describe('findUnanswered', () => {
  it('未回答の質問を、質問の順で返す', () => {
    expect(findUnanswered({ goal: 'salary' }).map((q) => q.id)).toEqual(['current', 'support', 'area']);
  });

  it('すべて答えていれば空', () => {
    expect(findUnanswered({ current: 'sier', goal: 'salary', support: 'tech', area: 'capital' })).toEqual([]);
  });
});

// データを書き換えたときの「うっかりミス」を検出するテスト
describe('診断データの整合性', () => {
  const serviceIds = SERVICES.map((s) => s.id);

  it('広告 ID がすべて affiliates.ts に登録されている', () => {
    for (const service of SERVICES) {
      expect(AFFILIATES).toHaveProperty(service.affiliateId);
    }
  });

  it('選択肢 ID が質問の中で重複していない', () => {
    for (const q of QUESTIONS) {
      const ids = q.choices.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('おすすめの理由は、加点しているサービスにだけ書かれている', () => {
    for (const q of QUESTIONS) {
      for (const c of q.choices) {
        for (const id of Object.keys(c.reasons ?? {}) as ServiceId[]) {
          expect(serviceIds).toContain(id);
          expect(c.points[id] ?? 0, `${q.id}/${c.id} の ${id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('どのサービスも、いずれかの回答の組み合わせで単独1位になれる', () => {
    // 全組み合わせ（3 × 4 × 3 × 3 = 108 通り）を試す。加点の調整で、ある会社が一度も1位にならなくなるのを防ぐ
    const combos = QUESTIONS.reduce<Answers[]>(
      (acc, q) => acc.flatMap((a) => q.choices.map((c) => ({ ...a, [q.id]: c.id }))),
      [{}],
    );
    const winners = new Set(
      combos.map((a) => diagnose(a).ranking).filter((r) => r[0].score > r[1].score).map((r) => r[0].service.id),
    );
    expect([...winners].sort()).toEqual([...serviceIds].sort());
  });
});

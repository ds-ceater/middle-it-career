// 転職エージェント診断の「データ」と「判定ロジック」
// - 画面（React）から切り離した普通の関数にして、単体テストしやすくする
// - 各社の向き・不向きは評判記事の内容に合わせる（記事と診断結果が食い違わないように）
//   評判記事がないサービス（エンワールド）は、紹介している記事の内容と広告主の提供情報に合わせる
// - 質問や加点を変えたいときは、このファイルの QUESTIONS だけを直せばよい
import type { AffiliateId } from '@/lib/affiliates';

/** 診断の対象サービス。Astro の名前付きスロット名にも使うので、ハイフンなしの英小文字にする */
export type ServiceId = 'atpro' | 'techgo' | 'techclips' | 'enworld';

export interface Service {
  id: ServiceId;
  name: string;
  /** 公式サイトへのリンクに使う広告 ID（src/lib/affiliates.ts） */
  affiliateId: AffiliateId;
  /** 広告の出し方。テキスト素材がなくバナーだけの案件は 'banner'（省略時は 'button'） */
  affiliateVariant?: 'button' | 'banner';
  /** 評判記事の URL */
  reviewHref?: string;
  /** 評判記事がない場合に、紹介している記事（の節）の URL */
  detailHref?: string;
  /** 結果に出す一言の特徴 */
  summary: string;
}

/** 並び順は同点のときの順位にもなる */
export const SERVICES: readonly Service[] = [
  {
    id: 'atpro',
    name: '＠PRO人',
    affiliateId: 'at-pro-jin',
    reviewHref: '/articles/at-pro-jin-review/',
    summary: 'IT・Web業界特化。少数担当制で時間をかけて相談に乗り、求人を厳選して紹介',
  },
  {
    id: 'techgo',
    name: 'TechGO（テックゴー）',
    affiliateId: 'techgo',
    reviewHref: '/articles/techgo-agent-review/',
    summary: 'ITエンジニア専門。年収アップを重視したハイクラス求人と、手厚い面接対策',
  },
  {
    id: 'techclips',
    name: 'TechClipsエージェント',
    affiliateId: 'techclips',
    reviewHref: '/articles/techclips-agent-review/',
    summary: 'ITエンジニア専門。現役エンジニア出身の担当者が、年収500万円以上の事業会社求人を紹介',
  },
  {
    // アクセストレード。外資系向けの「エンワールド」とは別のプログラム（IT・SaaS系の日系成長企業向け）
    id: 'enworld',
    name: 'エンワールド（IT・SaaS向け）',
    affiliateId: 'enworld-banner-300x250',
    affiliateVariant: 'banner',
    detailHref: '/articles/it-specialist-recruitment-agents/#10-エンワールドitsaas向け',
    summary: 'IT・SaaS系の成長企業（日系）への転職を支援。経営層とのつながりを活かし、将来性のある企業を紹介',
  },
];

export interface Choice {
  /** 質問の中で一意な ID */
  id: string;
  label: string;
  /** この回答を選んだときの、サービスごとの加点（書いていないサービスは 0 点） */
  points: Partial<Record<ServiceId, number>>;
  /** 加点したサービスの結果に表示する「おすすめの理由」 */
  reasons?: Partial<Record<ServiceId, string>>;
  /** この回答を選んだ人に、結果の下に出す注意書き */
  note?: string;
}

export interface Question {
  id: string;
  text: string;
  choices: readonly Choice[];
}

export const QUESTIONS: readonly Question[] = [
  {
    id: 'current',
    text: '今のお仕事に近いものは？',
    choices: [
      {
        id: 'sier',
        label: 'SIer・SESで働いている',
        points: { techclips: 2, techgo: 1 },
        reasons: {
          techclips: 'SIer・SESから事業会社・自社開発企業への転職支援に強みがある',
          techgo: 'SESから自社開発企業への転職相談にも対応している',
        },
      },
      {
        id: 'company',
        label: '事業会社・自社開発企業・社内SEで働いている',
        points: { atpro: 1, techgo: 1, techclips: 1, enworld: 1 },
        reasons: { enworld: 'IT系・デジタル系の企業で働いた経験がある人に向けたサービス' },
      },
      {
        id: 'none',
        label: 'ITの実務経験はない',
        points: { atpro: 2 },
        reasons: { atpro: 'IT業界未経験者向けの相談窓口がある' },
        note: '4社とも、実務経験者向けの求人が中心です。未経験の場合は、未経験者向けの求人を多く扱うサービスも併用しましょう。',
      },
    ],
  },
  {
    id: 'goal',
    text: '転職で一番かなえたいことは？',
    choices: [
      {
        id: 'salary',
        label: '年収を上げたい',
        points: { techgo: 2, techclips: 1 },
        reasons: {
          techgo: '年収アップ成功率86％・平均144万円アップを公表している（2026年3月の内定承諾者）',
          techclips: '年収500万円以上の求人を中心に紹介している',
        },
      },
      {
        id: 'upstream',
        label: '上流工程・PM・ITコンサルタントに進みたい',
        points: { techgo: 2, techclips: 2 },
        reasons: {
          techgo: 'PM・PMO・ITコンサルタントの求人も扱っている',
          techclips: 'エンジニアからITコンサルタントへの転職支援の実績がある',
        },
      },
      {
        id: 'company',
        label: '事業会社・自社開発企業に移りたい',
        points: { techclips: 2, techgo: 1, enworld: 1 },
        reasons: {
          techclips: '紹介先は事業会社が中心',
          techgo: 'メガベンチャーや大手事業会社、自社開発企業の求人を扱っている',
          enworld: 'IT・SaaS系の成長企業の求人を扱っている',
        },
      },
      {
        id: 'growth',
        label: '成長企業・ベンチャーで力を試したい',
        points: { enworld: 2 },
        reasons: { enworld: 'ベンチャーキャピタルや監査法人と連携し、将来性のある日系企業を紹介している' },
      },
      {
        id: 'plan',
        label: 'まずはキャリアの方向性を整理したい',
        points: { atpro: 2, techclips: 1 },
        reasons: {
          atpro: '初回のキャリア相談に平均約2時間をかけ、経験や希望を詳しく整理できる',
          techclips: '転職するかどうかも含めたキャリア相談を案内している',
        },
      },
    ],
  },
  {
    id: 'support',
    text: '担当者に一番求めることは？',
    choices: [
      {
        id: 'tech',
        label: '技術の話が通じること',
        points: { techclips: 2, atpro: 1, techgo: 1 },
        reasons: {
          techclips: '現役エンジニア出身のキャリアコンサルタントが担当する',
          atpro: 'IT業界に詳しいキャリアアドバイザーに相談できる',
          techgo: 'メガベンチャーのIT部門やITコンサル出身のアドバイザーが在籍している',
        },
      },
      {
        id: 'interview',
        label: '面接対策をしっかりしてほしい',
        points: { techgo: 2, atpro: 1 },
        reasons: {
          techgo: '企業ごとの面接対策と、模擬面接を複数回実施している',
          atpro: '応募先を絞り込み、一社ごとに選考対策を進められる',
        },
      },
      {
        id: 'careful',
        label: '時間をかけて丁寧に相談に乗ってほしい',
        points: { atpro: 2 },
        reasons: { atpro: '担当者1人あたりの担当人数を最大10名に制限する少数担当制' },
      },
      {
        id: 'insider',
        label: '企業の内情まで詳しく教えてほしい',
        points: { enworld: 2 },
        reasons: { enworld: '企業の経営層と直接やり取りしており、社内の事情に詳しい' },
      },
    ],
  },
  {
    id: 'area',
    text: '希望の勤務地は？',
    choices: [
      {
        id: 'capital',
        label: '首都圏（東京・神奈川・埼玉・千葉）',
        // ＠PRO人・TechGO・TechClips は首都圏が中心なので差を付けない（エンワールドは対応地域の情報がないので、どの選択肢でも加点しない）
        points: {},
      },
      {
        id: 'major',
        label: '愛知・大阪・福岡',
        points: { techgo: 2 },
        reasons: { techgo: '東京・神奈川のほか、愛知・大阪・福岡の求人も案内している' },
        note: '＠PRO人とTechClipsエージェントは、首都圏の求人が中心です。',
      },
      {
        id: 'other',
        label: 'その他の地域・フルリモート希望',
        points: { techgo: 1 },
        reasons: { techgo: 'リモート・フルリモート勤務の求人も掲載している' },
        note: '＠PRO人・TechGO・TechClipsエージェントは都市部の求人が中心です。希望地域の求人があるかを登録時に確認し、全国の求人を扱うサービスも併用しましょう。',
      },
    ],
  },
];

/** 質問 ID → 選んだ選択肢 ID。未回答の質問はキーがない */
export type Answers = Readonly<Record<string, string | undefined>>;

export interface ServiceResult {
  service: Service;
  score: number;
  reasons: string[];
}

export interface DiagnosisResult {
  /** 点数の高い順。同点なら SERVICES の並び順 */
  ranking: ServiceResult[];
  notes: string[];
}

/** まだ答えていない（または不正な回答の）質問を、QUESTIONS の順で返す */
export function findUnanswered(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.choices.some((c) => c.id === answers[q.id]));
}

export function diagnose(answers: Answers): DiagnosisResult {
  // 各質問で選ばれた選択肢だけを取り出す
  const chosen = QUESTIONS.flatMap((q) => {
    const choice = q.choices.find((c) => c.id === answers[q.id]);
    return choice ? [choice] : [];
  });

  const ranking = SERVICES.map((service) => ({
    service,
    score: chosen.reduce((sum, c) => sum + (c.points[service.id] ?? 0), 0),
    reasons: chosen.flatMap((c) => c.reasons?.[service.id] ?? []),
  }))
    // Array.prototype.sort は安定ソート（ES2019〜）なので、同点なら SERVICES の並び順のまま
    .sort((a, b) => b.score - a.score);

  const notes = chosen.flatMap((c) => c.note ?? []);

  return { ranking, notes };
}

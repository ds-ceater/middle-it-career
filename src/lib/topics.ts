// 記事のテーマ別グループ（カテゴリ一覧ページ /category/<id>/ の元データ）
// - トップページのカテゴリセクション、フッター、記事末尾の「関連記事」もここを参照する
// - articles は一覧ページに並べる順。記事を追加したら、合うテーマの articles に slug（フォルダ名）を足す
// - tags はトップページのタグボタン（トップに出すテーマだけ）
// ※ frontmatter の category（転職サイト／転職エージェント／ノウハウ）とは別の分類

export interface TopicTag {
  label: string;
  slug: string;
}

export interface Topic {
  id: string;
  title: string;
  lead: string;
  articles: string[];
  tags?: TopicTag[];
}

export const TOPICS = [
  {
    id: 'service-comparison',
    title: '転職サービス比較',
    lead: '40代・50代のIT転職に役立つ転職エージェント・転職サービスを比較します。',
    articles: [
      'it-recruitment-services-ranking',
      'it-specialist-recruitment-agents',
      'management-project-manager-recruitment-agents',
      'mid-career-executive-recruitment-services',
      'freelance-agents-for-mid-career',
    ],
  },
  {
    id: 'age-guide',
    title: '年代別キャリアガイド',
    lead: '40代・50代・55歳以降、それぞれの年代に合ったIT転職・キャリアの考え方を解説します。',
    articles: [
      '40s-it-career-guide',
      '50s-it-career-guide',
      'it-career-after-55',
      '50s-it-career-change',
      'post-management-retirement-career',
    ],
  },
  {
    id: 'job-guide',
    title: '職種別キャリアガイド',
    lead: 'あなたの経験を活かせる仕事を見つけましょう。',
    articles: [
      '40s-50s-software-engineer-career',
      '40s-50s-infrastructure-cloud-career',
      '40s-50s-project-manager-career',
      '40s-50s-in-house-it-career',
      '40s-50s-it-consultant-management-career',
      'it-management-career-options',
    ],
    tags: [
      { label: 'SE・PG', slug: '40s-50s-software-engineer-career' },
      { label: 'インフラ・クラウド', slug: '40s-50s-infrastructure-cloud-career' },
      { label: 'PM・PL', slug: '40s-50s-project-manager-career' },
      { label: '社内SE・情シス', slug: '40s-50s-in-house-it-career' },
      { label: 'コンサル・管理職', slug: '40s-50s-it-consultant-management-career' },
    ],
  },
  {
    id: 'work-guide',
    title: '年収・働き方ガイド',
    lead: '年収とライフスタイルのバランスを考えましょう。',
    articles: [
      '40s-50s-it-salary-by-job',
      'mid-career-it-salary-increase',
      'maintain-salary-it-career-change',
      '40s-50s-remote-it-jobs',
      'it-employment-types-comparison',
      '40s-50s-freelance-engineer-guide',
      'career-change-vs-freelancing',
    ],
    tags: [
      { label: '年収相場', slug: '40s-50s-it-salary-by-job' },
      { label: '年収アップ戦略', slug: 'mid-career-it-salary-increase' },
      { label: 'リモートワーク', slug: '40s-50s-remote-it-jobs' },
      { label: '雇用形態の比較', slug: 'it-employment-types-comparison' },
      { label: '独立・フリーランス', slug: '40s-50s-freelance-engineer-guide' },
    ],
  },
  {
    id: 'knowhow',
    title: '転職ノウハウ',
    lead: '転職活動を成功させるための実践的な情報をお届けします。',
    articles: [
      '40s-50s-it-resume-writing',
      'mid-career-it-interview-guide',
      '40s-50s-it-job-search-process',
      'mid-career-recruitment-agent-guide',
      'mid-career-it-engineer-reskilling',
    ],
    tags: [
      { label: '職務経歴書の書き方', slug: '40s-50s-it-resume-writing' },
      { label: '面接対策', slug: 'mid-career-it-interview-guide' },
      { label: '転職活動の進め方', slug: '40s-50s-it-job-search-process' },
      { label: 'エージェントの活用', slug: 'mid-career-recruitment-agent-guide' },
    ],
  },
] as const satisfies readonly Topic[];

export type TopicId = (typeof TOPICS)[number]['id'];

export const topicHref = (id: string) => `/category/${id}/`;
export const articleHref = (slug: string) => `/articles/${slug}/`;

/** 記事が属するテーマ（複数可） */
export const topicsOf = (slug: string): Topic[] =>
  TOPICS.filter((t) => (t.articles as readonly string[]).includes(slug));

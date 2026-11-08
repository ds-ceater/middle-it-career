export const SITE = {
  name: 'ミドルITキャリア',
  description: 'ミドル世代のIT職の転職を、現場経験者の視点で解説する転職情報サイト。', // TODO: 確定文言に
  locale: 'ja_JP',
  lang: 'ja',
  ogImage: '/og-default.png', // TODO: public/ に 1200x630 で配置
  author: 'ミドルITキャリア編集部',
} as const;

// グローバルナビ（Figma: header__nav）。トップページ内の各セクションへのリンク。
// TODO: カテゴリ別の一覧ページを作ったら、そちらへのリンクに差し替える
export const NAV = [
  { href: '/#service', label: '転職サービス比較' },
  { href: '/#age-40', label: '40代の転職' },
  { href: '/#age-50', label: '50代の転職' },
  { href: '/#job-guide', label: '職種別キャリア' },
  { href: '/#knowhow', label: '転職ノウハウ' },
] as const;

// フッターナビ（Figma: footer__nav）
export const FOOTER_NAV = [
  { href: '/about/', label: '運営情報' },
  { href: '/about/#運営目的', label: '当サイトについて' },
  { href: '/contact/', label: 'お問い合わせ' },
  { href: '/privacy/', label: 'プライバシーポリシー' },
  { href: '/privacy/#広告の掲載について', label: '広告掲載について' },
] as const;

export const CATEGORIES = ['転職サイト', '転職エージェント', 'ノウハウ'] as const;

export const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

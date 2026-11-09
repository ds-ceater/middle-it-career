// アフィリエイト案件の一元管理。ASP の審査通過後に URL を差し替える。
// 記事内では <AffiliateLink id="sample-agent" /> のように ID で参照する。
export const AFFILIATES = {
  'sample-agent': {
    label: 'サンプル転職エージェント公式サイト',
    url: 'https://example.com/', // TODO: ASP 発行のリンクに差し替え
    asp: 'A8.net',
    pixel: undefined as string | undefined,
  },
  'at-pro-jin': {
    label: '＠PRO人',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BGGBI+7BR1RM+4GWI+BX3J6',
    asp: 'A8.net',
    pixel: 'https://www12.a8.net/0.gif?a8mat=4BGGBI+7BR1RM+4GWI+BX3J6',
  },
} as const satisfies Record<string, { label: string; url: string; asp: string; pixel?: string }>;

export type AffiliateId = keyof typeof AFFILIATES;

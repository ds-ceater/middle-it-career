// アフィリエイト案件の一元管理。ASP の審査通過後に URL を差し替える。
// 記事内では <AffiliateLink id="sample-agent" /> のように ID で参照する。
export const AFFILIATES = {
  'sample-agent': {
    label: 'サンプル転職エージェント公式サイト',
    url: 'https://example.com/', // TODO: ASP 発行のリンクに差し替え
    asp: 'A8.net',
    pixel: undefined as string | undefined,
  },
} as const satisfies Record<string, { label: string; url: string; asp: string; pixel?: string }>;

export type AffiliateId = keyof typeof AFFILIATES;

interface AffiliateItem {
  label: string;
  url: string;
  asp: string;
  pixel?: string;
  /** バナー広告の画像（variant="banner" で使う） */
  banner?: { src: string; width: number; height: number; alt: string };
}

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
  // バナー広告。画像は ASP のサーバーから直接読み込む（表示回数の計測に使われるため、ダウンロードして置き換えない）
  'at-pro-jin-banner': {
    label: '＠PRO人',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BGGBI+7BR1RM+4GWI+BZVU9',
    asp: 'A8.net',
    pixel: 'https://www14.a8.net/0.gif?a8mat=4BGGBI+7BR1RM+4GWI+BZVU9',
    banner: {
      src: 'https://www27.a8.net/svt/bgt?aid=261108126443&wid=001&eno=01&mid=s00000020853002015000&mc=1',
      width: 300,
      height: 250,
      alt: 'IT専門転職エージェント＠PRO人（アットプロジン）公式サイト',
    },
  },
  'at-pro-jin-banner-468x120': {
    label: '＠PRO人',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BGGBI+7BR1RM+4GWI+BY641',
    asp: 'A8.net',
    pixel: 'https://www12.a8.net/0.gif?a8mat=4BGGBI+7BR1RM+4GWI+BY641',
    banner: {
      src: 'https://www24.a8.net/svt/bgt?aid=261108126443&wid=001&eno=01&mid=s00000020853002007000&mc=1',
      width: 468,
      height: 120,
      alt: 'IT専門転職エージェント＠PRO人（アットプロジン）公式サイト',
    },
  },
  'at-pro-jin-banner-250x250': {
    label: '＠PRO人',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BGGBI+7BR1RM+4GWI+BYDTT',
    asp: 'A8.net',
    pixel: 'https://www10.a8.net/0.gif?a8mat=4BGGBI+7BR1RM+4GWI+BYDTT',
    banner: {
      src: 'https://www22.a8.net/svt/bgt?aid=261108126443&wid=001&eno=01&mid=s00000020853002008000&mc=1',
      width: 250,
      height: 250,
      alt: 'IT専門転職エージェント＠PRO人（アットプロジン）公式サイト',
    },
  },
  'at-pro-jin-banner-240x120': {
    label: '＠PRO人',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BGGBI+7BR1RM+4GWI+BXQOH',
    asp: 'A8.net',
    pixel: 'https://www15.a8.net/0.gif?a8mat=4BGGBI+7BR1RM+4GWI+BXQOH',
    banner: {
      src: 'https://www21.a8.net/svt/bgt?aid=261108126443&wid=001&eno=01&mid=s00000020853002005000&mc=1',
      width: 240,
      height: 120,
      alt: 'IT専門転職エージェント＠PRO人（アットプロジン）公式サイト',
    },
  },
  'at-pro-jin-banner-320x50': {
    label: '＠PRO人',
    url: 'https://px.a8.net/svt/ejp?a8mat=4BGGBI+7BR1RM+4GWI+BZO4H',
    asp: 'A8.net',
    pixel: 'https://www12.a8.net/0.gif?a8mat=4BGGBI+7BR1RM+4GWI+BZO4H',
    banner: {
      src: 'https://www23.a8.net/svt/bgt?aid=261108126443&wid=001&eno=01&mid=s00000020853002014000&mc=1',
      width: 320,
      height: 50,
      alt: 'IT専門転職エージェント＠PRO人（アットプロジン）公式サイト',
    },
  },
} as const satisfies Record<string, AffiliateItem>;

export type AffiliateId = keyof typeof AFFILIATES;

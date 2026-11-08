// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://middle-it-career.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [mdx(), react(), sitemap()],
  image: {
    // 記事本文の Markdown 画像（![alt](./xxx.png)）にも、画面幅に応じた複数サイズ（srcset）を自動生成する。
    // 表示幅は本文の最大幅（760px）まで。高解像度画面用に 1520px まで作る
    layout: 'constrained',
    breakpoints: [400, 760, 1520],
  },
  // Web フォント：ビルド時に Google Fonts から取得し、自サーバーから配信（閲覧時に Google へ通信しない）
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Noto Sans JP',
      cssVariable: '--font-noto-sans-jp',
      // 可変フォントなので範囲指定にすると @font-face が太さごとに重複しない。
      // 実際に使う太さは _tokens.scss の --font-weight-regular / bold / black（400 / 700 / 900）
      weights: ['400 900'],
      styles: ['normal'],
      fallbacks: ['sans-serif'],
    },
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // 全SCSS（.astro の <style lang="scss"> 含む）で変数・mixin を使えるようにする
          loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))],
          additionalData: `@use "abstracts" as *;\n`,
        },
      },
    },
  },
});

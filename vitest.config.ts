/// <reference types="vitest/config" />
// テスト（Vitest）の設定。npm test で実行する
// getViteConfig：astro.config.mjs の設定（@/ のパス指定・SCSS の共通設定など）をテストでも使う
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // React コンポーネントのテストのために、ブラウザの DOM を再現する jsdom で動かす
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

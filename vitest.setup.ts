// 各テストファイルの前に読み込まれる準備用ファイル（vitest.config.ts の setupFiles）
import '@testing-library/jest-dom/vitest'; // toBeInTheDocument() などの DOM 用の判定を使えるようにする
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// テストごとに描画した画面を片付ける（前のテストの画面が残らないように）
afterEach(() => {
  cleanup();
});

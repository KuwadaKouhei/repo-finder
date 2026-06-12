import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { server } from "./msw/server";

// --- jsdom に無いブラウザ API のポリフィル（テスト環境のみの措置） ---
beforeAll(() => {
  // Radix UI (shadcn) が依存する Pointer Events / scrollIntoView
  Element.prototype.hasPointerCapture =
    Element.prototype.hasPointerCapture ?? (() => false);
  Element.prototype.setPointerCapture =
    Element.prototype.setPointerCapture ?? (() => {});
  Element.prototype.releasePointerCapture =
    Element.prototype.releasePointerCapture ?? (() => {});
  Element.prototype.scrollIntoView =
    Element.prototype.scrollIntoView ?? (() => {});

  // next-themes が依存する matchMedia（jsdom 未実装）
  // matches: false 固定 = OS設定は常に light として扱う（テストの決定性を優先）
  window.matchMedia =
    window.matchMedia ??
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(), // 旧API（ライブラリによっては参照する）
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
});

// --- MSW ---
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
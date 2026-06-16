"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // SSR とクライアントでテーマが異なるため、マウント後にのみ実テーマを描画する
  // （ハイドレーション不一致回避の定石。マウント検知のための意図的な setState）
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // マウント前はサーバーとクライアントでテーマが一致しないためプレースホルダを描画
  if (!mounted) {
    return (
      <div
        aria-hidden
        className="size-10 rounded-md border border-border bg-card shadow-[var(--shadow-card)]"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // View Transitions 非対応 / モーション低減時は即時切替
    if (!document.startViewTransition || reduce) {
      setTheme(next);
      return;
    }

    // トグルボタンを中心に円形リビール
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 600,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      title={isDark ? "ライトモード" : "ダークモード"}
      className="grid size-10 cursor-pointer place-items-center overflow-hidden rounded-md border border-border bg-card text-foreground shadow-[var(--shadow-card)] transition-colors hover:border-border-strong hover:bg-muted"
    >
      <span
        className="grid place-items-center transition-transform duration-[450ms] ease-[var(--ease-spring)]"
        style={{ transform: isDark ? "rotate(0deg)" : "rotate(-90deg)" }}
      >
        {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
      </span>
    </button>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Repository } from "@/domain/repository";
import { CountUp } from "@/components/count-up";
import { RepositoryList } from "./repository-list";
import { ViewToggle } from "./view-toggle";
import { SortControl } from "./sort-control";
import { Pagination } from "./pagination";

export type View = "list" | "grid";

const STORAGE_KEY = "repo-finder:view";

type Props = {
  repositories: Repository[];
  totalCount: number;
  currentPage: number;
};

export function ResultsView({ repositories, totalCount, currentPage }: Props) {
  // SSRとの整合のため初期値は固定（list）。マウント後にlocalStorageを反映する
  const [view, setView] = useState<View>("list");
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRects = useRef<Map<string, DOMRect> | null>(null);

  useEffect(() => {
    // localStorage はクライアント専用のため、マウント後に個人設定を反映する
    // （初期値は SSR と一致させるため list 固定。意図的な setState）
    const saved = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "grid") setView("grid");
  }, []);

  const handleChange = (next: View) => {
    if (next === view) return;
    // FLIP: レイアウト変更前のカード位置を記録
    const el = containerRef.current;
    if (el) {
      const rects = new Map<string, DOMRect>();
      el.querySelectorAll<HTMLElement>("[data-repo-id]").forEach((node) => {
        rects.set(node.dataset.repoId ?? "", node.getBoundingClientRect());
      });
      flipRects.current = rects;
    }
    setView(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  // 記録した旧位置から新位置へ各カードをアニメーションさせる（FLIP）
  useLayoutEffect(() => {
    const prev = flipRects.current;
    if (!prev) return;
    flipRects.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = containerRef.current;
    if (!el) return;
    // Element.animate 未実装環境（jsdom 等）では FLIP をスキップ
    if (typeof el.animate !== "function") return;
    el.querySelectorAll<HTMLElement>("[data-repo-id]").forEach((node) => {
      const old = prev.get(node.dataset.repoId ?? "");
      if (!old) return;
      const now = node.getBoundingClientRect();
      const dx = old.left - now.left;
      const dy = old.top - now.top;
      const sx = now.width ? old.width / now.width : 1;
      const sy = now.height ? old.height / now.height : 1;
      if (
        Math.abs(dx) < 1 &&
        Math.abs(dy) < 1 &&
        Math.abs(sx - 1) < 0.01 &&
        Math.abs(sy - 1) < 0.01
      ) {
        return;
      }
      node.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
            transformOrigin: "top left",
          },
          { transform: "none", transformOrigin: "top left" },
        ],
        { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    });
  }, [view]);

  return (
    <>
      <div className="mt-[34px] mb-[22px] flex flex-wrap items-center gap-3.5">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-extrabold text-foreground">
            <CountUp value={totalCount} />
          </span>{" "}
          件のリポジトリ
        </p>
        <div className="ml-auto flex items-center gap-3">
          <SortControl />
          <ViewToggle view={view} onChange={handleChange} />
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        label="ページ送り（上部）"
        className="mb-[22px]"
      />
      <div ref={containerRef}>
        <RepositoryList repositories={repositories} view={view} />
      </div>
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        label="ページ送り（下部）"
      />
    </>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ArrowLeft } from "lucide-react";

const PER_PAGE = 30;
const MAX_RESULTS = 1000; // GitHub Search API の取得上限

type Props = {
  currentPage: number;
  totalCount: number;
  /** 余白などを上書きする追加クラス。未指定時は下部用の上マージン */
  className?: string;
  /** nav の aria-label（上部/下部を区別するため）。既定は「ページ送り」 */
  label?: string;
};

/** 先頭・末尾・現在ページ周辺を残し、離れた箇所は省略（…）にする */
function buildPageItems(current: number, total: number): (number | "gap")[] {
  const keep = new Set<number>([
    1,
    total,
    current - 1,
    current,
    current + 1,
  ]);
  const sorted = [...keep]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) items.push("gap");
    items.push(p);
    prev = p;
  }
  return items;
}

const pillBase =
  "grid h-[42px] min-w-[42px] place-items-center rounded-md border px-1.5 font-mono text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-40";
const pillInactive =
  "border-border bg-card text-foreground shadow-[var(--shadow-card)] hover:-translate-y-px hover:border-border-strong hover:bg-muted";
const pillActive =
  "border-transparent bg-primary text-primary-foreground shadow-[var(--shadow-card-md)]";

export function Pagination({
  currentPage,
  totalCount,
  className,
  label = "ページ送り",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 1000件上限でクランプ（per_page=30 で最大34ページ）
  const totalPages = Math.ceil(Math.min(totalCount, MAX_RESULTS) / PER_PAGE);

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    startTransition(() => {
      router.replace(`/?${params.toString()}`);
    });
  };

  const items = buildPageItems(currentPage, totalPages);

  return (
    <nav
      aria-label={label}
      className={`flex items-center justify-center gap-2 ${className ?? "mt-[38px]"}`}
    >
      <button
        type="button"
        aria-label="前へ"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className={`${pillBase} ${pillInactive}`}
      >
        <ArrowLeft className="size-4" />
      </button>

      {items.map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => goTo(item)}
            disabled={isPending}
            aria-current={item === currentPage ? "page" : undefined}
            className={`${pillBase} ${item === currentPage ? pillActive : pillInactive}`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        aria-label="次へ"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages || isPending}
        className={`${pillBase} ${pillInactive}`}
      >
        <ArrowLeft className="size-4 rotate-180" />
      </button>
    </nav>
  );
}

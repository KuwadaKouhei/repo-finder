"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

const PER_PAGE = 30;
const MAX_RESULTS = 1000; // GitHub Search API の取得上限

type Props = {
  currentPage: number;
  totalCount: number;
};

export function Pagination({ currentPage, totalCount }: Props) {
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

  return (
    <nav aria-label="ページ送り" className="mt-6 flex items-center justify-center gap-4">
      <Button
        variant="outline"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
      >
        前へ
      </Button>
      <span className="text-sm text-muted-foreground" aria-current="page">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages || isPending}
      >
        次へ
      </Button>
    </nav>
  );
}
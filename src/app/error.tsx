"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error;
  reset: () => void;
};

export default function Error({ reset }: Props) {
  return (
    <main className="mx-auto flex max-w-[920px] flex-col items-center gap-4 px-6 py-24 text-center">
      <div className="empty-icon mb-2 grid size-[76px] place-items-center rounded-[22px] bg-destructive/10 text-destructive">
        <AlertTriangle aria-hidden className="size-8" />
      </div>
      <h2 className="text-lg font-bold">データの取得に失敗しました</h2>
      <p className="text-sm text-muted-foreground">
        時間をおいて再試行してください。連続して検索した場合は、APIの利用制限に達している可能性があります。
      </p>
      <Button
        type="button"
        variant="none"
        size="none"
        onClick={reset}
        className="mt-2 inline-flex h-11 cursor-pointer items-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] transition-colors hover:border-border-strong hover:bg-muted"
      >
        再試行
      </Button>
    </main>
  );
}

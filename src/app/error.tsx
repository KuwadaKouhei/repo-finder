"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type Props = {
  error: Error;
  reset: () => void;
};

export default function Error({ reset }: Props) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 p-6 py-16 text-center">
      <AlertCircle aria-hidden className="size-10 text-destructive" />
      <h2 className="text-lg font-bold">データの取得に失敗しました</h2>
      <p className="text-sm text-muted-foreground">
        時間をおいて再試行してください。連続して検索した場合は、APIの利用制限に達している可能性があります。
      </p>
      <Button onClick={reset} variant="outline">
        再試行
      </Button>
    </main>
  );
}
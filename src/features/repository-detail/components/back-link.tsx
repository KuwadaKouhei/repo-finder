"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasNavigatedInApp } from "@/lib/in-app-navigation";

export function BackLink() {
  const router = useRouter();

  // 一覧から遷移して来た場合のみ戻るボタンを表示する。直アクセス・リロード・外部流入は
  // フルロードでフラグが立たないため非表示（戻り先が無いため）。ホームへはヘッダーロゴで戻れる。
  if (!hasNavigatedInApp()) {
    return null;
  }

  const handleClick = () => {
    // 一覧から来ているので、直前のページ（前の検索一覧）へ戻る。
    router.back();
  };

  return (
    <Button
      type="button"
      variant="none"
      size="none"
      onClick={handleClick}
      aria-label="前のページに戻る"
      className="inline-flex cursor-pointer items-center gap-2.5 rounded-md border border-border bg-card py-2.5 pr-4 pl-3 text-[13.5px] font-semibold text-foreground shadow-[var(--shadow-card)] transition-[transform,border-color] duration-200 ease-[var(--ease-spring)] hover:-translate-x-[3px] hover:border-[var(--brand-ring)]"
    >
      <ArrowLeft aria-hidden className="size-4" />
      戻る
    </Button>
  );
}
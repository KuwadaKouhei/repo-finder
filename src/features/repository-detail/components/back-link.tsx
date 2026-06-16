"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackLink() {
  const router = useRouter();

  const handleClick = () => {
    // 履歴が2件以上あれば直前のページ（検索結果）へ戻る。
    // 直アクセス（新規タブ等）で履歴がなければトップへ。
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
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
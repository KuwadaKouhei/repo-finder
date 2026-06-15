"use client";

import { useRouter } from "next/navigation";

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
    <button
      type="button"
      onClick={handleClick}
      className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
    >
      ← 検索に戻る
    </button>
  );
}
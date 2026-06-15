import { Sparkles } from "lucide-react";

/** 検索前（キーワード未確定）の促し表示 */
export function SearchPromptState() {
  return (
    <div className="animate-pop-in py-20 text-center">
      <div className="empty-icon mx-auto mb-[22px] grid size-[76px] place-items-center rounded-[22px] bg-[var(--brand-soft)] text-[var(--brand-strong)]">
        <Sparkles className="size-8" />
      </div>
      <p className="mb-2 text-xl font-bold">キーワードを入力して検索してみましょう</p>
      <p className="text-[15px] text-muted-foreground">
        リポジトリ名・説明・トピックから検索できます。
      </p>
    </div>
  );
}

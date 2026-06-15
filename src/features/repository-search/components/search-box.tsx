"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (!query) return; // 空・空白のみは検索しない（要件 §3.1）

    const params = new URLSearchParams(searchParams);
    params.set("q", query);
    params.delete("page"); // 新規検索は1ページ目から

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full gap-3">
      <div className="relative flex flex-1 items-center rounded-xl border-[1.5px] border-border bg-card pl-[18px] shadow-[var(--shadow-card)] transition-all duration-300 focus-within:border-primary focus-within:shadow-[0_0_0_4px_var(--brand-ring),var(--shadow-card-md)]">
        <Search
          aria-hidden
          className="size-5 shrink-0 text-muted-foreground"
        />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="リポジトリ名を入力してください"
          aria-label="リポジトリを検索"
          className="flex-1 bg-transparent px-3.5 py-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="入力をクリア"
            className="mr-3 grid size-[26px] shrink-0 place-items-center rounded-full bg-muted text-base text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-[58px] shrink-0 items-center gap-2 rounded-xl bg-primary px-[26px] text-base font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-[transform,filter] duration-200 ease-[var(--ease-spring)] hover:brightness-[1.07] active:scale-[0.96] disabled:opacity-60"
      >
        <Search aria-hidden className="size-[18px]" />
        {isPending ? "検索中…" : "検索"}
      </button>
    </form>
  );
}

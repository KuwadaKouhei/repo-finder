"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const handleClear = () => {
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <div className="relative flex-1">
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="リポジトリを検索"
          aria-label="リポジトリを検索"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="入力をクリア"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "検索中…" : "検索"}
      </Button>
    </form>
  );
}
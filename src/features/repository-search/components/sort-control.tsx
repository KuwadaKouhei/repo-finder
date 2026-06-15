"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "best-match", label: "関連度" },
  { value: "stars", label: "Star数" },
  { value: "forks", label: "Fork数" },
  { value: "updated", label: "更新日時" },
] as const;

export function SortControl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get("sort") ?? "best-match";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "best-match") {
      params.delete("sort"); // 関連度 = sort 未指定（API のデフォルト）
      params.delete("order");
    } else {
      params.set("sort", value);
      params.set("order", "desc");
    }
    params.delete("page"); // ソート変更時は1ページ目へ
    startTransition(() => {
      router.replace(`/?${params.toString()}`);
    });
  };

  return (
    <Select value={current} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger
        className="h-[42px] w-36 gap-2 rounded-md border-border bg-card font-semibold shadow-[var(--shadow-card)]"
        aria-label="並び替え"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
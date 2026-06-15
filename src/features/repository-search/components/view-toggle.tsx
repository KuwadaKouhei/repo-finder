"use client";

import { List, LayoutGrid } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { View } from "./results-view";

type Props = {
  view: View;
  onChange: (view: View) => void;
};

const itemClass =
  "h-[38px] rounded-md px-3.5 text-muted-foreground transition-all data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-[var(--shadow-card)]";

export function ViewToggle({ view, onChange }: Props) {
  const handleChange = (value: string) => {
    if (value !== "list" && value !== "grid") return; // 解除(空文字)・不正値は無視
    onChange(value);
  };

  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={handleChange}
      aria-label="表示形式"
      className="gap-1 rounded-[14px] border border-border bg-secondary p-1"
    >
      <ToggleGroupItem value="list" aria-label="リスト表示" className={itemClass}>
        <List className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="グリッド表示" className={itemClass}>
        <LayoutGrid className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

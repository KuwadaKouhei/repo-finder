"use client";

import { List, LayoutGrid } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { View } from "./results-view";

type Props = {
  view: View;
  onChange: (view: View) => void;
};

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
    >
      <ToggleGroupItem value="list" aria-label="リスト表示">
        <List className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="グリッド表示">
        <LayoutGrid className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
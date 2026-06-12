"use client";

import { useEffect, useState } from "react";
import type { Repository } from "@/domain/repository";
import { RepositoryList } from "./repository-list";
import { ViewToggle } from "./view-toggle";

export type View = "list" | "grid";

const STORAGE_KEY = "repo-finder:view";

type Props = {
  repositories: Repository[];
  totalCount: number;
};

export function ResultsView({ repositories, totalCount }: Props) {
  // SSRとの整合のため初期値は固定（list）。マウント後にlocalStorageを反映する
  const [view, setView] = useState<View>("list");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "grid") setView("grid");
  }, []);

  const handleChange = (next: View) => {
    setView(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <ViewToggle view={view} onChange={handleChange} />
      </div>
      <RepositoryList repositories={repositories} view={view} />
    </>
  );
}
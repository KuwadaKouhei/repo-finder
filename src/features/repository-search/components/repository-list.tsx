"use client";

import type { Repository } from "@/domain/repository";
import type { View } from "./results-view";
import { RepositoryCard } from "./repository-card";

type Props = {
  repositories: Repository[];
  view: View;
};

export function RepositoryList({ repositories, view }: Props) {
  return (
    <ul
      key={view}
      className={
        view === "grid"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
          : "flex flex-col gap-3"
      }
    >
      {repositories.map((repo, index) => (
        <li
          key={repo.id}
          className="animate-float-in"
          style={{ "--stagger-index": index } as React.CSSProperties}
        >
          <RepositoryCard repository={repo} />
        </li>
      ))}
    </ul>
  );
}
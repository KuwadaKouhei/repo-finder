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
      className={
        view === "grid"
          ? "grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[18px]"
          : "flex flex-col gap-3.5"
      }
    >
      {repositories.map((repo, index) => (
        <li
          key={repo.id}
          data-repo-id={repo.id}
          className="animate-float-in"
          style={{ "--stagger-index": index } as React.CSSProperties}
        >
          <RepositoryCard repository={repo} view={view} />
        </li>
      ))}
    </ul>
  );
}

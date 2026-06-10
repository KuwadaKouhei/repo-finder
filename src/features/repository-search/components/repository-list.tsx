import type { Repository } from "@/domain/repository";
import { RepositoryCard } from "./repository-card";

type Props = { repositories: Repository[] };

export function RepositoryList({ repositories }: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {repositories.map((repo) => (
        <li key={repo.id}>
          <RepositoryCard repository={repo} />
        </li>
      ))}
    </ul>
  );
}

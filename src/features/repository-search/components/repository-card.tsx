import Link from "next/link";
import Image from "next/image";
import type { Repository } from "@/domain/repository";
import { formatCompact } from "@/lib/format";

type Props = { repository: Repository };

export function RepositoryCard({ repository }: Props) {
  return (
    <Link
      href={`/repositories/${repository.owner}/${repository.repo}`}
      className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      {repository.ownerAvatarUrl ? (
        <Image
          src={repository.ownerAvatarUrl}
          alt={repository.owner}
          width={40}
          height={40}
          className="size-10 rounded-full"
        />
      ) : (
        <div aria-hidden className="size-10 rounded-full bg-muted" />
      )}
      <div className="min-w-0">
        <p className="font-semibold">{repository.fullName}</p>
        {repository.description && (
          <p className="truncate text-sm text-muted-foreground">{repository.description}</p>
        )}
        <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
          <span>{repository.language ?? "言語情報なし"}</span>
          <span>★ {formatCompact(repository.stars)}</span>
        </div>
      </div>
    </Link>
  );
}

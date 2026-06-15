import Link from "next/link";
import {
  Star,
  GitFork,
  CircleDot,
  ExternalLink as ExternalLinkIcon,
  type LucideIcon,
} from "lucide-react";
import type { Repository } from "@/domain/repository";
import { formatCompact } from "@/lib/format";
import { LanguageDot } from "@/components/language-dot";
import { RepoAvatar } from "@/components/repo-avatar";
import type { View } from "./results-view";

type Props = { repository: Repository; view?: View };

function MetaStat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"
      title={label}
    >
      <Icon aria-hidden className="size-[15px] opacity-85" />
      <span className="font-mono font-medium">{formatCompact(value)}</span>
    </span>
  );
}

const cardBase =
  "group repo-card relative block overflow-hidden border border-border bg-card shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-spring)] hover:-translate-y-[3px] hover:border-[var(--brand-ring)] hover:shadow-[var(--card-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RepositoryCard({ repository, view = "list" }: Props) {
  const href = `/repositories/${repository.owner}/${repository.repo}`;
  const grid = view === "grid";

  if (grid) {
    return (
      <Link href={href} className={`${cardBase} flex flex-col gap-4 rounded-2xl p-[22px]`}>
        <span aria-hidden className="card-border-sweep" />
        <div className="flex items-center gap-3">
          <RepoAvatar owner={repository.owner} url={repository.ownerAvatarUrl} size={46} />
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-muted-foreground/80">
              {repository.owner}
            </div>
            <div className="truncate text-[18px] font-bold tracking-tight transition-colors group-hover:text-[var(--brand-strong)]">
              {repository.repo}
            </div>
          </div>
        </div>
        <p className="line-clamp-2 min-h-[2.7em] flex-1 text-sm leading-relaxed text-muted-foreground">
          {repository.description}
        </p>
        {repository.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repository.topics.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-md bg-[var(--brand-soft)] px-2.5 py-[3px] font-mono text-xs font-medium text-[var(--brand-strong)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 border-t border-border pt-3.5">
          <LanguageDot language={repository.language} />
          <div className="ml-auto flex gap-3.5">
            <MetaStat icon={Star} value={repository.stars} label="Star" />
            <MetaStat icon={GitFork} value={repository.forks} label="Fork" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${cardBase} flex items-center gap-[18px] rounded-xl px-[22px] py-[18px]`}
    >
      <span aria-hidden className="card-border-sweep" />
      <RepoAvatar owner={repository.owner} url={repository.ownerAvatarUrl} size={52} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-[13.5px] font-medium text-muted-foreground/80">
            {repository.owner}
          </span>
          <span aria-hidden className="text-muted-foreground/50">
            /
          </span>
          <span className="text-[18.5px] font-bold tracking-tight transition-colors group-hover:text-[var(--brand-strong)]">
            {repository.repo}
          </span>
        </div>
        {repository.description && (
          <p className="mt-1.5 line-clamp-1 max-w-[620px] text-sm leading-relaxed text-muted-foreground">
            {repository.description}
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-[18px]">
          <LanguageDot language={repository.language} />
          <MetaStat icon={Star} value={repository.stars} label="Star" />
          <MetaStat icon={GitFork} value={repository.forks} label="Fork" />
          <MetaStat icon={CircleDot} value={repository.openIssues} label="Issue" />
        </div>
      </div>
      <span className="ml-auto hidden self-center text-[var(--brand-strong)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:inline-flex">
        <ExternalLinkIcon aria-hidden className="size-[18px]" />
      </span>
    </Link>
  );
}

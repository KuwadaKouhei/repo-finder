import { Skeleton } from "@/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <ul className="flex flex-col gap-3" aria-label="読み込み中" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex gap-4 rounded-lg border p-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}
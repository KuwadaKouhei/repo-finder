function Shimmer({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className ?? ""}`} />;
}

export function SearchSkeleton() {
  return (
    <ul
      className="flex flex-col gap-3.5"
      aria-label="読み込み中"
      aria-busy="true"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-[18px] rounded-xl border border-border bg-card p-[18px_22px] shadow-[var(--shadow-card)]"
        >
          <Shimmer className="size-13 shrink-0 !rounded-[14px]" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Shimmer className="h-[15px] w-44" />
            <Shimmer className="h-3 w-80 max-w-full" />
          </div>
          <div className="ml-auto hidden gap-4 sm:flex">
            <Shimmer className="h-3 w-12" />
            <Shimmer className="h-3 w-12" />
          </div>
        </li>
      ))}
    </ul>
  );
}

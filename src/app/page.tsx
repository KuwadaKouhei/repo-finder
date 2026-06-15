import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { SearchBox } from "@/features/repository-search/components/search-box";
import { SearchResults } from "@/features/repository-search/components/search-results";
import { SearchSkeleton } from "@/features/repository-search/components/search-skeleton";
import { SearchPromptState } from "@/features/repository-search/components/search-prompt-state";

type Props = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, page, sort, order } = await searchParams;
  const query = q?.trim();
  const currentPage = Math.max(1, Number(page) || 1);

  return (
    <main className="mx-auto max-w-[1080px] px-6 pb-24">
      {/* ヒーロー */}
      <div className="animate-float-in pt-[54px] pb-[30px] text-center">
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3.5 py-1.5 text-[12.5px] font-bold tracking-[0.04em] text-[var(--brand-strong)]">
            <Sparkles aria-hidden className="size-3.5" />
            EXPLORE OPEN SOURCE
          </span>
        </div>
        <h1 className="text-[clamp(34px,5vw,52px)] font-black leading-[1.05] tracking-[-0.03em]">
          リポジトリを
          <span className="bg-gradient-to-r from-primary to-[var(--brand-strong)] bg-clip-text text-transparent">
            見つけよう
          </span>
        </h1>
        <p className="mx-auto mt-4 text-base leading-relaxed text-muted-foreground sm:whitespace-nowrap">
          名前・説明・トピックから、お気に入りのオープンソースを横断検索。
        </p>
      </div>

      {/* 検索バー */}
      <div className="mx-auto max-w-[720px]">
        <SearchBox />
      </div>

      {/* 結果 / 状態 */}
      {!query ? (
        <SearchPromptState />
      ) : (
        <Suspense
          key={`${query}-${currentPage}-${sort ?? ""}-${order ?? ""}`}
          fallback={
            <div className="mt-[34px]">
              <SearchSkeleton />
            </div>
          }
        >
          <SearchResults
            query={query}
            page={currentPage}
            sort={sort}
            order={order}
          />
        </Suspense>
      )}
    </main>
  );
}

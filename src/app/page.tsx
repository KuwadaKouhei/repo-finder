import { Suspense } from "react";
import { SearchBox } from "@/features/repository-search/components/search-box";
import { SearchResults } from "@/features/repository-search/components/search-results";
import { SearchSkeleton } from "@/features/repository-search/components/search-skeleton";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">GitHub リポジトリ検索</h1>
        <ThemeToggle />
      </div>
      <SearchBox />
      <div className="mt-6">
        {!query ? (
          <p className="text-muted-foreground">
            キーワードを入力してGitHubリポジトリを検索してください
          </p>
        ) : (
          <Suspense
            key={`${query}-${currentPage}-${sort ?? ""}-${order ?? ""}`}
            fallback={<SearchSkeleton />}
          >
            <SearchResults
              query={query}
              page={currentPage}
              sort={sort}
              order={order}
            />
          </Suspense>
        )}
      </div>
    </main>
  );
}
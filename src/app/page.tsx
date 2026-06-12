import { SearchBox } from "@/features/repository-search/components/search-box";
import { SearchResults } from "@/features/repository-search/components/search-results";

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
      <h1 className="mb-4 text-xl font-bold">GitHub リポジトリ検索</h1>
      <SearchBox />
      <div className="mt-6">
        {!query ? (
          <p className="text-muted-foreground">
            キーワードを入力してGitHubリポジトリを検索してください
          </p>
        ) : (
          <SearchResults
            query={query}
            page={currentPage}
            sort={sort}
            order={order}
          />
        )}
      </div>
    </main>
  );
}
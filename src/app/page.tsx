import { searchRepositories } from "@/lib/github/client";
import { RepositoryList } from "@/features/repository-search/components/repository-list";
import { SearchBox } from "@/features/repository-search/components/search-box";
import { Pagination } from "@/features/repository-search/components/pagination";
import { SearchResults } from "@/features/repository-search/components/search-results";

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams;
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
          <SearchResults query={query} page={currentPage} />
        )}
      </div>
    </main>
  );
}

import { searchRepositories } from "@/lib/github/client";
import { RepositoryList } from "@/features/repository-search/components/repository-list";
import { SearchBox } from "@/features/repository-search/components/search-box";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim();

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
          <SearchResults query={query} />
        )}
      </div>
    </main>
  );
}

async function SearchResults({ query }: { query: string }) {
  const result = await searchRepositories({ q: query });
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {result.totalCount.toLocaleString()} 件
      </p>
      <RepositoryList repositories={result.items} />
    </>
  );
}
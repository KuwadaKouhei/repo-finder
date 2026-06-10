import { searchRepositories } from "@/lib/github/client";
import { RepositoryList } from "@/features/repository-search/components/repository-list";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim();

  if (!query) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="text-muted-foreground">
          キーワードを入力してGitHubリポジトリを検索してください
        </p>
      </main>
    );
  }

  const result = await searchRepositories({ q: query });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        {result.totalCount.toLocaleString()} 件
      </p>
      <RepositoryList repositories={result.items} />
    </main>
  );
}

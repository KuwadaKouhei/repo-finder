import { searchRepositories } from "@/lib/github/client";
import { RepositoryList } from "./repository-list";
import { Pagination } from "./pagination";

type Props = {
  query: string;
  page: number;
};

export async function SearchResults({ query, page }: Props) {
  const result = await searchRepositories({ q: query, page });
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {result.totalCount.toLocaleString()} 件
      </p>
      <RepositoryList repositories={result.items} />
      <Pagination currentPage={page} totalCount={result.totalCount} />
    </>
  );
}
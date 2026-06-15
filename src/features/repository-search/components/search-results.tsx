import { searchRepositories } from "@/lib/github/client";
import { ResultsView } from "./results-view";
import { Pagination } from "./pagination";
import { SortControl } from "./sort-control";
import { EmptyState } from "./empty-state";

const VALID_SORTS = ["stars", "forks", "updated"] as const;
const VALID_ORDERS = ["asc", "desc"] as const;

type ValidSort = (typeof VALID_SORTS)[number];
type ValidOrder = (typeof VALID_ORDERS)[number];

const toValidSort = (value?: string): ValidSort | undefined =>
  VALID_SORTS.includes(value as ValidSort) ? (value as ValidSort) : undefined;

const toValidOrder = (value?: string): ValidOrder | undefined =>
  VALID_ORDERS.includes(value as ValidOrder) ? (value as ValidOrder) : undefined;

type Props = {
  query: string;
  page: number;
  sort?: string;
  order?: string;
};

export async function SearchResults({ query, page, sort, order }: Props) {
  const result = await searchRepositories({
    q: query,
    page,
    sort: toValidSort(sort),
    order: toValidOrder(order),
  });

  if (result.totalCount === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {result.totalCount.toLocaleString()} 件
        </p>
        <SortControl />
      </div>
      <ResultsView repositories={result.items} totalCount={result.totalCount} />
      <Pagination currentPage={page} totalCount={result.totalCount} />
    </>
  );
}
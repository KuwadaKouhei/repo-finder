import { SearchX } from "lucide-react";

type Props = {
  query: string;
};

export function EmptyState({ query }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchX aria-hidden className="size-10 text-muted-foreground" />
      <p className="text-muted-foreground">
        「{query}」に一致するリポジトリが見つかりませんでした
      </p>
      <p className="text-sm text-muted-foreground">
        キーワードを変えて検索してみてください
      </p>
    </div>
  );
}
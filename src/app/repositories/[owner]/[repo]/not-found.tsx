import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 p-6 py-16 text-center">
      <p className="text-4xl font-bold">404</p>
      <h2 className="text-lg font-bold">リポジトリが見つかりません</h2>
      <p className="text-sm text-muted-foreground">
        指定されたリポジトリは存在しないか、削除された可能性があります。
      </p>
      <Button asChild variant="outline">
        <Link href="/">検索に戻る</Link>
      </Button>
    </main>
  );
}
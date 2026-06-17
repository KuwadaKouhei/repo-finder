"use client";

import Link from "next/link";
import { markNavigatedInApp } from "@/lib/in-app-navigation";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * 一覧カードの <Link> をクライアント側で薄く包み、クリック時に「一覧→詳細の
 * アプリ内遷移」を同期的に記録する。これにより詳細画面の戻るボタンは、直アクセス
 * （カードを経由しない）では非表示、一覧から来た場合のみ表示できる。
 * カード本体（children）はサーバーコンポーネントのまま渡せる。
 */
export function RepoCardLink({ href, className, children }: Props) {
  return (
    <Link href={href} className={className} onClick={markNavigatedInApp}>
      {children}
    </Link>
  );
}

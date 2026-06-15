import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getRepository } from "@/lib/github/client";
import { NotFoundError } from "@/lib/github/errors";
import { RepositoryDetail } from "@/features/repository-detail/components/repository-detail";
import { BackLink } from "@/features/repository-detail/components/back-link";

type Props = {
  params: Promise<{ owner: string; repo: string }>;
};

// 同一リクエスト内で generateMetadata とページ本体が同じ取得を行うため、
// React.cache でリクエスト単位の重複排除を行う（リクエストをまたぐ永続キャッシュではない）。
const getRepositoryCached = cache(getRepository);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  try {
    const repository = await getRepositoryCached(owner, repo);
    return {
      title: `${repository.fullName} | Repo Finder`,
      description:
        repository.description ?? `${repository.fullName} のリポジトリ情報`,
    };
  } catch {
    // 取得失敗時はページ本体側で notFound / error を処理するため、ここでは控えめなタイトルのみ
    return { title: "リポジトリ | Repo Finder" };
  }
}

export default async function RepositoryDetailPage({ params }: Props) {
  const { owner, repo } = await params;

  let repository;
  try {
    repository = await getRepositoryCached(owner, repo);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error; // その他のエラーは error.tsx に委ねる
  }

  return (
    <main className="mx-auto max-w-[920px] px-6 pb-28">
      <div className="animate-float-in pt-7 pb-2">
        <BackLink />
      </div>
      <RepositoryDetail repository={repository} />
    </main>
  );
}
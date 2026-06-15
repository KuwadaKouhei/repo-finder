import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RepositoryCard } from "./repository-card";
import type { Repository } from "@/domain/repository";

const buildRepo = (overrides: Partial<Repository> = {}): Repository => ({
  id: 1,
  fullName: "facebook/react",
  owner: "facebook",
  repo: "react",
  ownerAvatarUrl: "https://avatars.githubusercontent.com/u/69631",
  language: "JavaScript",
  stars: 70274,
  forks: 9800,
  openIssues: 520,
  description: "A library for building UI",
  topics: ["ui", "frontend"],
  ...overrides,
});

describe("RepositoryCard", () => {
  it("オーナー・リポジトリ名・言語・Star数を表示する", () => {
    render(<RepositoryCard repository={buildRepo()} />);
    expect(screen.getByText("facebook")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText(/70/)).toBeInTheDocument();
  });

  it("language が null のとき「言語情報なし」を表示する", () => {
    render(<RepositoryCard repository={buildRepo({ language: null })} />);
    expect(screen.getByText("言語情報なし")).toBeInTheDocument();
  });

  it("詳細ページへのリンクを持つ", () => {
    render(<RepositoryCard repository={buildRepo()} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/repositories/facebook/react"
    );
  });

  it("アバターURLが空のときフォールバックを表示し img を出さない", () => {
    render(<RepositoryCard repository={buildRepo({ ownerAvatarUrl: "" })} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("description が null でも表示が壊れない", () => {
    render(<RepositoryCard repository={buildRepo({ description: null })} />);
    expect(screen.getByText("react")).toBeInTheDocument();
  });
});

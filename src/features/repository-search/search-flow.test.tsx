import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { SearchResults } from "./components/search-results";
import { RateLimitError } from "@/lib/github/errors";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

const rawRepo = {
  id: 1, name: "react", full_name: "facebook/react",
  owner: { login: "facebook", avatar_url: "https://avatars.githubusercontent.com/u/1" },
  html_url: "https://github.com/facebook/react",
  description: "desc", language: "JavaScript",
  stargazers_count: 100, watchers_count: 100, subscribers_count: 5,
  forks_count: 3, open_issues_count: 4,
};

const respondWith = (items: object[], total = items.length) =>
  http.get("https://api.github.com/search/repositories", () =>
    HttpResponse.json({ total_count: total, incomplete_results: false, items })
  );

describe("検索フロー（結合）", () => {
  it("検索すると一覧が表示される（API→アダプタ→描画が繋がる）", async () => {
    server.use(respondWith([rawRepo]));
    render(await SearchResults({ query: "react", page: 1 }));
    expect(screen.getByText("facebook/react")).toBeInTheDocument();
    expect(screen.getByText(/1\s*件/)).toBeInTheDocument();
  });

  it("0件のとき空状態（EmptyState）を表示する", async () => {
    server.use(respondWith([], 0));
    render(await SearchResults({ query: "zzz", page: 1 }));
    expect(screen.getByText(/見つかりませんでした/)).toBeInTheDocument();
  });

  it("403（レート制限）のとき RateLimitError を投げる（error.tsx に委ねる）", async () => {
    server.use(
      http.get("https://api.github.com/search/repositories", () =>
        HttpResponse.json({ message: "rate limit" }, { status: 403 })
      )
    );
    await expect(SearchResults({ query: "react", page: 1 })).rejects.toBeInstanceOf(
      RateLimitError
    );
  });

  it("sort/order が検索APIのリクエストに反映される", async () => {
    let capturedUrl = "";
    server.use(
      http.get("https://api.github.com/search/repositories", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ total_count: 0, incomplete_results: false, items: [] });
      })
    );
    render(await SearchResults({ query: "react", page: 1, sort: "stars", order: "desc" }));
    const sent = new URL(capturedUrl);
    expect(sent.searchParams.get("sort")).toBe("stars");
    expect(sent.searchParams.get("order")).toBe("desc");
  });

  it("不正な sort 値は API に渡さない", async () => {
    let capturedUrl = "";
    server.use(
      http.get("https://api.github.com/search/repositories", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ total_count: 0, incomplete_results: false, items: [] });
      })
    );
    render(await SearchResults({ query: "react", page: 1, sort: "evil" }));
    expect(new URL(capturedUrl).searchParams.get("sort")).toBeNull();
  });

  it("表示切替トグルで grid レイアウトに切り替わり、localStorage に保存される", async () => {
    server.use(respondWith([rawRepo]));
    const user = userEvent.setup();
    render(await SearchResults({ query: "react", page: 1 }));
    await user.click(screen.getByRole("radio", { name: "グリッド表示" }));
    expect(screen.getByRole("list").className).toContain("grid");
    expect(localStorage.getItem("repo-finder:view")).toBe("grid");
  });
});
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("q=react"),
}));

describe("Pagination", () => {
  beforeEach(() => replaceMock.mockClear());

  it("1ページ以下のときは何も表示しない", () => {
    const { container } = render(<Pagination currentPage={1} totalCount={20} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("ページ番号ボタンを表示し、現在ページに aria-current が付く", () => {
    render(<Pagination currentPage={2} totalCount={300} />);
    // 300件 = 10ページ。末尾(10)と現在(2)が出る
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("1ページ目では「前へ」が無効", () => {
    render(<Pagination currentPage={1} totalCount={300} />);
    expect(screen.getByRole("button", { name: "前へ" })).toBeDisabled();
  });

  it("最終ページでは「次へ」が無効", () => {
    render(<Pagination currentPage={10} totalCount={300} />);
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });

  it("総件数が1000を超えても34ページにクランプする", () => {
    render(<Pagination currentPage={1} totalCount={500000} />);
    expect(screen.getByRole("button", { name: "34" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "35" })).not.toBeInTheDocument();
  });

  it("「次へ」で page を進めた URL に置き換える（q は保持）", async () => {
    const user = userEvent.setup();
    render(<Pagination currentPage={2} totalCount={300} />);
    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(replaceMock).toHaveBeenCalledWith("/?q=react&page=3");
  });
});
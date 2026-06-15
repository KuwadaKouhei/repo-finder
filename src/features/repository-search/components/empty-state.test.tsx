import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("検索キーワードを含むメッセージを表示する", () => {
    render(<EmptyState query="zzzznonexistent" />);
    expect(screen.getByText(/zzzznonexistent/)).toBeInTheDocument();
    expect(screen.getByText(/見つかりませんでした/)).toBeInTheDocument();
  });
});
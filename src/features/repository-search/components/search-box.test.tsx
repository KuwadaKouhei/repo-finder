import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBox } from "./search-box";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("page=3"),
}));

describe("SearchBox", () => {
  beforeEach(() => pushMock.mockClear());

  it("入力して送信すると ?q= に反映し、page をリセットする", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);
    await user.type(screen.getByRole("searchbox"), "react");
    await user.click(screen.getByRole("button", { name: "検索" }));
    expect(pushMock).toHaveBeenCalledWith("/?q=react");
  });

  it("空・空白のみの送信では検索しない", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);
    await user.type(screen.getByRole("searchbox"), "   ");
    await user.click(screen.getByRole("button", { name: "検索" }));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("入力があるときだけクリアボタンが表示され、押すと入力が消える", async () => {
    const user = userEvent.setup();
    render(<SearchBox />);
    expect(screen.queryByRole("button", { name: "入力をクリア" })).not.toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "react");
    await user.click(screen.getByRole("button", { name: "入力をクリア" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
});
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewToggle } from "./view-toggle";

describe("ViewToggle", () => {
  it("現在の表示形式が選択状態になっている", () => {
    render(<ViewToggle view="list" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "リスト表示" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("グリッドを選ぶと onChange が grid で呼ばれる", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle view="list" onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "グリッド表示" }));
    expect(onChange).toHaveBeenCalledWith("grid");
  });

  it("選択中の項目を再クリックしても onChange は呼ばれない（解除を無視）", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle view="list" onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "リスト表示" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
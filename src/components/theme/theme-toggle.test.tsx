import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

const renderWithProvider = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("クリックでダークモードに切り替わり、html に dark クラスが付く", async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(
      await screen.findByRole("button", { name: "ダークモードに切り替え" })
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("選択したテーマが localStorage に保存される", async () => {
    const user = userEvent.setup();
    renderWithProvider();
    await user.click(
      await screen.findByRole("button", { name: "ダークモードに切り替え" })
    );
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
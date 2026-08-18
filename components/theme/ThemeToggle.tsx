"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";

import { Button } from "@/components/ui/button";
import { updateUserThemeAction } from "@/features/settings/actions/theme.action";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  async function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";

    setTheme(nextTheme);

    await updateUserThemeAction(
      nextTheme === "dark" ? "DARK" : "LIGHT",
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark
          ? "Light mode"
          : "Dark mode"
      }
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </Button>
  );
}

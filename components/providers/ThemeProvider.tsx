import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "@wrksz/themes/next";

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: "light" | "dark" | "system";
  storageKey: string;
  target?: "html" | "body" | string;
};

export function ThemeProvider({
  children,
  initialTheme = "system",
  storageKey,
  target = "html",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={initialTheme}
      enableSystem
      disableTransitionOnChange
      storageKey={storageKey}
      target={target}
    >
      {children}
    </NextThemesProvider>
  );
}

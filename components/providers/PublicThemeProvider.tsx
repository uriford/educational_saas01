import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "@wrksz/themes/next";

export default function PublicThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="light"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="public-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class" // ✅ html에 class="dark"를 붙여줌
      defaultTheme="system" // system | light | dark
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

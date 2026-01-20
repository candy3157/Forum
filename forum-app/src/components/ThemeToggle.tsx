"use client";

import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // next-themes가 hydration 이후 resolvedTheme를 채웁니다.
  // 이 값이 없을 때는 렌더를 피해서 mismatch/깜빡임을 방지합니다.
  if (!resolvedTheme) return null;

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
      aria-label="다크모드 토글"
    >
      {isDark ? "라이트 모드" : "다크 모드"}
    </button>
  );
}

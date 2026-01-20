import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import LogoutButton from "../logoutButton";
import ThemeToggle from "../ThemeToggle";

export const dynamic = "force-dynamic";

const navItemBase =
  "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
  "text-gray-700 hover:bg-violet-50 hover:text-violet-900 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const navItemPrimary =
  "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
  "bg-violet-600 text-white hover:bg-violet-700 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          Forum
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/posts" className={navItemBase}>
            게시판
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              {/* ✅ 여기만 반드시 고쳐야 함 */}
              <Link href="/posts/mine" className={navItemBase}>
                <span className="text-gray-500 group-hover:text-violet-700">
                  안녕하세요,
                </span>
                <span className="font-semibold text-gray-700 group-hover:text-violet-900">
                  {user.username}
                </span>
              </Link>

              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className={navItemBase}>
                로그인
              </Link>
              <Link href="/signup" className={navItemPrimary}>
                회원가입
              </Link>
            </div>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

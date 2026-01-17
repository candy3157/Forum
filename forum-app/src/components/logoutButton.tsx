"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const navItemBase =
    "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
    "text-gray-700 hover:bg-violet-50 hover:text-violet-900 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

export default function LogoutButton() {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onLogout = async () => {
        if (loading) return;
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("로그아웃에 실패했습니다.");
            }

            // ✅ 보호 라우트에 있을 수 있으므로 로그인으로 이동(권장)
            router.replace(
                `/login?next=${encodeURIComponent(pathname || "/posts")}`,
            );
            router.refresh();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "알 수 없는 오류가 발생했습니다.",
            );
            // 실패해도 상태가 꼬일 수 있으니 refresh는 한번 시도
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onLogout}
                disabled={loading}
                className={navItemBase}
            >
                {loading ? "로그아웃 중..." : "로그아웃"}
            </button>

            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

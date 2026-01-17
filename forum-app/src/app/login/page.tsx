"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") || "/posts";

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const navItemBase =
        "group inline-flex items-center justify-center gap-2 rounded-lg outline w-full py-2 text-sm font-medium transition-colors " +
        "text-gray-700 hover:bg-violet-50 hover:text-violet-900 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!identifier.trim() || !password) {
            setError("이메일(또는 아이디)과 비밀번호를 입력하세요.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    identifier: identifier.trim(),
                    password,
                }),
            });

            if (res.status === 401) {
                setError("로그인 정보가 올바르지 않습니다.");
                return;
            }

            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as {
                    message?: string;
                };
                throw new Error(data.message || "로그인에 실패했습니다.");
            }

            // ✅ 로그인 성공
            // 1. 최종 목적지로 이동
            router.replace(nextPath);

            // 2. 해당 라우트 기준으로 Server Component 재검증 (Navbar 즉시 반영)
            router.refresh();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-md p-6">
            <h1 className="text-2xl font-semibold">로그인</h1>
            <p className="mt-2 text-sm text-gray-600">
                이메일 또는 아이디로 로그인할 수 있습니다.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">
                        이메일/아이디
                    </label>
                    <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Email 또는 Username 입력"
                        autoComplete="username"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">
                        비밀번호
                    </label>
                    <input
                        type="password"
                        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className={navItemBase}
                >
                    {submitting ? "로그인 중..." : "로그인"}
                </button>
            </form>

            <div className="mt-4 text-sm text-gray-600">
                계정이 없으신가요?{" "}
                <Link
                    className="underline underline-offset-4 hover:decoration-violet-500 transition-colors"
                    href="/signup"
                >
                    회원가입
                </Link>
            </div>
        </div>
    );
}

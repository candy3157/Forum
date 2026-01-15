"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !username.trim() || !password) {
            setError("이메일, 아이디, 비밀번호를 모두 입력하세요.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: email.trim(),
                    username: username.trim(),
                    password,
                }),
            });

            if (res.status === 409) {
                const data = (await res.json().catch(() => ({}))) as {
                    field?: string;
                };
                if (data.field === "email")
                    setError("이미 사용 중인 이메일입니다.");
                else if (data.field === "username")
                    setError("이미 사용 중인 아이디입니다.");
                else setError("이미 존재하는 계정입니다.");
                return;
            }

            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as {
                    message?: string;
                };
                throw new Error(data.message || "회원가입에 실패했습니다.");
            }

            router.replace("/login");
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("알 수 없는 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-md p-6">
            <h1 className="text-2xl font-semibold">회원가입</h1>
            <p className="mt-2 text-sm text-gray-600">
                회원가입 후 로그인해서 글을 작성할 수 있습니다.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">이메일</label>
                    <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEmail(e.target.value)
                        }
                        placeholder="test@example.com"
                        autoComplete="email"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">아이디</label>
                    <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                        value={username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setUsername(e.target.value)
                        }
                        placeholder="test_user"
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                        }
                        autoComplete="new-password"
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
                    className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {submitting ? "가입 중..." : "회원가입"}
                </button>
            </form>

            <div className="mt-4 text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <Link className="underline" href="/login">
                    로그인
                </Link>
            </div>
        </div>
    );
}

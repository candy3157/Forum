"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatePostResponse = {
    id?: string;
    message?: string;
};

export default function NewPostPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !content.trim()) {
            setError("제목과 내용을 입력하세요.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            // 응답 바디는 한 번만 읽기
            const data = (await res
                .json()
                .catch(() => ({}))) as CreatePostResponse;

            if (res.status === 401) {
                router.replace("/login?next=/posts/new");
                return;
            }

            if (!res.ok) {
                throw new Error(data.message || "게시글 생성에 실패했습니다.");
            }

            if (!data.id) {
                throw new Error("서버 응답에 게시글 id가 없습니다.");
            }

            router.replace(`/posts/${data.id}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "알 수 없는 오류가 발생했습니다."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-semibold">새 글 작성</h1>
            <p className="mt-2 text-sm text-gray-500">
                제목과 내용을 입력한 뒤 등록하세요.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">제목</label>
                    <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTitle(e.target.value)
                        }
                        placeholder="제목을 입력하세요"
                        maxLength={200}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">내용</label>
                    <textarea
                        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                        value={content}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setContent(e.target.value)
                        }
                        placeholder="내용을 입력하세요"
                        rows={10}
                    />
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {submitting ? "등록 중..." : "등록"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg border px-4 py-2"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

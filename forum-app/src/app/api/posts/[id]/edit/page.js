"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");

    // 기존 글 로딩
    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        const load = async () => {
            setError("");
            setLoading(true);
            try {
                const res = await fetch(`/api/posts/${id}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (res.status === 404) {
                    router.replace("/posts");
                    return;
                }

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(
                        data?.message || "게시글을 불러오지 못했습니다."
                    );
                }

                const post = await res.json();
                if (cancelled) return;

                setTitle(post.title ?? "");
                setContent(post.content ?? "");
            } catch (err) {
                if (!cancelled)
                    setError(err?.message || "알 수 없는 오류가 발생했습니다.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id, router]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !content.trim()) {
            setError("제목과 내용을 입력하세요.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/posts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            if (res.status === 401) {
                router.replace(`/login?next=/posts/${id}/edit`);
                return;
            }

            if (res.status === 403) {
                setError("수정 권한이 없습니다. (작성자만 수정 가능)");
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "수정에 실패했습니다.");
            }

            router.replace(`/posts/${id}`);
        } catch (err) {
            setError(err?.message || "알 수 없는 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl p-6">
                <div className="text-sm text-gray-500">불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-semibold">글 수정</h1>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">제목</label>
                    <input
                        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">내용</label>
                    <textarea
                        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
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
                        disabled={saving}
                        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        {saving ? "저장 중..." : "저장"}
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

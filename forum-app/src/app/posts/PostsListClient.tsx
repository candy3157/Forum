"use client";

import Link from "next/link";
import { useState } from "react";

type PostItem = {
  id: string;
  title: string;
  createdAt: string | Date;
  author: { id: string; username: string };
  _count?: { comments: number };
};

export default function PostsListClient({
  initialItems,
  initialNextCursor,
  take,
}: {
  initialItems: PostItem[];
  initialNextCursor: string | null;
  take: number;
}) {
  const [items, setItems] = useState<PostItem[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMore = async () => {
    if (!nextCursor || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/posts?take=${encodeURIComponent(String(take))}&cursor=${encodeURIComponent(nextCursor)}`,
        { cache: "no-store" },
      );

      if (!res.ok) throw new Error("게시글을 더 불러오지 못했습니다.");

      const data = (await res.json()) as {
        items: PostItem[];
        nextCursor: string | null;
      };

      setItems((prev) => [...prev, ...(data.items || [])]);
      setNextCursor(data.nextCursor || null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          게시글이 없습니다.
        </p>
      ) : (
        items.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <Link
              href={`/posts/${p.id}`}
              className="text-lg font-semibold hover:underline"
            >
              {p.title}
            </Link>

            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {p.author.username}
              {typeof p._count?.comments === "number"
                ? ` · 댓글 ${p._count.comments}`
                : ""}
            </div>
          </div>
        ))
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {nextCursor && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800"
        >
          {loading ? "불러오는 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}

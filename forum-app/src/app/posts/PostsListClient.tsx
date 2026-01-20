"use client";

import Link from "next/link";
import { useState } from "react";

type PostItem = {
  id: string;
  title: string;
  createdAt: string | Date;
  author: { id: string; username: string };
  _count: { comments: number };
};

type PostsResponse = {
  items: PostItem[];
  nextCursor: string | null;
};

function formatDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function PostsListClient({
  initialItems,
  initialNextCursor,
  take,
}: {
  initialItems: PostItem[];
  initialNextCursor: string | null;
  take: number;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<PostItem[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFirst = async (query: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/posts?take=${encodeURIComponent(String(take))}&q=${encodeURIComponent(query)}`,
        { cache: "no-store" },
      );

      if (!res.ok) throw new Error("검색 결과를 불러오지 못했습니다.");

      const data = (await res.json()) as PostsResponse;
      setItems(Array.isArray(data?.items) ? data.items : []);
      setNextCursor(data?.nextCursor ?? null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      );
      setItems([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextCursor || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/posts?take=${encodeURIComponent(String(take))}&cursor=${encodeURIComponent(
          nextCursor,
        )}&q=${encodeURIComponent(q.trim())}`,
        { cache: "no-store" },
      );

      if (!res.ok) throw new Error("게시글을 더 불러오지 못했습니다.");

      const data = (await res.json()) as PostsResponse;
      const newItems = Array.isArray(data?.items) ? data.items : [];

      setItems((prev) => [...prev, ...newItems]);
      setNextCursor(data?.nextCursor ?? null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadFirst(q.trim());
  };

  const onReset = async () => {
    setQ("");
    await loadFirst("");
  };

  return (
    <div>
      {/* 검색 UI */}
      <form
        onSubmit={onSubmitSearch}
        className="flex items-center gap-2 border-b p-3"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목/본문/작성자 검색"
          className="w-full rounded-lg border px-3 py-2 text-sm text-black outline-none focus:ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border px-3 py-2 text-sm text-black whitespace-nowrap hover:bg-gray-50 disabled:opacity-50"
        >
          검색
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="rounded-lg border px-3 py-2 text-sm text-black whitespace-nowrap hover:bg-gray-50 disabled:opacity-50"
        >
          초기화
        </button>
      </form>

      {error && <div className="p-3 text-sm text-red-600">{error}</div>}

      {items.length === 0 ? (
        <div className="p-6 text-sm text-gray-600">
          {q.trim() ? (
            <>
              검색 결과가 없습니다:{" "}
              <span className="font-medium">{q.trim()}</span>
            </>
          ) : (
            "아직 게시글이 없습니다. 첫 글을 작성해보세요."
          )}
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((p) => (
            <li key={p.id} className="p-4 hover:bg-gray-50">
              <Link href={`/posts/${p.id}`} className="block">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-medium text-black">
                      {p.title}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      작성자: {p.author.username} · {formatDate(p.createdAt)}
                      {" · "}댓글 {p._count.comments}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">→</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t p-3">
        {nextCursor ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "불러오는 중..." : "더 보기"}
          </button>
        ) : (
          <div className="text-center text-xs text-gray-500">
            더 이상 게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

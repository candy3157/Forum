"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author: {
    id: string;
    username: string;
  };
};

type CommentsResponse = {
  items: CommentItem[];
  nextCursor: string | null;
};

type CommentsProps = {
  postId: string;
  canWrite: boolean;
  meId: string | null;
};

export default function Comments({ postId, canWrite, meId }: CommentsProps) {
  const router = useRouter();

  const TAKE = 20;

  const [items, setItems] = useState<CommentItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // 목록 로딩 (초기/더보기 공용)
  const [loading, setLoading] = useState(true);

  // create
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  // edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  // delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  const nextToLogin = useMemo(() => {
    return `/login?next=${encodeURIComponent(`/posts/${postId}`)}`;
  }, [postId]);

  const navItemBase =
    "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
    "border border-gray-200 " +
    "text-gray-700 bg-white " +
    "hover:bg-violet-50 hover:text-violet-900 hover:border-violet-300 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

  const startEdit = (c: CommentItem) => {
    setError("");
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const loadFirst = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${postId}/comments?take=${TAKE}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("댓글을 불러오지 못했습니다.");

      const data = (await res.json()) as CommentsResponse;

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
    if (!nextCursor) return;
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/posts/${postId}/comments?take=${TAKE}&cursor=${encodeURIComponent(nextCursor)}`,
        { cache: "no-store" },
      );

      if (!res.ok) throw new Error("댓글을 더 불러오지 못했습니다.");

      const data = (await res.json()) as CommentsResponse;

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

  useEffect(() => {
    void loadFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const onCreate = async () => {
    if (!canWrite) {
      router.replace(nextToLogin);
      return;
    }

    const text = newContent.trim();
    if (!text) return;

    setCreating(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });

      if (res.status === 401) {
        router.replace(nextToLogin);
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message || "댓글 작성에 실패했습니다.");
      }

      setNewContent("");
      // ✅ 정합성 우선: 작성 후 첫 페이지로 리셋 로드
      await loadFirst();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setCreating(false);
    }
  };

  const onSaveEdit = async () => {
    if (!canWrite) {
      router.replace(nextToLogin);
      return;
    }
    if (!editingId) return;

    const text = editContent.trim();
    if (!text) {
      setError("댓글 내용을 입력하세요.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/comments/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });

      if (res.status === 401) {
        router.replace(nextToLogin);
        return;
      }
      if (res.status === 403) {
        throw new Error("수정 권한이 없습니다.");
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message || "댓글 수정에 실패했습니다.");
      }

      cancelEdit();
      await loadFirst();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (commentId: string) => {
    if (!canWrite) {
      router.replace(nextToLogin);
      return;
    }

    const ok = window.confirm("댓글을 삭제할까요?");
    if (!ok) return;

    setDeletingId(commentId);
    setError("");

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        router.replace(nextToLogin);
        return;
      }
      if (res.status === 403) {
        throw new Error("삭제 권한이 없습니다.");
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message || "댓글 삭제에 실패했습니다.");
      }

      if (editingId === commentId) cancelEdit();
      await loadFirst();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black">댓글</h2>
        <span className="text-sm text-black">
          {loading ? "" : `${items.length}개`}
        </span>
      </div>

      {/* 작성 폼 */}
      <div className="mt-3 space-y-2">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={
            canWrite
              ? "댓글을 입력하세요 (1000자 이하)"
              : "로그인 후 댓글을 작성할 수 있습니다."
          }
          className="w-full rounded-lg border px-3 py-2 outline-none text-black focus:ring"
          rows={3}
          disabled={!canWrite || creating}
        />

        <div className="flex items-center justify-between">
          {error ? <p className="text-sm text-red-600">{error}</p> : <span />}

          <button
            type="button"
            onClick={onCreate}
            disabled={creating || !newContent.trim()}
            className={navItemBase}
          >
            {creating ? "등록 중..." : "댓글 등록"}
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="mt-6">
        {loading && items.length === 0 ? (
          <p className="text-sm text-gray-600">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-600">첫 댓글을 남겨보세요.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((c) => {
                const isMine = !!meId && c.author?.id === meId;
                const isEditing = editingId === c.id;
                const isDeleting = deletingId === c.id;

                return (
                  <li key={c.id} className="rounded-lg border bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-black">
                          {c.author?.username ?? "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(c.createdAt).toLocaleString("ko-KR")}
                        </span>
                      </div>

                      {isMine && !isEditing && (
                        <div className="flex items-center gap-2 text-sm">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="rounded-md px-2 py-1 text-gray-700 hover:bg-gray-50"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(c.id)}
                            disabled={isDeleting}
                            className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {isDeleting ? "삭제 중..." : "삭제"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 본문 / 편집 */}
                    {isEditing ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                          rows={3}
                          disabled={saving}
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={onSaveEdit}
                            disabled={saving || !editContent.trim()}
                            className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
                          >
                            {saving ? "저장 중..." : "저장"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
                        {c.content}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* ✅ 더 보기 */}
            {nextCursor && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="mt-4 w-full rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "불러오는 중..." : "댓글 더 보기"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

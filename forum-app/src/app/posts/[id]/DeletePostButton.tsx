"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePostButton({ postId }: { postId: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const onDelete = async () => {
        const ok = window.confirm("정말 삭제하시겠습니까?");
        if (!ok) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (res.status === 401) {
                router.replace(`/login?next=/posts/${postId}`);
                return;
            }

            if (res.status === 403) {
                alert("삭제 권한이 없습니다. (작성자만 삭제 가능)");
                return;
            }

            if (!res.ok) {
                const data = (await res.json().catch(() => ({}))) as {
                    message?: string;
                };
                throw new Error(data.message || "삭제에 실패했습니다.");
            }

            router.replace("/posts");
            router.refresh();
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "알 수 없는 오류가 발생했습니다."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
            {deleting ? "삭제 중..." : "삭제"}
        </button>
    );
}

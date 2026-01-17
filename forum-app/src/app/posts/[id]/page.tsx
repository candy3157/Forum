import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import DeletePostButton from "./DeletePostButton";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
    return new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(d);
}

type PostDetail = Prisma.PostGetPayload<{
    select: {
        id: true;
        title: true;
        content: true;
        createdAt: true;
        authorId: true;
        author: {
            select: {
                id: true;
                username: true;
            };
        };
    };
}>;

export default async function PostDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params; // ✅ 핵심
    if (!id) notFound();

    const post: PostDetail | null = await prisma.post.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            authorId: true,
            author: { select: { id: true, username: true } },
        },
    });

    if (!post) notFound();

    const me = await getCurrentUser();
    const isAuthor = me?.id === post.authorId;

    return (
        <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between">
                <Link
                    href="/posts"
                    className="text-sm text-gray-600 hover:underline"
                >
                    ← 목록으로
                </Link>

                {isAuthor && (
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/posts/${post.id}/edit`}
                            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                            수정
                        </Link>
                        <DeletePostButton postId={post.id} />
                    </div>
                )}
            </div>

            <div className="mt-6 rounded-xl border bg-white p-6">
                <h1 className="text-2xl font-semibold">{post.title}</h1>
                <div className="mt-2 text-sm text-gray-500">
                    작성자: {post.author?.username ?? "Unknown"} ·{" "}
                    {formatDate(post.createdAt)}
                </div>

                <div className="mt-6 whitespace-pre-wrap text-gray-900">
                    {post.content}
                </div>
            </div>
        </div>
    );
}

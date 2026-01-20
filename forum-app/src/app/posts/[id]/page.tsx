import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import DeletePostButton from "./DeletePostButton";
import Comments from "@/components/Comments"; // ✅ 댓글 컴포넌트 (경로 맞추세요)

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

const navItemBase =
  "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
  "text-gray-700 hover:bg-violet-50 hover:text-violet-900 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

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
        <Link href="/posts" className="text-sm text-gray-600 hover:underline">
          ← 목록으로
        </Link>

        {isAuthor && (
          <div className="flex items-center gap-2">
            <Link href={`/posts/${post.id}/edit`} className={navItemBase}>
              수정
            </Link>
            <DeletePostButton postId={post.id} />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-semibold text-black">{post.title}</h1>
        <div className="mt-2 text-sm text-gray-500">
          작성자: {post.author?.username ?? "Unknown"} ·{" "}
          {formatDate(post.createdAt)}
        </div>

        <div className="mt-6 whitespace-pre-wrap text-gray-900">
          {post.content}
        </div>
      </div>

      {/* ✅ 댓글 섹션 */}
      <div className="mt-6 rounded-xl border bg-white p-6">
        <Comments postId={post.id} canWrite={!!me} meId={me?.id ?? null} />
      </div>
    </div>
  );
}

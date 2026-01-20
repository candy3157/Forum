import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import PostsListClient from "./PostsListClient";

export const dynamic = "force-dynamic";

type PostListItem = Prisma.PostGetPayload<{
  select: {
    id: true;
    title: true;
    createdAt: true;
    author: { select: { id: true; username: true } };
    _count: { select: { comments: true } };
  };
}>;

const navItemBase =
  "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
  "text-gray-700 hover:bg-violet-50 hover:text-violet-900 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

export default async function PostsPage() {
  const TAKE = 20;

  const rows: PostListItem[] = await prisma.post.findMany({
    take: TAKE + 1,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: { select: { id: true, username: true } },
      _count: { select: { comments: true } },
    },
  });

  const hasMore = rows.length > TAKE;
  const initialItems = hasMore ? rows.slice(0, TAKE) : rows;
  const initialNextCursor = hasMore
    ? initialItems[initialItems.length - 1]?.id
    : null;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">게시판</h1>
          <p className="mt-2 text-sm text-gray-600">
            목록/상세는 공개이며, 작성/수정은 로그인 후 가능합니다.
          </p>
        </div>

        <Link href="/posts/new" className={navItemBase}>
          새 글 작성
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <PostsListClient
          initialItems={initialItems}
          initialNextCursor={initialNextCursor}
          take={TAKE}
        />
      </div>
    </div>
  );
}

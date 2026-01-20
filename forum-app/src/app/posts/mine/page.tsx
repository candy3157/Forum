import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

const navItemBase =
  "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
  "text-gray-700 hover:bg-violet-50 hover:text-violet-900 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

export default async function MyPostsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/my-posts"); // ✅ 로그인 후 원래 페이지로 복귀

  const posts = await prisma.post.findMany({
    where: { authorId: me.id }, // ✅ 로그인 유저 본인 글만
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: { select: { id: true, username: true } },
      _count: { select: { comments: true } },
    },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">내 글</h1>
          <p className="mt-2 text-sm text-gray-600">
            {me.username}님이 작성한 글 목록입니다.
          </p>
        </div>

        <Link href="/posts/new" className={navItemBase}>
          글 작성
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        {posts.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">
            아직 게시글이 없습니다. 첫 글을 작성해보세요.
          </div>
        ) : (
          <ul className="divide-y">
            {posts.map((p: typeof posts[number]) => (
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

                    <div className="text-xs text-gray-400">›</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export const runtime = "nodejs"; // (선택) node 런타임 명시

function badRequest(message = "Invalid request") {
  return NextResponse.json({ message }, { status: 400 });
}

function serverError() {
  return NextResponse.json({ message: "Server error" }, { status: 500 });
}

// 게시글 목록 조회 (커서 기반 페이지네이션)
// GET /api/posts?take=10&cursor=<lastPostId>
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const takeRaw = searchParams.get("take");
    const cursor = searchParams.get("cursor");

    const takeParsed = parseInt(takeRaw || "10", 10);
    const take = Number.isFinite(takeParsed)
      ? Math.min(Math.max(takeParsed, 1), 50)
      : 10;

    const items = await prisma.post.findMany({
      take: take + 1, // ✅ 다음 페이지 존재 여부 확인을 위해 1개 더 가져옴
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } }, // ✅ 댓글 수
      },
    });

    const hasMore = items.length > take;
    const sliced = hasMore ? items.slice(0, take) : items;
    const nextCursor = hasMore ? sliced[sliced.length - 1]?.id : null;

    return NextResponse.json({ items: sliced, nextCursor }, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return serverError();
  }
}

// 게시글 생성 (로그인 필요)
export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";

    if (!title || !content) {
      return badRequest("Missing fields");
    }

    // (선택) 길이 제한 - 필요 없으면 제거해도 됨
    if (title.length > 200) {
      return badRequest("Title is too long (max 200)");
    }
    if (content.length > 20000) {
      return badRequest("Content is too long (max 20000)");
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id, // ✅ 서버가 세션 기반으로 강제
      },
      include: { author: { select: { id: true, username: true } } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return serverError();
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export const runtime = "nodejs";

function badRequest(message = "Invalid request") {
  return NextResponse.json({ message }, { status: 400 });
}

function serverError() {
  return NextResponse.json({ message: "Server error" }, { status: 500 });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const takeRaw = searchParams.get("take");
    const cursorRaw = searchParams.get("cursor");
    const qRaw = searchParams.get("q") || "";
    const q = qRaw.trim();

    const takeParsed = parseInt(takeRaw || "10", 10);
    const take = Number.isFinite(takeParsed)
      ? Math.min(Math.max(takeParsed, 1), 50)
      : 10;

    const cursor =
      typeof cursorRaw === "string" && cursorRaw.length > 0 ? cursorRaw : null;

    const where =
      q.length > 0
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } }, // ✅ 수정
              { author: { username: { contains: q, mode: "insensitive" } } },
            ],
          }
        : undefined;

    const items = await prisma.post.findMany({
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } },
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

    if (!title || !content) return badRequest("Missing fields");
    if (title.length > 200) return badRequest("Title is too long (max 200)");
    if (content.length > 20000)
      return badRequest("Content is too long (max 20000)");

    const post = await prisma.post.create({
      data: { title, content, authorId: user.id },
      include: { author: { select: { id: true, username: true } } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return serverError();
  }
}

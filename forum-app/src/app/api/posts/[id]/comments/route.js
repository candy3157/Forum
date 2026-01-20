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

async function getIdFromParams(params) {
  // Next 환경에 따라 params가 Promise로 올 수 있으므로 await로 처리
  const resolved = await params;
  const id = resolved?.id;
  if (!id || typeof id !== "string") return null;
  return id;
}

function parseTake(value, fallback = 20, max = 50) {
  const n = parseInt(value ?? "", 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

export async function GET(req, { params }) {
  try {
    const postId = await getIdFromParams(params);
    if (!postId) return badRequest("Invalid post id");

    const { searchParams } = new URL(req.url);
    const take = parseTake(searchParams.get("take"), 20, 50);
    const cursorRaw = searchParams.get("cursor");
    const cursor =
      typeof cursorRaw === "string" && cursorRaw ? cursorRaw : null;

    const rows = await prisma.comment.findMany({
      take: take + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      where: { postId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: { author: { select: { id: true, username: true } } },
    });

    const hasMore = rows.length > take;
    const items = hasMore ? rows.slice(0, take) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({ items, nextCursor }, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts/[id]/comments error:", err);
    return serverError();
  }
}

export async function POST(req, { params }) {
  try {
    const postId = await getIdFromParams(params);
    if (!postId) return badRequest("Invalid post id");

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { message: "댓글 내용을 입력하세요." },
        { status: 400 },
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { message: "댓글은 1000자 이하로 작성하세요." },
        { status: 400 },
      );
    }

    // post 존재 확인 (권장)
    const exists = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const created = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts/[id]/comments error:", err);
    return serverError();
  }
}

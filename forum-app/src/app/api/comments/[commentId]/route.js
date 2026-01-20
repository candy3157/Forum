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
  const id = resolved?.commentId;
  if (!id || typeof id !== "string") return null;
  return id;
}

// 댓글 수정 (로그인 + 작성자만)
export async function PUT(req, { params }) {
  try {
    const commentId = await getIdFromParams(params);
    if (!commentId) return badRequest("Invalid commentId");

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1) 리소스 존재 + 작성자 확인
    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2) 입력 검증
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

    // 3) 업데이트
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /api/comments/[commentId] error:", err);
    return serverError();
  }
}

// 댓글 삭제 (로그인 + 작성자만)
export async function DELETE(_req, { params }) {
  try {
    const commentId = await getIdFromParams(params);
    if (!commentId) return badRequest("Invalid commentId");

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1) 리소스 존재 + 작성자 확인
    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (existing.authorId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2) 삭제
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/comments/[commentId] error:", err);
    return serverError();
  }
}

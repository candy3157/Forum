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

export async function GET(_req, { params }) {
    try {
        const id = await getIdFromParams(params);
        if (!id) return badRequest("Invalid id");

        const post = await prisma.post.findUnique({
            where: { id },
            include: { author: { select: { id: true, username: true } } },
        });

        if (!post)
            return NextResponse.json({ message: "Not found" }, { status: 404 });

        return NextResponse.json(post, { status: 200 });
    } catch (err) {
        console.error("GET /api/posts/[id] error:", err);
        return serverError();
    }
}

// 게시글 수정 (로그인+작성자만)
export async function PUT(req, { params }) {
    try {
        const id = await getIdFromParams(params);
        if (!id) return badRequest("Invalid id");

        const user = await getCurrentUser();

        // 1단계. 인증
        if (!user)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );

        // 2단계. 리소스 존재 확인
        const post = await prisma.post.findUnique({
            where: { id },
            select: { id: true, authorId: true },
        });

        if (!post)
            return NextResponse.json({ message: "Not found" }, { status: 404 });

        // 3단계. 권한 확인 (작성자의 글인지)
        if (post.authorId !== user.id)
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        // 입력 검증 및 업데이트
        const body = await req.json().catch(() => ({}));
        const title = typeof body?.title === "string" ? body.title.trim() : "";
        const content =
            typeof body?.content === "string" ? body.content.trim() : "";

        if (!title || !content) {
            return NextResponse.json(
                { message: "Missing fields" },
                { status: 400 }
            );
        }

        const updated = await prisma.post.update({
            where: { id },
            data: { title, content },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("PUT /api/posts/[id] error:", err);
        return serverError();
    }
}

// 게시글 삭제 (로그인+작성자만)
export async function DELETE(_req, { params }) {
    try {
        const id = await getIdFromParams(params);
        if (!id) return badRequest("Invalid id");

        const user = await getCurrentUser();
        if (!user)
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );

        const post = await prisma.post.findUnique({
            where: { id },
            select: { id: true, authorId: true },
        });

        if (!post)
            return NextResponse.json({ message: "Not found" }, { status: 404 });

        if (post.authorId !== user.id)
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        await prisma.post.delete({ where: { id } });

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error("DELETE /api/posts/[id] error:", err);
        return serverError();
    }
}

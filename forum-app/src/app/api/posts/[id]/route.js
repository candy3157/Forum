import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(_req, { params }) {
    const post = await prisma.post.findUnique({
        where: { id: params.id },
        include: { author: { select: { id: true, username: true } } },
    });

    if (!post)
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(post);
}

// 게시글 수정 (로그인+작성자만)
export async function PUT(req, { params }) {
    const user = await getCurrentUser();
    // 1단계. 인증
    if (!user)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // 2단계. 리소스 존재 확인 (수정 할 게시글이 존재하는지)
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post)
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    // 3단계. 권한 확인 (작정자의 글인지)
    if (post.authorId !== user.id)
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // 입력 검증 및 업데이트
    const { title, content } = await req.json();
    if (!title || !content) {
        return NextResponse.json(
            { message: "Missing fields" },
            { status: 400 }
        );
    }

    const updated = await prisma.post.update({
        where: { id: params.id },
        data: { title, content },
    });

    return NextResponse.json(updated);
}

// 게시글 삭제 (로그인+작성자만)
export async function DELETE(_req, { params }) {
    const user = await getCurrentUser();
    if (!user)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post)
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    if (post.authorId !== user.id)
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}

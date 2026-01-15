import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

// 게시글 목록 조회
export async function GET() {
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, username: true } } },
    });

    return NextResponse.json(posts);
}

// 게시글 생성 (로그인 필요)
export async function POST(req) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 요청 body에서 글 내용 받기
    const { title, content } = await req.json();
    if (!title || !content) {
        return NextResponse.json(
            { message: "Missing fields" },
            { status: 400 }
        );
    }

    const post = await prisma.post.create({
        data: {
            title,
            content,
            authorId: user.id, // ✅ 서버가 세션 기반으로 강제
        },
    });

    return NextResponse.json(post, { status: 201 });
}

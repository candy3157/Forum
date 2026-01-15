import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession } from "@/lib/auth";

const LoginSchema = z.object({
    // email 또는 username 중 하나로 로그인 가능하게
    identifier: z.string().min(1).max(255),
    password: z.string().min(1).max(72),
});
console.log("AUTH_SECRET =", process.env.AUTH_SECRET);

export async function POST(req) {
    try {
        const body = await req.json();
        const parsed = LoginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid input", issues: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { identifier, password } = parsed.data; // 여기서 부터 검증된 값만 사용

        // email 또는 username으로 사용자 조회
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
            select: {
                id: true,
                email: true,
                username: true,
                password: true, // 해시 비교용
            },
        });

        // 인증 실패 처리(사용자 확인이 되지 않는 경우)
        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // 비밀번호 해시 비교
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // JWT 세션 토큰 발급
        const token = await signSession({
            sub: user.id,
            email: user.email,
            username: user.username,
        });

        // HttpOnly 쿠키로 세션 저장
        const res = NextResponse.json(
            {
                ok: true,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                },
            },
            { status: 200 }
        );

        res.cookies.set({
            name: "session",
            value: token,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return res;
    } catch (err) {
        console.error(err); // 서버 콘솔에 스택 출력
        return NextResponse.json(
            { message: "Server error", detail: String(err?.message || err) },
            { status: 500 }
        );
    }
}

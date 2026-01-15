import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SignupSchema = z.object({
    email: z.string().email().max(255),
    username: z
        .string()
        .min(3)
        .max(30)
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "username must be alphanumeric or underscore"
        ),
    password: z.string().min(8).max(72), // bcrypt 입력은 72 bytes 제한이 있어 상한을 두는 편이 안전
});

export async function POST(req) {
    try {
        const body = await req.json();
        const parsed = SignupSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid input", issues: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { email, username, password } = parsed.data;

        // 중복 확인(이메일/유저네임)
        const exists = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
            select: { id: true, email: true, username: true },
        });

        if (exists) {
            // 어떤 값이 중복인지 알려주는 방식(UX 향상)
            const field =
                exists.email === email
                    ? "email"
                    : exists.username === username
                    ? "username"
                    : "unknown";

            return NextResponse.json(
                { message: "Already exists", field },
                { status: 409 }
            );
        }

        // 비밀번호 해싱
        const hashed = await bcrypt.hash(password, 12);

        // 유저 생성
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashed,
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true, // 스키마에 없으면 제거
            },
        });

        // 회원가입 성공
        return NextResponse.json({ ok: true, user }, { status: 201 });
    } catch (err) {
        // JSON 파싱 실패 등
        console.error("회원가입 오류:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

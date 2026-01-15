import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// 세션 유효성 검사
async function isValidSession(token) {
    if (!token) return false;

    const secretStr = process.env.AUTH_SECRET;
    if (!secretStr) return false;

    try {
        const secret = new TextEncoder().encode(secretStr);
        await jwtVerify(token, secret);
        return true;
    } catch {
        return false;
    }
}

// 요청을 가로채는 로직
export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // 보호 경로만 matcher로 들어오게 했지만, 방어적으로 한 번 더 체크
    const token = req.cookies.get("session")?.value;
    const ok = await isValidSession(token);

    if (ok) return NextResponse.next();

    // 로그인 페이지로 리다이렉트 + 원래 목적지(next) 포함
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
}

// matcher 설정
export const config = {
    matcher: ["/posts/new", "/posts/:path*/edit"],
};

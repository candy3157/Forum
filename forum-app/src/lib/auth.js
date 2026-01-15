import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

// JWT 발급
export async function signSession(payload) {
    // payload 예: { sub: user.id, email, username }
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

// JWT 검증
export async function verifySession(token) {
    const { payload } = await jwtVerify(token, secret); // jwtVerify가 위에서 짠 JWT 토큰의 검증을 내부적으로 수행해줌
    return payload; // 검증이 완료된 페이로드만 반환
}

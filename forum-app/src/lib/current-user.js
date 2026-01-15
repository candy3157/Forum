import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    try {
        const payload = await verifySession(token);
        const userId = payload?.sub;
        if (!userId) return null;

        // DB에서 최신 유저 정보 조회(존재/삭제/정지 등 반영 가능)
        const user = await prisma.user.findUnique({
            where: { id: String(userId) },
            select: { id: true, email: true, username: true },
        });

        return user;
    } catch {
        return null;
    }
}

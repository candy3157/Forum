import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <main className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-semibold">Forum App</h1>
                <p className="mt-3 text-gray-600">
                    로그인/회원가입 후 글을 작성하고, 게시판을 둘러볼 수
                    있습니다.
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                    <Link
                        href="/login"
                        className="rounded-lg bg-black px-5 py-2.5 text-white"
                    >
                        로그인
                    </Link>

                    <Link
                        href="/signup"
                        className="rounded-lg border px-5 py-2.5"
                    >
                        회원가입
                    </Link>

                    <Link
                        href="/posts"
                        className="rounded-lg border px-5 py-2.5"
                    >
                        게시판
                    </Link>
                </div>

                <div className="mt-10 rounded-xl border bg-white p-6">
                    <h2 className="text-lg font-medium">구성</h2>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                        <li>메인에서 로그인/회원가입/게시판으로 이동</li>
                        <li>목록/상세는 공개</li>
                        <li>작성/수정은 로그인 필요</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}

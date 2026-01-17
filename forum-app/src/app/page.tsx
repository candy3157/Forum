import Link from "next/link";

const navItemBase =
    "group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
    "text-gray-700 hover:bg-violet-50 hover:text-violet-900 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

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
                    <Link href="/posts" className={navItemBase}>
                        게시판
                    </Link>
                </div>

                <div className="mt-10 rounded-xl border bg-white p-6">
                    <h2 className="text-lg font-medium text-gray-600">구성</h2>
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

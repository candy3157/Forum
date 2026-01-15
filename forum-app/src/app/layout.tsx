import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Forum App",
    description: "Simple forum with auth and CRUD",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
            >
                <header className="border-b bg-white">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                        <Link href="/" className="font-semibold">
                            Forum
                        </Link>

                        <nav className="flex items-center gap-4 text-sm">
                            <Link href="/posts" className="hover:underline">
                                게시판
                            </Link>
                            <Link href="/login" className="hover:underline">
                                로그인
                            </Link>
                            <Link href="/signup" className="hover:underline">
                                회원가입
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
            </body>
        </html>
    );
}

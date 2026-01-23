# Forum App

간단한 포럼(게시판) 앱입니다. 회원가입/로그인, 게시글 CRUD, 댓글 기능을 제공하며, Next.js App Router와 Prisma(PostgreSQL)를 사용합니다.

## 주요 기능

- 회원가입/로그인/로그아웃 (JWT + HttpOnly 쿠키)
- 게시글 목록/검색/작성/수정/삭제
- 댓글 작성/삭제
- 게시글 목록 커서 기반 페이지네이션
- 다크 모드 토글 (next-themes)

## 기술 스택

- Next.js 16 (App Router)
- React 19
- Prisma + PostgreSQL
- Tailwind CSS 4
- Zod, bcryptjs, jose

## 빠른 시작

### 1) 설치

```bash
npm install
```

### 2) 환경 변수 설정

`.env` 파일을 만들고 아래 값을 설정합니다.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
AUTH_SECRET="your-secret-string"
```

### 3) 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

### 4) 개발 서버 실행

```bash
npm run dev
```

## 스크립트

- `npm run dev` 개발 서버
- `npm run build` 프로덕션 빌드
- `npm run start` 프로덕션 서버 실행
- `npm run lint` ESLint

## 폴더 구조(요약)

- `src/app` 페이지, API 라우트
- `src/components` UI 컴포넌트
- `src/lib` 공통 유틸 (auth, prisma 등)
- `prisma` 스키마 및 마이그레이션

## API 개요(요약)

- `POST /api/auth/signup` 회원가입
- `POST /api/auth/login` 로그인
- `POST /api/auth/logout` 로그아웃
- `GET /api/posts` 게시글 목록(검색/페이지네이션)
- `POST /api/posts` 게시글 생성
- `GET /api/posts/[id]` 게시글 상세
- `PUT /api/posts/[id]` 게시글 수정
- `DELETE /api/posts/[id]` 게시글 삭제
- `POST /api/posts/[id]/comments` 댓글 생성
- `DELETE /api/comments/[commentId]` 댓글 삭제

## 메모

- `AUTH_SECRET`은 반드시 안전한 랜덤 문자열로 설정하세요.
- PostgreSQL이 로컬에서 실행 중이어야 합니다.

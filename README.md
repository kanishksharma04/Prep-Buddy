# Prep Buddy

A minimalistic study-planner web app. Create subjects, paste in your syllabus
as topics, check them off as you study, and track a live countdown to each
exam date.

> Status: work in progress, being built phase by phase. This README will
> gain a full setup/deploy section in later phases.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma](https://www.prisma.io) + [Neon Postgres](https://neon.tech)
- [Auth.js (NextAuth v5)](https://authjs.dev) with a Credentials provider
- [Zod](https://zod.dev) for validation
- Deployed on [Vercel](https://vercel.com)

## Getting started

```bash
npm install
vercel env pull .env.local   # pulls real Neon + auth values from Vercel
npm run dev
```

If you're not using the Vercel CLI, copy `.env.example` to `.env.local` and
fill in the values by hand instead.

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment variables

See [.env.example](./.env.example) for the full list. In short:

| Variable                 | Purpose                                                 |
| ------------------------ | -------------------------------------------------------- |
| `DATABASE_URL`           | Pooled Neon Postgres connection string (Prisma runtime) |
| `DATABASE_URL_UNPOOLED`  | Direct Neon connection string (Prisma migrations)       |
| `AUTH_SECRET`            | Secret used by Auth.js to sign/encrypt sessions         |

`DATABASE_URL` and `DATABASE_URL_UNPOOLED` are provisioned automatically by
the Vercel Neon integration (`vercel install neon`) and kept in sync via
`vercel env pull`. `AUTH_SECRET` was generated once with `npx auth secret`
and is also stored in Vercel's Production/Preview/Development env vars.

## Authentication

- Config: [src/auth.ts](./src/auth.ts) — Auth.js (NextAuth v5) with a single Credentials provider, JWT session strategy (no database sessions/adapter — sessions aren't part of the data model).
- `authorize()` looks up the user by email via Prisma and checks the password with `bcryptjs`.
- Route protection: [src/proxy.ts](./src/proxy.ts) (Next.js 16 renamed `middleware.ts` → `proxy.ts`) matches `/dashboard/:path*` and `/subjects/:path*`, deferring the allow/deny decision to the `authorized` callback in `src/auth.ts`.
- Server Actions ([src/lib/actions/auth.ts](./src/lib/actions/auth.ts)) aren't covered by the proxy matcher (Server Actions are POSTs to the page route, not separate routes), so every mutation must independently check the session — see [src/lib/auth-guard.ts](./src/lib/auth-guard.ts)'s `requireUser()`, used by the dashboard page.
- Pages: `/signup` and `/login` (redirect to `/dashboard` if already signed in), `/dashboard` (subjects list — see below).
- Validation: [src/lib/validation/auth.ts](./src/lib/validation/auth.ts) — Zod schemas for login/signup, including password-confirmation matching.

## Layout & theme

- Header: [src/components/layout/header.tsx](./src/components/layout/header.tsx) — logo, session-aware nav (Login/Signup vs. Dashboard/Log out), theme toggle. Rendered once in the root layout, so it's on every page.
- Logo: [src/components/brand/logo-mark.tsx](./src/components/brand/logo-mark.tsx) / [logo.tsx](./src/components/brand/logo.tsx) — hand-recreated inline SVG (clock + open book + check) in the brand colors, theme-aware (inverts fill for contrast in dark mode, subtle glow to match the reference mark). Favicon: [src/app/icon.svg](./src/app/icon.svg) (Next.js file convention — no `favicon.ico` needed).
- Theme: dark/light via a `.dark` class on `<html>`, persisted in `localStorage` and falling back to `prefers-color-scheme`. [src/components/theme/theme-init-script.ts](./src/components/theme/theme-init-script.ts) runs as a `beforeInteractive` `next/script` so the class is set before first paint — no flash of the wrong theme. [theme-toggle.tsx](./src/components/theme/theme-toggle.tsx) is the client-side toggle button.
- Accessibility: [src/components/layout/skip-link.tsx](./src/components/layout/skip-link.tsx) is the first focusable element on every page (visually hidden until focused), landing on each page's `#main-content`. All interactive elements use `focus-visible` outlines. Full a11y/responsive pass is Phase 9 — this is the structural foundation.

## Subjects

- Dashboard ([src/app/dashboard/page.tsx](./src/app/dashboard/page.tsx)) fetches the signed-in user's subjects (`orderBy: { order: "asc" }`) and renders them as cards, with an empty state when there are none.
- Create: [src/components/subjects/create-subject-form.tsx](./src/components/subjects/create-subject-form.tsx) — name + optional exam date, resets itself on success.
- Rename/delete: [src/components/subjects/subject-card.tsx](./src/components/subjects/subject-card.tsx) — inline edit-in-place for rename, native `confirm()` before delete (a proper accessible dialog lands in Phase 9).
- Actions: [src/lib/actions/subjects.ts](./src/lib/actions/subjects.ts) — Zod-validated, and every mutation is scoped with `where: { id, userId }` (via `updateMany`/`deleteMany`) so one user can never touch another's subjects, even if they guess an id.
- Validation: [src/lib/validation/subject.ts](./src/lib/validation/subject.ts).

## Topics

- Subject detail page ([src/app/subjects/[id]/page.tsx](./src/app/subjects/[id]/page.tsx)) — fetches the subject scoped to the signed-in user (`findFirst({ where: { id, userId } })`) and 404s via `notFound()` if it doesn't exist or isn't theirs; lists its topics ordered by `order`.
- Add: [src/components/topics/add-topics-form.tsx](./src/components/topics/add-topics-form.tsx) — one textarea, one topic per line, so a single topic and a full pasted syllabus go through the same field. Blank lines are filtered; capped at 500 topics per submission.
- Edit / delete / reorder / check off: [src/components/topics/topic-row.tsx](./src/components/topics/topic-row.tsx).
  - Check/uncheck uses `useOptimistic` — the checkbox and strikethrough update instantly, the server call happens in the background, and a failed/slow request would leave the row out of sync with the next revalidated fetch (acceptable for a checkbox; not silently reverted).
  - Reorder is up/down buttons (not drag-and-drop, to avoid pulling in a DnD library) — swaps the `order` value with the adjacent topic in a `$transaction`. Keyboard-operable by default.
  - Edit is inline (click "Edit" → input + Save/Cancel), same pattern as subject rename.
  - Delete has the same native-`confirm()` guard as subjects.
- Actions: [src/lib/actions/topics.ts](./src/lib/actions/topics.ts) — every mutation re-derives the topic via `findFirst({ where: { id, subject: { userId } } })` before acting, so ownership is checked through the `Subject` relation (Topic has no direct `userId`).
- Validation: [src/lib/validation/topic.ts](./src/lib/validation/topic.ts).

## Progress & countdown

- Progress bar: [src/components/subjects/progress-bar.tsx](./src/components/subjects/progress-bar.tsx) — `done / total` topics as a percentage, with `role="progressbar"` + `aria-value*` attributes. Shown on the subject detail page; the dashboard cards pick it up in Phase 8.
- Exam date: [src/components/subjects/exam-date-picker.tsx](./src/components/subjects/exam-date-picker.tsx) — its own small form/action (`updateExamDateAction` in [src/lib/actions/subjects.ts](./src/lib/actions/subjects.ts)) so the subject page can set/clear the date without touching the name, alongside the full rename form already on the dashboard.
- Countdown: [src/components/subjects/countdown.tsx](./src/components/subjects/countdown.tsx) wraps the pure logic in [src/lib/countdown.ts](./src/lib/countdown.ts) (`getCountdown(examDate, now)` — easy to unit-test in isolation, verified against the exact spec boundaries: green `> 7d`, amber `<= 7d`, red `<= 2d`, grey once past). Ticks every 60s client-side; starts as a client-only `null` state filled in after mount rather than computed during the initial render, to avoid an SSR/hydration mismatch on the displayed hour.
- No-date and past-date cases are both handled explicitly ("No exam date set" / "Exam passed"), not just left to render whatever `Invalid Date` would produce.

## Database

- Schema: [prisma/schema.prisma](./prisma/schema.prisma) — `User` → `Subject` → `Topic`, cascade deletes on both relations.
- Client: [src/lib/db.ts](./src/lib/db.ts) — a cached singleton using the Neon serverless driver adapter (`@prisma/adapter-neon`), safe for Next.js dev hot-reload.
- Config: [prisma.config.ts](./prisma.config.ts) — points the Prisma CLI (migrate/studio) at the direct connection; the app's runtime queries use the pooled one via the adapter.

```bash
npm run db:migrate   # create/apply a migration in development
npm run db:studio    # open Prisma Studio
```

## Project structure

```
src/
  app/            Next.js App Router routes, layouts, and global styles
  components/     UI components (auth forms, subjects, topics, layout/header, theme, brand/logo)
  lib/            Server-side utilities (Prisma client, auth actions/guards, validation)
  generated/      Prisma Client output (generated, gitignored)
  auth.ts         Auth.js (NextAuth v5) configuration
  proxy.ts        Route protection (Next.js 16's replacement for middleware.ts)
prisma/
  schema.prisma   Data model
  migrations/     Generated SQL migrations
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint
- `npm run db:migrate` — create/apply a Prisma migration
- `npm run db:studio` — open Prisma Studio

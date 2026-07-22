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
- Route protection: [src/proxy.ts](./src/proxy.ts) (Next.js 16 renamed `middleware.ts` → `proxy.ts`) matches `/dashboard/:path*` and defers the allow/deny decision to the `authorized` callback in `src/auth.ts`.
- Server Actions ([src/lib/actions/auth.ts](./src/lib/actions/auth.ts)) aren't covered by the proxy matcher (Server Actions are POSTs to the page route, not separate routes), so every mutation must independently check the session — see [src/lib/auth-guard.ts](./src/lib/auth-guard.ts)'s `requireUser()`, used by the dashboard page.
- Pages: `/signup` and `/login` (redirect to `/dashboard` if already signed in), `/dashboard` (protected placeholder — real content lands in Phase 5+).
- Validation: [src/lib/validation/auth.ts](./src/lib/validation/auth.ts) — Zod schemas for login/signup, including password-confirmation matching.

## Layout & theme

- Header: [src/components/layout/header.tsx](./src/components/layout/header.tsx) — logo, session-aware nav (Login/Signup vs. Dashboard/Log out), theme toggle. Rendered once in the root layout, so it's on every page.
- Logo: [src/components/brand/logo-mark.tsx](./src/components/brand/logo-mark.tsx) / [logo.tsx](./src/components/brand/logo.tsx) — hand-recreated inline SVG (clock + open book + check) in the brand colors, theme-aware (inverts fill for contrast in dark mode, subtle glow to match the reference mark). Favicon: [src/app/icon.svg](./src/app/icon.svg) (Next.js file convention — no `favicon.ico` needed).
- Theme: dark/light via a `.dark` class on `<html>`, persisted in `localStorage` and falling back to `prefers-color-scheme`. [src/components/theme/theme-init-script.ts](./src/components/theme/theme-init-script.ts) runs as a `beforeInteractive` `next/script` so the class is set before first paint — no flash of the wrong theme. [theme-toggle.tsx](./src/components/theme/theme-toggle.tsx) is the client-side toggle button.
- Accessibility: [src/components/layout/skip-link.tsx](./src/components/layout/skip-link.tsx) is the first focusable element on every page (visually hidden until focused), landing on each page's `#main-content`. All interactive elements use `focus-visible` outlines. Full a11y/responsive pass is Phase 9 — this is the structural foundation.

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
  components/     UI components (auth forms, layout/header, theme, brand/logo)
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

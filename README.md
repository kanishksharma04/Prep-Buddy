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
`vercel env pull`. `AUTH_SECRET` is added in the auth phase.

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
  lib/            Server-side utilities (Prisma client singleton, etc.)
  generated/      Prisma Client output (generated, gitignored)
prisma/
  schema.prisma   Data model
  migrations/     Generated SQL migrations
```

More directories (`components/`, `types/`) are added as the phases that need
them land.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint
- `npm run db:migrate` — create/apply a Prisma migration
- `npm run db:studio` — open Prisma Studio

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
cp .env.example .env.local   # fill in the values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment variables

See [.env.example](./.env.example) for the full list. In short:

| Variable       | Purpose                                              |
| -------------- | ----------------------------------------------------- |
| `DATABASE_URL` | Pooled Neon Postgres connection string (Prisma runtime) |
| `DIRECT_URL`   | Direct Neon connection string (Prisma migrations)     |
| `AUTH_SECRET`  | Secret used by Auth.js to sign/encrypt sessions       |

Database and auth wiring are added in later phases — these are placeholders
until then.

## Project structure

```
src/
  app/            Next.js App Router routes, layouts, and global styles
```

More directories (`components/`, `lib/`, `types/`) are added as the phases
that need them land.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint

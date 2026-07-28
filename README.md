# Prep Buddy

Prep Buddy is a simple study planner. Add your subjects, paste in your
syllabus as a list of topics, check them off as you study, and keep an eye
on a live countdown to each exam. It also uses AI to turn your notes into
short recall questions, so revising feels like a real quiz instead of just
re-reading.

**Live app:** https://prepbuddy-app.vercel.app
*(If this link asks you to log in with Vercel instead of showing the app,
deployment protection is still on — see [Deployment](#deployment).)*

## Features

- **Accounts** — sign up and log in with an email and password.
- **Subjects** — create a subject for each exam, with an optional exam
  date. Rename or delete anytime.
- **Topics** — add topics one at a time, or paste your whole syllabus at
  once (one topic per line). Reorder, edit, delete, and check off topics
  as you study. Topics can have subtopics too.
- **Progress tracking** — a progress bar shows how much of each subject
  is done, and a pace indicator tells you if you're ahead of or behind
  schedule for the exam date.
- **Exam countdown** — a live countdown (days and hours left) that
  changes color as the exam gets closer.
- **Spaced-repetition revision** — once you mark a topic as done, it
  automatically comes back for review after 1, 3, and 7 days, following
  a well-known spaced-repetition schedule.
- **AI-generated recall questions** — when a topic is due for revision,
  Prep Buddy uses Claude (Anthropic's AI model) to turn your note into a
  short question and answer, so you're actually testing your memory
  instead of just re-reading the note. If no note is available, it falls
  back to a simple flip card.
- **Calendar view** — see all your exam dates and any classes you add,
  laid out on a monthly calendar.
- **Dashboard** — every subject in one place, sorted by the nearest
  exam, plus a summary of your overall progress and a streak tracker for
  daily study activity.
- **Dark and light theme** — switch anytime; your choice is remembered.
- **Polished, accessible UI** — confirmation before deleting anything,
  an undo option after deleting, toast notifications, loading indicators,
  and a keyboard-friendly interface that meets accessibility (WCAG)
  contrast standards in both themes.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) (App Router) with TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Database | [Neon](https://neon.tech) (serverless PostgreSQL) |
| Database toolkit | [Prisma](https://www.prisma.io) |
| Authentication | [Auth.js (NextAuth v5)](https://authjs.dev) with email/password login, passwords hashed using [bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| AI | [Anthropic's Claude API](https://www.anthropic.com/api) (`@anthropic-ai/sdk`) for generating recall questions |
| Validation | [Zod](https://zod.dev) |
| Hosting | [Vercel](https://vercel.com) |

## Getting started

```bash
git clone https://github.com/kanishksharma04/Prep-Buddy.git
cd Prep-Buddy
npm install
vercel env pull .env.local   # downloads real database + auth values from Vercel
npm run dev
```

If you don't use the Vercel CLI, copy `.env.example` to `.env.local` and
fill in the values yourself instead — see [Environment variables](#environment-variables)
below.

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled Neon PostgreSQL connection string, used at runtime |
| `DATABASE_URL_UNPOOLED` | Yes | Direct Neon connection string, used for database migrations |
| `AUTH_SECRET` | Yes | Secret key Auth.js uses to sign and encrypt sessions |
| `ANTHROPIC_API_KEY` | No | Enables AI-generated recall questions. Without it, the app falls back to showing your raw note instead |

See [.env.example](./.env.example) for a full copy-pasteable template.

- `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are provided automatically by
  the Vercel–Neon integration, and kept up to date with `vercel env pull`.
- Generate `AUTH_SECRET` once with `npx auth secret`.
- Get an `ANTHROPIC_API_KEY` from the
  [Anthropic Console](https://console.anthropic.com/) if you want the AI
  feature enabled.

All required variables are checked as soon as the server starts. If one
is missing, the app fails immediately with a clear error message instead
of breaking later on the first request that needs it.

## Project structure

```
src/
  app/            Next.js routes, layouts, and global styles
  components/     UI components, organized by feature (auth, subjects,
                  topics, calendar, dashboard, theme, layout, shared UI)
  lib/            Server-side logic — database access, validation,
                  authentication helpers, and the AI integration
  lib/ai/         Claude API integration for recall-question generation
  generated/      Auto-generated Prisma Client (not committed to git)
  auth.ts         Auth.js configuration
  proxy.ts        Protects private routes (Next.js 16's version of middleware.ts)
prisma/
  schema.prisma   Database schema
  migrations/     Database migration history
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | Check code quality with ESLint |
| `npm run db:migrate` | Create and apply a database migration |
| `npm run db:studio` | Open Prisma Studio to browse the database |

## Deployment

The project is already set up on Vercel with a connected Neon database.

- **Vercel project:** `prep-buddy`, connected to this GitHub repository.
  Pushing to `main` automatically deploys to production; other branches
  get their own preview deployment.
- **Database:** a Neon PostgreSQL database, provisioned through Vercel's
  Neon integration.
- **Environment variables:** already configured in Vercel for
  Production, Preview, and Development.

### Deploying an update

```bash
git push               # pushes to GitHub, which triggers an automatic deploy
vercel ls              # optional: view recent deployments
vercel --prod          # optional: trigger a production deploy manually
```

### Known issue: deployment protection

Vercel's "Vercel Authentication" protection is currently turned on, which
means visiting the live link requires a Vercel login. To make the app
publicly accessible: Vercel dashboard → `prep-buddy` project → Settings
→ Deployment Protection → turn off "Vercel Authentication" (or restrict
it to Preview deployments only, keeping Production public).

### Database migrations in production

`next build` does not run database migrations automatically. If you
change `prisma/schema.prisma`, update the Vercel build command to:

```
npx prisma migrate deploy && npm run build
```

### Setting up a fresh Vercel/Neon project

1. `vercel link` to create or link a Vercel project.
2. `vercel install neon` to provision a database and connect it — this
   sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically.
3. Generate and add the auth secret:
   ```bash
   AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
   printf '%s' "$AUTH_SECRET" | vercel env add AUTH_SECRET production
   printf '%s' "$AUTH_SECRET" | vercel env add AUTH_SECRET preview
   printf '%s' "$AUTH_SECRET" | vercel env add AUTH_SECRET development
   ```
4. Add `ANTHROPIC_API_KEY` the same way if you want the AI feature enabled.
5. Run `vercel env pull .env.local` and `npm run db:migrate` to apply the schema.
6. Update the build command as shown above.
7. Push to `main` (or run `vercel --prod`).

## How it works

A few notes on the key ideas behind the app, for anyone extending it.

- **Authentication** — handled by Auth.js with a simple email/password
  login. Every private page and every data-changing action independently
  checks that a user is logged in, so nothing can be accessed or changed
  without a valid session.
- **Spaced repetition** — when you mark a topic as done, it's scheduled
  to come back for review 1, 3, and then 7 days later. Getting it right
  moves it to the next stage; marking it "still fuzzy" resets it back to
  day one, the same way real spaced-repetition study systems work.
- **AI recall questions** — the first time a topic comes up for review,
  Prep Buddy sends your note to Claude and asks for one short question
  and answer that tests the key idea, then saves it so it's only
  generated once. If you edit the note later, a new question is
  generated the next time it's needed. If no AI key is configured, the
  app simply shows your original note instead — nothing breaks.
- **Calendar** — exam dates are shown automatically; you can also add
  your own class schedule, including recurring date ranges and optional
  join links.
- **Design** — a warm, paper-like "study desk" look, built with
  Tailwind CSS, that adapts cleanly between light and dark themes.

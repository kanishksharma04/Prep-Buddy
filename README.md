# Prep Buddy

A minimalistic study-planner web app. Create subjects, paste in your syllabus
as topics, check them off as you study, and track a live countdown to each
exam date.

> Status: feature-complete, built phase by phase. See "Deployment" below for
> what's already configured and what's left to do.

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

All three are validated at process startup — [src/lib/env.ts](./src/lib/env.ts)
parses `process.env` with Zod and throws immediately with a specific message
if anything is missing or empty, and [src/instrumentation.ts](./src/instrumentation.ts)
imports it via Next's `register()` hook so a misconfigured deploy fails at
boot with a clear reason instead of on the first request that happens to
touch the database.

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
- Accessibility: [src/components/layout/skip-link.tsx](./src/components/layout/skip-link.tsx) is the first focusable element on every page (visually hidden until focused), landing on each page's `#main-content`. All interactive elements use `focus-visible` outlines. See "UX, accessibility & responsive polish" below for the full audit.

## Subjects

- Dashboard ([src/app/dashboard/page.tsx](./src/app/dashboard/page.tsx)) fetches the signed-in user's subjects (with each one's topics, for progress) and renders them as cards sorted by nearest upcoming exam, with an empty state when there are none.
- Create: [src/components/subjects/create-subject-form.tsx](./src/components/subjects/create-subject-form.tsx) — name + optional exam date, resets itself on success.
- Rename/delete: [src/components/subjects/subject-card.tsx](./src/components/subjects/subject-card.tsx) — inline edit-in-place for rename, [ConfirmDialog](./src/components/ui/confirm-dialog.tsx) before delete.
- Actions: [src/lib/actions/subjects.ts](./src/lib/actions/subjects.ts) — Zod-validated, and every mutation is scoped with `where: { id, userId }` (via `updateMany`/`deleteMany`) so one user can never touch another's subjects, even if they guess an id.
- Validation: [src/lib/validation/subject.ts](./src/lib/validation/subject.ts).

## Topics

- Subject detail page ([src/app/subjects/[id]/page.tsx](./src/app/subjects/[id]/page.tsx)) — fetches the subject scoped to the signed-in user (`findFirst({ where: { id, userId } })`) and 404s via `notFound()` if it doesn't exist or isn't theirs; lists its topics ordered by `order`.
- Add: [src/components/topics/add-topics-form.tsx](./src/components/topics/add-topics-form.tsx) — one textarea, one topic per line, so a single topic and a full pasted syllabus go through the same field. Blank lines are filtered; capped at 500 topics per submission.
- Edit / delete / reorder / check off: [src/components/topics/topic-row.tsx](./src/components/topics/topic-row.tsx).
  - Check/uncheck uses `useOptimistic` — the checkbox and strikethrough update instantly, the server call happens in the background, and a failed/slow request would leave the row out of sync with the next revalidated fetch (acceptable for a checkbox; not silently reverted).
  - Reorder is up/down buttons (not drag-and-drop, to avoid pulling in a DnD library) — swaps the `order` value with the adjacent topic in a `$transaction`. Keyboard-operable by default.
  - Edit is inline (click "Edit" → input + Save/Cancel), same pattern as subject rename.
  - Delete has the same [ConfirmDialog](./src/components/ui/confirm-dialog.tsx) guard as subjects.
- Actions: [src/lib/actions/topics.ts](./src/lib/actions/topics.ts) — every mutation re-derives the topic via `findFirst({ where: { id, subject: { userId } } })` before acting, so ownership is checked through the `Subject` relation (Topic has no direct `userId`).
- Validation: [src/lib/validation/topic.ts](./src/lib/validation/topic.ts).

## Progress & countdown

- Progress bar: [src/components/subjects/progress-bar.tsx](./src/components/subjects/progress-bar.tsx) — `done / total` topics as a percentage, with `role="progressbar"` + `aria-value*` attributes. Shown on the subject detail page and on every dashboard card.
- Exam date: [src/components/subjects/exam-date-picker.tsx](./src/components/subjects/exam-date-picker.tsx) — its own small form/action (`updateExamDateAction` in [src/lib/actions/subjects.ts](./src/lib/actions/subjects.ts)) so the subject page can set/clear the date without touching the name, alongside the full rename form already on the dashboard.
- Countdown: [src/components/subjects/countdown.tsx](./src/components/subjects/countdown.tsx) wraps the pure logic in [src/lib/countdown.ts](./src/lib/countdown.ts) (`getCountdown(examDate, now)` — easy to unit-test in isolation, verified against the exact spec boundaries: green `> 7d`, amber `<= 7d`, red `<= 2d`, grey once past). Ticks every 60s client-side; starts as a client-only `null` state filled in after mount rather than computed during the initial render, to avoid an SSR/hydration mismatch on the displayed hour.
- No-date and past-date cases are both handled explicitly ("No exam date set" / "Exam passed"), not just left to render whatever `Invalid Date` would produce.

## Dashboard sorting & summary

- Sorting: [src/lib/sort-subjects.ts](./src/lib/sort-subjects.ts) — `sortByNearestExam` puts the soonest upcoming exam first; subjects with no exam date, or one that's already passed, sink to the end (tiebroken by creation order). `findNextExam` reuses the same "in the future" check for the summary strip.
  - Both take `now` as an explicit parameter rather than reading `Date.now()`/`new Date()` inline in the page component — a newer `eslint-plugin-react-hooks` rule (`react-hooks/purity`) flags impure calls made directly in a component/render body, since Next 16's Cache Components model can memoize a Server Component's output across requests; keeping the "current time" call inside a plain function (not the component itself) keeps that assumption safe if this page ever opts into caching.
- Summary strip: [src/components/subjects/summary-strip.tsx](./src/components/subjects/summary-strip.tsx) — total topics, done topics, and the next upcoming exam (subject name + date), computed from the same data already fetched for the cards. Only shown once there's at least one subject.

## UX, accessibility & responsive polish

- Confirm-before-delete: [src/components/ui/confirm-dialog.tsx](./src/components/ui/confirm-dialog.tsx) — a native `<dialog>` (`showModal()`/`close()`), which gives focus trapping, Escape-to-close, and backdrop-click-to-close for free, styled to match the theme instead of the browser's `window.confirm()`. Used by both subject and topic delete.
- Toasts: [src/components/ui/toast-context.tsx](./src/components/ui/toast-context.tsx) — a minimal `ToastProvider`/`useToast()` (no external toast library), an `aria-live="polite"` region rendered once in the root layout. Wired into create/rename/edit/delete success paths for subjects and topics; skipped for topic reorder and check/uncheck, which already have their own instant visual feedback and would just add noise.
- Error boundaries: [src/app/error.tsx](./src/app/error.tsx) (nested routes) and [src/app/global-error.tsx](./src/app/global-error.tsx) (root layout itself, so it renders its own `<html>/<body>`), both with a "Try again" button wired to Next's `reset()`.
- Loading skeletons: [src/app/dashboard/loading.tsx](./src/app/dashboard/loading.tsx) and [src/app/subjects/[id]/loading.tsx](./src/app/subjects/[id]/loading.tsx) — Next's `loading.tsx` convention, shown automatically while each async Server Component's data fetch is in flight.
- Contrast: audited every text/background color pair in both themes against WCAG (script-computed relative-luminance ratios, not eyeballed). Found and fixed two real failures — the red "Delete" text was 4.41:1 against its own hover background (bumped `red-600` → `red-700`, now 5.91:1), and every bordered control failed the 3:1 non-text-contrast requirement for UI components (our decorative `--border` is intentionally subtle, ~1.3:1). Fixed by adding a `--color-control` token (`globals.css`, aliases `--muted-foreground`, which already clears 3:1 in both themes) applied to every input, textarea, and outline-style button — decorative card/divider borders keep the original subtle `--border`.
- Automated a11y audit: ran axe-core (`@axe-core/playwright`) against every page in both themes, plus the confirm dialog open — **0 violations**. Also verified with real keyboard interaction (not just static analysis): the confirm dialog opens on Enter, Escape closes it, and Tab cycles focus between its two buttons only (a `document.body` tick appears once per cycle — confirmed this is benign native `<dialog>`/inert-boundary wraparound behavior, not an escape to real page content, by checking focus never lands on anything outside the dialog across many tab presses).
- Mobile: audited every page at a 375px viewport for horizontal overflow (script-checked `scrollWidth` against the viewport, not just a visual glance) — found none, but did find the header's logo wordmark wrapping to two lines under viewport pressure; fixed with `whitespace-nowrap` on the wordmark plus `flex-wrap` on the header so the nav wraps to its own line instead of squeezing the logo.

## Production readiness

- Env validation: see above — fails fast at boot, not on first use.
- Meta tags: [src/app/layout.tsx](./src/app/layout.tsx) — `metadataBase` (derived from Vercel's `VERCEL_PROJECT_PRODUCTION_URL` env var, falling back to `localhost:3000`), title template, description, Open Graph + Twitter card tags, per-theme `theme-color`. Deliberately set `robots: { index: false, follow: false }` since this is a personal/private planner, not a marketing site — flip that in `layout.tsx` if you want it publicly indexed.
- OG/Twitter image: [src/app/opengraph-image.tsx](./src/app/opengraph-image.tsx) — generated at build time with `next/og`'s `ImageResponse` (no external image asset needed), reusing the same logo mark and brand colors as the header.
- Favicon: [src/app/icon.svg](./src/app/icon.svg) (Phase 4).
- 404 page: [src/app/not-found.tsx](./src/app/not-found.tsx) — branded, links back to `/` (which routes to the dashboard or landing page depending on session).
- Auth error surfacing: if Auth.js redirects here with `?error=...` (e.g. a stale session bounced by the `authorized` callback), [src/app/login/page.tsx](./src/app/login/page.tsx) shows a message instead of silently landing on a blank login form.
- `next.config.ts`: `poweredByHeader: false` (don't advertise the framework), Turbopack root pinned (Phase 1, avoids a monorepo/lockfile misdetection).

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
  app/            Next.js App Router routes, layouts, global styles, metadata (og image, icon, not-found)
  components/     UI components (auth forms, subjects, topics, layout/header, theme, brand/logo, ui/ shared primitives)
  lib/            Server-side utilities (Prisma client, env validation, auth actions/guards, validation)
  generated/      Prisma Client output (generated, gitignored)
  auth.ts         Auth.js (NextAuth v5) configuration
  proxy.ts        Route protection (Next.js 16's replacement for middleware.ts)
  instrumentation.ts  Runs env validation once at server boot
prisma/
  schema.prisma   Data model
  migrations/     Generated SQL migrations
```

## Deployment

The Vercel project and Neon database were provisioned during development
(via the Vercel CLI), so most of this is **already done** — this section is
both a record of that and a checklist if you ever need to redo it from
scratch (new Vercel account, new Neon project, etc.).

### Already configured

- **Vercel project** `prep-buddy` under your Vercel team, linked to this
  local directory (`.vercel/project.json`, gitignored) and connected to the
  `kanishksharma04/Prep-Buddy` GitHub repo with `main` as the production
  branch — confirmed via `vercel project inspect` and the Vercel API. Pushing
  to `main` triggers an automatic production deploy; every other branch/PR
  gets a preview deploy. Framework preset, build command, and install
  command are all auto-detected correctly (Next.js / `next build` / `npm
  install`).
- **Neon Postgres database**, provisioned through the Vercel Neon
  integration (`vercel install neon`) and connected to the project.
- **Environment variables**, present in Vercel for all three environments
  (Production, Preview, Development) — confirmed via `vercel env ls`:
  - `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (from the Neon integration)
  - `AUTH_SECRET` (generated with `npx auth secret`, added manually)
  - A handful of other `PG*`/`POSTGRES_*`/Neon-specific vars the integration
    also adds — unused by this app (we only read the three above), harmless
    to leave in place.
- **Database schema**: the `init` migration has already been applied to the
  real Neon database (`prisma/migrations/`), not just written locally.

### What's left — one thing

- **Run the migration on deploy.** `next build` does not run
  `prisma migrate deploy`. Since the schema hasn't changed since the initial
  migration, the very first deploy doesn't strictly need this, but any
  future schema change will. Set the Vercel project's Build Command to:
  ```
  npx prisma migrate deploy && npm run build
  ```
  (Project Settings → Build & Development Settings → Build Command, in the
  Vercel dashboard — this isn't something the CLI config in this repo can
  set for you.)

### To actually deploy

Nothing here has been pushed or deployed — that's on you:

```bash
git push                 # if origin/main is behind
```

Once GitHub has your commits, Vercel deploys `main` automatically. To watch
it or trigger one manually instead:

```bash
vercel ls                # list recent deployments
vercel --prod             # manually trigger a production deployment
```

### If you ever start over on a fresh Vercel/Neon account

1. `vercel link` to create/link a Vercel project.
2. `vercel install neon` to provision Postgres and connect it — this sets
   `DATABASE_URL`/`DATABASE_URL_UNPOOLED` for you.
3. Generate and add the auth secret:
   ```bash
   AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
   printf '%s' "$AUTH_SECRET" | vercel env add AUTH_SECRET production
   printf '%s' "$AUTH_SECRET" | vercel env add AUTH_SECRET preview
   printf '%s' "$AUTH_SECRET" | vercel env add AUTH_SECRET development
   ```
4. `vercel env pull .env.local` and `npm run db:migrate` to apply the schema.
5. Set the Build Command override described above.
6. Push to `main` (or `vercel --prod`).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint
- `npm run db:migrate` — create/apply a Prisma migration
- `npm run db:studio` — open Prisma Studio

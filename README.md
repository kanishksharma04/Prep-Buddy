# Prep Buddy

A minimalistic study planner. Create subjects, paste in your syllabus as
topics, check them off as you study, and track a live countdown to each exam
date.

**Live app:** https://prepbuddy-app.vercel.app
*(if you hit a Vercel login wall instead of the app, deployment protection is
still on — see [Deployment](#deployment))*

## Features

- **Email/password accounts** — sign up, log in, log out, sessions.
- **Subjects** with an optional exam date — create, rename, delete.
- **Topics** — add one at a time or paste your whole syllabus at once (one
  topic per line), reorder, edit, delete, check off as you study.
- **Per-subject progress bar** — percentage of topics done.
- **Live exam countdown** — days + hours remaining, color-coded by urgency
  (green → amber → red as the date approaches, grey once it's passed).
- **Dashboard** — every subject as a card, sorted by nearest exam, with a
  summary strip (total topics, done, next exam), or switch to a **calendar
  view**: exam dates appear automatically, and you can add your own class
  entries (with an optional link) to any day.
- **Dark / light theme**, persisted across visits, no flash of the wrong
  theme on load.
- Confirm-before-delete dialogs, toasts on save, loading skeletons, and a
  keyboard-accessible, WCAG-contrast-checked UI in both themes.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Prisma](https://www.prisma.io) + [Neon Postgres](https://neon.tech)
- [Auth.js (NextAuth v5)](https://authjs.dev) with a Credentials provider
- [Zod](https://zod.dev) for validation
- Deployed on [Vercel](https://vercel.com)

## Getting started

```bash
git clone https://github.com/kanishksharma04/Prep-Buddy.git
cd Prep-Buddy
npm install
vercel env pull .env.local   # pulls real Neon + auth values from Vercel
npm run dev
```

If you're not using the Vercel CLI, copy `.env.example` to `.env.local` and
fill in the values by hand instead — see [Environment variables](#environment-variables).

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment variables

| Variable                | Purpose                                                 |
| ----------------------- | -------------------------------------------------------- |
| `DATABASE_URL`          | Pooled Neon Postgres connection string (Prisma runtime) |
| `DATABASE_URL_UNPOOLED` | Direct Neon connection string (Prisma migrations)       |
| `AUTH_SECRET`           | Secret used by Auth.js to sign/encrypt sessions         |

See [.env.example](./.env.example) for the full list with descriptions.
`DATABASE_URL` and `DATABASE_URL_UNPOOLED` are provisioned automatically by
the Vercel Neon integration and kept in sync via `vercel env pull`.
`AUTH_SECRET` is generated once with `npx auth secret`.

All three are validated at process startup ([src/lib/env.ts](./src/lib/env.ts) +
[src/instrumentation.ts](./src/instrumentation.ts)) — a missing or empty
value fails the server at boot with a specific message, not on the first
request that happens to touch the database.

## Project structure

```
src/
  app/            Next.js App Router routes, layouts, global styles, metadata
  components/     UI components (auth forms, subjects, topics, calendar, dashboard, layout/header, theme, brand/logo, ui/ shared primitives)
  lib/            Server-side utilities (Prisma client, env validation, auth actions/guards, validation)
  generated/      Prisma Client output (generated, gitignored)
  auth.ts         Auth.js (NextAuth v5) configuration
  proxy.ts        Route protection (Next.js 16's replacement for middleware.ts)
  instrumentation.ts  Runs env validation once at server boot
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

## Deployment

The Vercel project and Neon database are already provisioned and connected —
this section is both a record of that and a checklist for redoing it from
scratch elsewhere.

### Already configured

- **Vercel project** `prep-buddy`, connected to the `kanishksharma04/Prep-Buddy`
  GitHub repo with `main` as the production branch. Pushing to `main`
  triggers an automatic production deploy; other branches/PRs get preview
  deploys. Framework preset, build command, and install command are all
  auto-detected correctly.
- **Neon Postgres database**, provisioned through the Vercel Neon
  integration and connected to the project.
- **Environment variables**, present in Vercel for Production, Preview, and
  Development: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET` (plus a
  handful of other Neon-provided `PG*`/`POSTGRES_*` vars this app doesn't
  read — harmless to leave in place).
- **Database schema** — the `init` migration has been applied to the real
  Neon database, not just written locally.
- **Live aliases**: https://prepbuddy-app.vercel.app plus the default
  `prep-buddy-*.vercel.app` domains Vercel assigns automatically.

### Known issue: deployment protection

The project currently has Vercel's "Vercel Authentication" deployment
protection turned on, which gates every URL (including the aliases above)
behind a Vercel login. To make it publicly reachable: Vercel dashboard →
`prep-buddy` project → Settings → Deployment Protection → turn off "Vercel
Authentication" (or scope it to Preview only, keeping Production public).

### One thing to set before your next schema change

`next build` does not run `prisma migrate deploy`. The current schema is
already applied, so this isn't urgent, but any future migration needs it.
Vercel dashboard → Project Settings → Build & Development Settings → Build
Command:
```
npx prisma migrate deploy && npm run build
```

### To deploy

```bash
git push          # triggers an automatic production deploy via GitHub
vercel ls          # list recent deployments
vercel --prod      # trigger a production deployment manually instead
```

### Starting over on a fresh Vercel/Neon account

1. `vercel link` to create/link a Vercel project.
2. `vercel install neon` to provision Postgres and connect it — sets
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

## How it's built

Implementation notes for anyone extending this project.

### Authentication

- Config: [src/auth.ts](./src/auth.ts) — Auth.js (NextAuth v5) with a single Credentials provider, JWT session strategy (no database sessions/adapter — sessions aren't part of the data model). `trustHost: true` since self-hosted `next start` (unlike Vercel) doesn't auto-detect a trusted host.
- `authorize()` looks up the user by email via Prisma and checks the password with `bcryptjs`.
- Route protection: [src/proxy.ts](./src/proxy.ts) (Next.js 16 renamed `middleware.ts` → `proxy.ts`) matches `/dashboard/:path*` and `/subjects/:path*`, deferring the allow/deny decision to the `authorized` callback in `src/auth.ts`.
- Server Actions ([src/lib/actions/auth.ts](./src/lib/actions/auth.ts)) aren't covered by the proxy matcher (Server Actions are POSTs to the page route, not separate routes), so every mutation must independently check the session — see [src/lib/auth-guard.ts](./src/lib/auth-guard.ts)'s `requireUser()`, used by the dashboard page.
- Validation: [src/lib/validation/auth.ts](./src/lib/validation/auth.ts) — Zod schemas for login/signup, including password-confirmation matching.
- If Auth.js redirects to `/login?error=...` (e.g. a stale session bounced by the `authorized` callback), the login page shows a message instead of silently landing on a blank form.

### Layout & theme

- Header: [src/components/layout/header.tsx](./src/components/layout/header.tsx) — logo, session-aware nav, theme toggle. Rendered once in the root layout.
- Logo: [src/components/brand/logo-mark.tsx](./src/components/brand/logo-mark.tsx) / [logo.tsx](./src/components/brand/logo.tsx) — inline SVG (clock + open book + check), theme-aware. Favicon: [src/app/icon.svg](./src/app/icon.svg).
- Theme: dark/light via a `.dark` class on `<html>`, persisted in `localStorage`, falling back to `prefers-color-scheme`. [theme-init-script.ts](./src/components/theme/theme-init-script.ts) runs as a `beforeInteractive` `next/script` so the class is set before first paint — no flash of the wrong theme.
- [ThemeToggle](./src/components/theme/theme-toggle.tsx): a day/night sliding switch (sun-and-clouds ↔ moon-and-stars) instead of a plain icon button — the thumb (sun/moon) and the track's gradient/decorations all crossfade and slide via `dark:` variants, no JS animation. `role="switch"`/`aria-checked` is synced in a mount effect (same pattern as `useCountdown`: the real theme is already set by `theme-init-script.ts` before hydration, so reading `document.documentElement.classList` on mount avoids a server/client mismatch rather than guessing during render).
- Accessibility: [skip-link.tsx](./src/components/layout/skip-link.tsx) is the first focusable element on every page, landing on `#main-content`. All interactive elements use `focus-visible` outlines.

### Subjects & topics

- Dashboard ([src/app/dashboard/page.tsx](./src/app/dashboard/page.tsx)) fetches the signed-in user's subjects and topics, sorts by nearest upcoming exam ([src/lib/sort-subjects.ts](./src/lib/sort-subjects.ts)), and renders a summary strip + cards, with an empty state when there are none.
- Subject actions ([src/lib/actions/subjects.ts](./src/lib/actions/subjects.ts)) and topic actions ([src/lib/actions/topics.ts](./src/lib/actions/topics.ts)) are all Zod-validated and scoped to the authenticated user — subjects via `where: { id, userId }`, topics (which have no direct `userId`) via `findFirst({ where: { id, subject: { userId } } })` before acting.
- Adding topics is one textarea, one topic per line — a single topic and a full pasted syllabus go through the same field. Blank lines filtered, capped at 500 per submission.
- Topic reorder is up/down buttons, not drag-and-drop (avoids a DnD dependency) — swaps the `order` value with the adjacent topic in a `$transaction`.
- Check/uncheck uses `useOptimistic` — instant checkbox + strikethrough, server call in the background.
- Rename/edit are inline (click → input + Save/Cancel); delete uses [ConfirmDialog](./src/components/ui/confirm-dialog.tsx).
- [SubjectLinks](./src/components/subjects/subject-links.tsx) — an "Important links" section on the subject detail page: a title + URL per entry (syllabus PDFs, shared docs, anything worth keeping handy), add/remove, no date attached (unlike `ClassEvent`). Own model (`SubjectLink`), scoped to the subject the same way topics are (`findFirst({ where: { id, subject: { userId } } })`, since it has no direct `userId` either).

### Calendar

- Dashboard view toggle ([src/components/dashboard/view-toggle.tsx](./src/components/dashboard/view-toggle.tsx)) switches between the subjects list and a month calendar — no new dependency, a custom grid built on [src/lib/calendar.ts](./src/lib/calendar.ts)'s pure `getMonthGrid()` (unit-verified, including under a negative-UTC-offset timezone, before wiring into the UI).
- Every subject's exam date appears on the calendar automatically (red pill) — no separate step to add it.
- Classes have a **date range** (`startDate`/`endDate`, both required — a single-day class just has the same value in both) so one entry can represent "these classes run from X to Y," showing on every day it spans, not just its start. `eachUtcDateKeyInRange()` in `calendar.ts` expands a range onto calendar cells (capped at 366 days, also enforced server-side).
- Click any day to open [DayDetailDialog](./src/components/calendar/day-detail-dialog.tsx): shows that day's exam(s) (linking to the subject) and classes — each with its date range (if more than one day) and a "Join class →" link if it has one — plus a form to add a one-off class (title, end date if it spans multiple days, optional link, optional subject tag). Classes are their own model ([`ClassEvent`](./prisma/schema.prisma), `userId` + optional `subjectId`), not tied to a subject's exam date.
- [BulkClassLinksForm](./src/components/calendar/bulk-class-links-form.tsx) — starts empty; "+ Add subject" adds a row (subject dropdown + start/end date + join-class link), "Remove" takes one away. Not every subject needs a row — this is for the ones that actually have online classes. All rows submit together as parallel indexed form fields (`subjectId[]`, `startDate[]`, etc., since rows are added/removed client-side rather than being fixed one-per-subject) via `createClassLinksForSubjectsAction`.
- Dates are stored as UTC-midnight "date only" values (same convention as exam dates, see `toDateInputValue` in `format.ts`) and matched onto calendar cells via UTC getters — the classic pitfall here is a date shifting a day off in negative-UTC timezones if you mix local and UTC getters, which is exactly what the unit checks for `getMonthGrid`/`eachUtcDateKeyInRange` targeted before either was wired into the UI.
- Actions: [src/lib/actions/class-events.ts](./src/lib/actions/class-events.ts) — create (single + bulk)/delete, Zod-validated ([src/lib/validation/class-event.ts](./src/lib/validation/class-event.ts), including "end date ≥ start date"), scoped to the authenticated user; if a subject is tagged, it's re-verified as belonging to that user too.
- Gotcha worth knowing if you touch these forms: `showToast()` reaches into `ToastProvider`'s state (a different component), so calling it during render — even via the "derived render state" pattern used elsewhere in this codebase for a component's *own* state — throws "Cannot update a component while rendering a different component." It has to run in a `useEffect`; only same-component `setState` calls are safe to make directly during render. This was live in `SubjectCard`, `TopicRow`, and `ExamDatePicker` and only surfaced under E2E testing, since it's a runtime warning ESLint has no way to catch statically.

### Progress & countdown

- Progress bar: [progress-bar.tsx](./src/components/subjects/progress-bar.tsx) — `done / total` topics as a percentage, `role="progressbar"` + `aria-value*`.
- Countdown: [countdown.tsx](./src/components/subjects/countdown.tsx) wraps pure logic in [src/lib/countdown.ts](./src/lib/countdown.ts) (`getCountdown(examDate, now)`, unit-testable in isolation) — green `> 7d`, amber `<= 7d`, red `<= 2d`, grey once past. Ticks every 60s; starts as a client-only `null` state filled in after mount to avoid an SSR/hydration mismatch on the displayed hour.
- No-date and past-date cases are both handled explicitly ("No exam date set" / "Exam passed").

### UX, accessibility & responsive polish

- Confirm-before-delete: [confirm-dialog.tsx](./src/components/ui/confirm-dialog.tsx) — a native `<dialog>`, giving focus trapping, Escape-to-close, and backdrop-click-to-close for free.
- Toasts: [toast-context.tsx](./src/components/ui/toast-context.tsx) — a minimal `ToastProvider`/`useToast()` (no external library), `aria-live="polite"`.
- Error boundaries: [error.tsx](./src/app/error.tsx) (nested routes) and [global-error.tsx](./src/app/global-error.tsx) (root layout), both with a working "Try again".
- Loading skeletons: `loading.tsx` for the dashboard and subject detail routes.
- Contrast: every text/background pair audited against WCAG in both themes (script-computed ratios). Fixed two real failures — a delete-button hover state at 4.41:1 (now 5.91:1), and every bordered input/button at ~1.3:1 against the 3:1 UI-component minimum (added a `--color-control` token used specifically on interactive elements; decorative card borders keep the original subtle look).
- Automated a11y audit (axe-core) across every page in both themes — 0 violations. Verified real keyboard interaction too: dialog opens on Enter, Escape closes it, Tab cycles between its two buttons only.
- Mobile: audited every page at 375px for horizontal overflow — none found; fixed the header logo wrapping to two lines under pressure.

### Visual design & interactions

- Landing page ([src/app/page.tsx](./src/app/page.tsx)): ambient blurred glow behind the logo, three feature-highlight cards with icons, and a consistent hover language for every button/card (`hover:-translate-y-0.5/-1` + `hover:shadow-lg/md`, colored via `shadow-primary/30` so the shadow tints toward the brand color instead of plain grey).
- [MouseGlow](./src/components/brand/mouse-glow.tsx) — the ambient glow follows the cursor. Positioned by setting inline `left`/`top` (not `transform`) directly on a ref in a raw `mousemove` listener, deliberately skipping React state so moving the mouse never triggers a re-render; a `transition-all` class gives it a smooth chase instead of snapping. Gated behind `(hover: hover) and (pointer: fine)` so touch devices just keep the static default position instead of chasing the last touch point.
- Dashboard cards ([subject-card.tsx](./src/components/subjects/subject-card.tsx)): the whole card lifts + gains a shadow on hover; the left border is colored by the same urgency the countdown text already conveys (green/amber/red/grey, from a new shared [use-countdown.ts](./src/lib/use-countdown.ts) hook so the border and the countdown label tick off the same clock) — color reinforces, never replaces, the text. The subject-name link's chevron nudges right on hover; delete is now an icon-only trash button (kept an `aria-label` for accessibility) instead of a text button, to reduce visual noise.
- Progress bar ([progress-bar.tsx](./src/components/subjects/progress-bar.tsx)): the filled portion has a soft colored glow (`shadow-[0_0_8px_var(--tw-shadow-color)]` tinted via `shadow-primary/40`) and animates its width over 300ms instead of jumping.
- Summary strip ([summary-strip.tsx](./src/components/subjects/summary-strip.tsx)): each stat now has an icon in a tinted circular badge that scales up slightly on hover, with a divider between stats on larger screens instead of a plain grid.
- View toggle and "Add subject" button both picked up matching hover treatment (smoother tab color transition; lift + colored shadow on the submit button) so the whole dashboard reads as one consistent interaction language rather than a patchwork of components.
- Verified by hovering every element above in a real browser (Playwright, against a scratch user + real Neon data, both themes) and reading `getComputedStyle` before/after — not just comparing screenshots, since a shadow/border-color diff is easy to miss by eye. One methodology gotcha: `page.emulateMedia({ colorScheme })` does nothing here, since the theme toggle is a manual `classList` + `localStorage` switch, not a `prefers-color-scheme` listener — dark mode has to be tested by actually clicking the toggle.
- A second pass pushed the whole app toward a more premium SaaS look (think Linear/Vercel), built around one signature two-tone gradient (`--primary` → new `--accent` violet token, [globals.css](./src/app/globals.css)) reused everywhere on purpose rather than introducing several different accent colors: the logo wordmark, primary buttons, the progress bar fill, and the view-toggle's sliding indicator all pull from the same `from-primary to-accent` gradient.
  - App-wide ambient backdrop: a `body::before` pseudo-element with two fixed, low-opacity radial gradients pinned to the viewport corners (`--ambient-strength` swaps between a faint 5% in light mode and a visible 16% in dark mode, since the same tint barely registers on white but needs to be much stronger to read against near-black). Pure CSS, no wrapper element, so it's present on every page for free.
  - Cards and inputs moved from flat `bg-background`/`rounded-lg` to a "glass" look — `bg-surface/60 backdrop-blur-sm rounded-2xl` — so the ambient backdrop subtly shows through. Chose 60% opacity specifically because it's blending two colors that are already close in tone within each theme (checked the composite doesn't meaningfully shift off the already-audited base contrast).
  - Header ([header.tsx](./src/components/layout/header.tsx)) is a sticky frosted-glass bar (`bg-background/70 backdrop-blur-md`) instead of a solid one.
  - [ViewToggle](./src/components/dashboard/view-toggle.tsx) got a real sliding pill indicator behind the active tab, instead of just swapping each button's background — deliberately built by measuring the active tab's actual `offsetLeft`/`offsetWidth` in an effect (re-measured on window resize) rather than assuming a fixed width, since the earlier plan to add this had been shelved over exactly that fragility concern.
  - Subject cards keep their urgency-colored left border, now paired with a matching-colored `hover:shadow-*` glow (e.g. a red-tinted shadow for an imminent exam) instead of a flat grey one, so hovering reinforces the same urgency signal rather than looking generic.
- **A third pass replaced that blue/violet gradient-and-glassmorphism system entirely** — it read as generic "AI SaaS template" rather than a designed product. Went looking for a point of view instead: a "study desk" aesthetic, since this is a study planner. Every screen was re-skinned; nothing from the glass/gradient pass survived.
  - Palette ([globals.css](./src/app/globals.css)): warm paper tones — cream/desk-tan background, terracotta `--primary`, amber/gold `--accent` (now used as a highlighter color, not a gradient partner). Dark mode is a "study lamp at night" — warm espresso browns, not the usual near-black-with-neon-blue. Contrast-checked every foreground/background pair by hand (`luminance`/`contrast ratio` script) before touching a single component, specifically to catch a too-light `--muted-foreground` in the new palette (4.99:1 → confirmed fine) rather than eyeballing it.
  - Typography: added Fraunces, a warm variable display serif (`next/font/google`, `opsz`/`SOFT`/`WONK` axes), used only for headings/titles/logo — the one deliberately "designed" choice that a sans-only template wouldn't make. Body copy stays sans for readability.
  - Texture, not gradient blobs: the old ambient blue/violet radial-gradient backdrop is gone, replaced by a tiled SVG `feTurbulence` noise filter on `body::before` (`--grain-opacity` swaps 5%/7% between themes) — genuine paper grain instead of a glowing color blob, which was itself becoming its own cliché.
  - Every card (subject cards, stat cards, forms, dialogs) moved from `backdrop-blur` glass to solid paper: `bg-surface`, small radius (`rounded-lg`/`rounded-md`, not `2xl`), and a **hard offset shadow** (`shadow-[4px_4px_0_0_var(--paper-shadow)]`) instead of a blurred one — reads as a card sitting on a desk, not a frosted pane of glass.
  - Every primary button became a "paper button": solid color, hard offset shadow that shrinks and the button nudges 1px on hover, and fully presses flat (`active:translate-x-0.75 active:translate-y-0.75 active:shadow-none`) on click — a tactile press, not a glow-lift.
  - [SubjectCard](./src/components/subjects/subject-card.tsx): reimagined as an index card — a small alternating rotation per card (`rotate-[-0.6deg]`/`[0.5deg]`/`[-0.4deg]` by index) that straightens to `rotate-0` and lifts on hover, plus a rotated "washi tape" strip (colored by exam urgency) pinning it down instead of a flat left border.
  - [ProgressBar](./src/components/subjects/progress-bar.tsx): restyled as a highlighter stroke over a ruled line — `mix-blend-multiply` in light mode gives the fill genuine marker-over-paper translucency (multiplied against the paper-colored track); dark mode swaps to a plain glow since multiply against a dark track would just disappear.
  - [ViewToggle](./src/components/dashboard/view-toggle.tsx) kept its measured sliding indicator but switched from a full pill to `rounded-md` — reads as folder tabs, not a SaaS segmented control.
  - Landing page, auth pages, calendar, day-detail dialog, toasts, and empty/loading/error states all got the same treatment (paper cards, hard shadows, solid buttons, tilted stamp-style icon badges) — see individual component files for specifics.
  - Brand touchpoints carried the palette everywhere it appears outside the live app too: [icon.svg](./src/app/icon.svg) (favicon), [opengraph-image.tsx](./src/app/opengraph-image.tsx) (social preview), and the `viewport.themeColor` meta in [layout.tsx](./src/app/layout.tsx) all use the new terracotta/cream/espresso colors, not the old blue.
  - Verified with a full lint/typecheck/build pass, then a real-browser check against live data in both themes (landing, login/signup, dashboard list + calendar, subject detail) — confirmed via `getComputedStyle` that the card's hover rotate/lift/shadow-growth, the highlighter's `mix-blend-mode`, and the button press effect all actually fire, not just look right in a screenshot.
- A third pass carried that same premium/glass/gradient language to every remaining page and form, so nothing reads as an unfinished corner of the app:
  - Auth: [login](./src/app/login/page.tsx)/[signup](./src/app/signup/page.tsx) pages wrap their forms in a glass card; both submit buttons are the brand gradient.
  - Subject detail: [exam-date-picker.tsx](./src/components/subjects/exam-date-picker.tsx), [subject-links.tsx](./src/components/subjects/subject-links.tsx), [add-topics-form.tsx](./src/components/topics/add-topics-form.tsx), and [topic-row.tsx](./src/components/topics/topic-row.tsx) all moved to the same glass-card/gradient-button/`rounded-xl` language as the dashboard — topic rows also get a subtle hover border and fade their row-action buttons in on hover instead of showing them at full opacity all the time.
  - Calendar: [calendar-view.tsx](./src/components/calendar/calendar-view.tsx) — the "Today" button and exam/class markers are now gradient pills instead of flat rectangles, and the current day gets a soft ring instead of just a border. [day-detail-dialog.tsx](./src/components/calendar/day-detail-dialog.tsx) and [bulk-class-links-form.tsx](./src/components/calendar/bulk-class-links-form.tsx) got the same glass/gradient treatment as [confirm-dialog.tsx](./src/components/ui/confirm-dialog.tsx).
  - Toasts ([toast-context.tsx](./src/components/ui/toast-context.tsx)): now glass + backdrop-blur with a per-variant icon (a gradient checkmark badge for success, a plain outline circle for error) and a `toast-in` keyframe (defined in [globals.css](./src/app/globals.css)) for a slide-up-and-fade entrance instead of popping in instantly.
  - Loading states ([skeleton.tsx](./src/components/ui/skeleton.tsx)): replaced the flat `animate-pulse` block with a moving shimmer gradient (`background-position` keyframe sweeping a lighter band left-to-right), and bumped every skeleton's shape to match the real `rounded-2xl` cards it's standing in for — a mismatched skeleton shape is one of the fastest ways an app reads as unfinished.
  - Empty/fallback pages ([not-found.tsx](./src/app/not-found.tsx), [error.tsx](./src/app/error.tsx), [global-error.tsx](./src/app/global-error.tsx)) each got an icon in a tinted rounded badge above the heading, instead of just text, plus the gradient button.
  - Verified all of it in a real browser: login/signup, the 404 page, the calendar month view and day-detail dialog, the subject-detail page (rename/links/topics), and a triggered toast — screenshotted in light and dark, zero console errors.

### Production readiness

- Meta tags: [src/app/layout.tsx](./src/app/layout.tsx) — `metadataBase`, title template, description, Open Graph + Twitter card tags, per-theme `theme-color`. `robots: { index: false, follow: false }` since this is a personal planner, not a marketing site.
- OG/Twitter image: [src/app/opengraph-image.tsx](./src/app/opengraph-image.tsx) — generated at build time with `next/og`'s `ImageResponse`, no external asset.
- 404 page: [src/app/not-found.tsx](./src/app/not-found.tsx).
- `next.config.ts`: `poweredByHeader: false`, Turbopack root pinned.

### Database

- Schema: [prisma/schema.prisma](./prisma/schema.prisma) — `User` → `Subject` → `Topic`, cascade deletes on both relations.
- Client: [src/lib/db.ts](./src/lib/db.ts) — a cached singleton using the Neon serverless driver adapter, safe for Next.js dev hot-reload.
- Config: [prisma.config.ts](./prisma.config.ts) — points the Prisma CLI (migrate/studio) at the direct connection; runtime queries use the pooled one via the adapter.

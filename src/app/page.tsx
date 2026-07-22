export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Prep Buddy
        </h1>
        <p className="text-muted-foreground mx-auto max-w-md text-balance">
          Track your syllabus, check off topics, and watch the countdown to
          exam day.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="/signup"
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Get started
        </a>
        <a
          href="/login"
          className="border-border rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Log in
        </a>
      </div>

      <p className="text-muted-foreground text-xs">
        Auth and dashboard land in a later phase — this is the Phase 1
        placeholder.
      </p>
    </main>
  );
}

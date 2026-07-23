import Link from "next/link";
import { auth } from "@/auth";
import { LogoMark } from "@/components/brand/logo-mark";

const features = [
  {
    title: "Every subject, tracked",
    description: "Paste your whole syllabus and check off topics as you go.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M9 11l2 2 4-4M9 17l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Live exam countdown",
    description: "Color-coded urgency so you always know how much time is left.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    title: "Calendar & class links",
    description: "See exam dates and class links at a glance, all in one place.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),
  },
];

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <main
      id="main-content"
      className="relative flex flex-1 flex-col items-center justify-center gap-12 overflow-hidden px-6 py-16 text-center"
    >
      <div
        aria-hidden="true"
        className="bg-primary/20 dark:bg-primary/25 pointer-events-none absolute top-1/4 left-1/2 h-128 w-lg -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-5">
        <LogoMark className="h-16 w-16 dark:drop-shadow-[0_0_20px_rgba(59,130,246,0.55)]" />

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Prep Buddy
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-balance sm:text-lg">
            Track your syllabus, check off topics, and watch the countdown to
            exam day.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="bg-primary text-primary-foreground hover:shadow-primary/30 rounded-md px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground hover:shadow-primary/30 rounded-md px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="border-control rounded-md border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="relative grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="border-border hover:border-primary rounded-lg border p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-primary mb-3">{feature.icon}</div>
            <h2 className="text-sm font-semibold">{feature.title}</h2>
            <p className="text-muted-foreground mt-1 text-xs">{feature.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

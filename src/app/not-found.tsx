import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center"
    >
      <div className="bg-primary/10 text-primary flex h-14 w-14 -rotate-3 items-center justify-center rounded-md">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-7 w-7"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3M9 11h4" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or you don&rsquo;t have access to it.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_var(--paper-shadow)] transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--paper-shadow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
      >
        Back to Prep Buddy
      </Link>
    </main>
  );
}

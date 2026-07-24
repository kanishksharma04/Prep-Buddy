import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navLinkClasses =
  "rounded-md px-3 py-2 text-sm font-medium hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={navLinkClasses}>
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="border-control rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:hover:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-400"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClasses}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

import { requireUser } from "@/lib/auth-guard";
import { logoutAction } from "@/lib/actions/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Signed in as {user.email}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="border-border rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Log out
          </button>
        </form>
      </div>

      <p className="text-muted-foreground text-sm">
        Subjects, topics, and countdowns land in later phases — this page just
        proves the auth + route protection works end to end.
      </p>
    </main>
  );
}

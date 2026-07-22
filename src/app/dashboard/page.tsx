import { requireUser } from "@/lib/auth-guard";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Signed in as {user.email}
        </p>
      </div>

      <p className="text-muted-foreground text-sm">
        Subjects, topics, and countdowns land in later phases — this page just
        proves the auth + route protection works end to end.
      </p>
    </main>
  );
}

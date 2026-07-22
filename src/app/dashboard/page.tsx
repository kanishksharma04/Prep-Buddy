import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { CreateSubjectForm } from "@/components/subjects/create-subject-form";
import { SubjectCard } from "@/components/subjects/subject-card";

export default async function DashboardPage() {
  const user = await requireUser();

  const subjects = await db.subject.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
  });

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

      <CreateSubjectForm />

      {subjects.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-lg border border-dashed p-6 text-center text-sm">
          No subjects yet — add your first one above to start tracking its
          syllabus.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </ul>
      )}
    </main>
  );
}

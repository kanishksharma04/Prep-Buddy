import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { sortByNearestExam, findNextExam } from "@/lib/sort-subjects";
import { CreateSubjectForm } from "@/components/subjects/create-subject-form";
import { SubjectCard } from "@/components/subjects/subject-card";
import { SummaryStrip } from "@/components/subjects/summary-strip";

export default async function DashboardPage() {
  const user = await requireUser();

  const subjectsRaw = await db.subject.findMany({
    where: { userId: user.id },
    include: { topics: { select: { isDone: true } } },
  });

  const subjects = sortByNearestExam(
    subjectsRaw.map((subject) => ({
      ...subject,
      topicsTotal: subject.topics.length,
      topicsDone: subject.topics.filter((topic) => topic.isDone).length,
    })),
  );

  const totalTopics = subjects.reduce((sum, s) => sum + s.topicsTotal, 0);
  const doneTopics = subjects.reduce((sum, s) => sum + s.topicsDone, 0);
  const nextExamSubject = findNextExam(subjects);

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

      {subjects.length > 0 ? (
        <SummaryStrip
          totalTopics={totalTopics}
          doneTopics={doneTopics}
          nextExam={
            nextExamSubject
              ? { subjectName: nextExamSubject.name, examDate: nextExamSubject.examDate! }
              : null
          }
        />
      ) : null}

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

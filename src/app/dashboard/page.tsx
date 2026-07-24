import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { sortByNearestExam, findNextExam } from "@/lib/sort-subjects";
import { CreateSubjectForm } from "@/components/subjects/create-subject-form";
import { SubjectCard } from "@/components/subjects/subject-card";
import { SummaryStrip } from "@/components/subjects/summary-strip";
import { CalendarView } from "@/components/calendar/calendar-view";
import { ViewToggle } from "@/components/dashboard/view-toggle";

export default async function DashboardPage() {
  const user = await requireUser();

  const [subjectsRaw, classEventsRaw] = await Promise.all([
    db.subject.findMany({
      where: { userId: user.id },
      include: { topics: { select: { isDone: true } } },
    }),
    db.classEvent.findMany({
      where: { userId: user.id },
      include: { subject: { select: { name: true } } },
      orderBy: { startDate: "asc" },
    }),
  ]);

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

  const examMarkers = subjectsRaw
    .filter((subject) => subject.examDate)
    .map((subject) => ({
      subjectId: subject.id,
      subjectName: subject.name,
      examDate: subject.examDate!,
    }));

  const classMarkers = classEventsRaw.map((event) => ({
    id: event.id,
    title: event.title,
    link: event.link,
    subjectName: event.subject?.name ?? null,
    startDate: event.startDate,
    endDate: event.endDate,
  }));

  const subjectOptions = subjectsRaw.map((subject) => ({ id: subject.id, name: subject.name }));

  const listView =
    subjects.length === 0 ? (
      <div className="border-border flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
        <div className="bg-primary/10 text-primary flex h-12 w-12 -rotate-3 items-center justify-center rounded-md">
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
        </div>
        <p className="text-muted-foreground max-w-xs text-sm">
          No subjects yet — add your first one above to start tracking its syllabus.
        </p>
      </div>
    ) : (
      <ul className="flex flex-col gap-4">
        {subjects.map((subject, index) => (
          <SubjectCard key={subject.id} subject={subject} index={index} />
        ))}
      </ul>
    );

  const calendarView = (
    <CalendarView exams={examMarkers} classEvents={classMarkers} subjects={subjectOptions} />
  );

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16"
    >
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
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

      <ViewToggle listView={listView} calendarView={calendarView} />
    </main>
  );
}

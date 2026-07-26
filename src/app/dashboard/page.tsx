import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { sortByNearestExam, findNextExam } from "@/lib/sort-subjects";
import { getPace } from "@/lib/pace";
import { CreateSubjectForm } from "@/components/subjects/create-subject-form";
import { SubjectList } from "@/components/subjects/subject-list";
import { SummaryStrip } from "@/components/subjects/summary-strip";
import { CalendarView } from "@/components/calendar/calendar-view";
import { ViewToggle } from "@/components/dashboard/view-toggle";
import { StreakHeatmap } from "@/components/dashboard/streak-heatmap";
import { DueForRevision } from "@/components/dashboard/due-for-revision";
import { PaceRollup } from "@/components/dashboard/pace-rollup";
import { REVISION_INTERVALS_DAYS, getNextReviewDate, isDueForRevision } from "@/lib/revision";

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();

  const [subjectsRaw, classEventsRaw, completedTopics, revisableTopics] = await Promise.all([
    db.subject.findMany({
      where: { userId: user.id },
      include: { topics: { select: { isDone: true } } },
    }),
    db.classEvent.findMany({
      where: { userId: user.id },
      include: { subject: { select: { name: true } } },
      orderBy: { startDate: "asc" },
    }),
    db.topic.findMany({
      where: { subject: { userId: user.id }, completedAt: { not: null } },
      select: {
        id: true,
        title: true,
        subjectId: true,
        completedAt: true,
        subject: { select: { name: true } },
      },
    }),
    db.topic.findMany({
      where: {
        subject: { userId: user.id },
        isDone: true,
        revisionStage: { lt: REVISION_INTERVALS_DAYS.length },
      },
      select: {
        id: true,
        title: true,
        subjectId: true,
        isDone: true,
        completedAt: true,
        revisionStage: true,
        lastRevisedAt: true,
        subject: { select: { name: true } },
      },
    }),
  ]);

  const dueTopics = revisableTopics
    .filter((topic) => isDueForRevision(topic, now))
    .map((topic) => ({
      id: topic.id,
      title: topic.title,
      subjectId: topic.subjectId,
      subjectName: topic.subject.name,
      revisionStage: topic.revisionStage,
      dueDate: getNextReviewDate(topic)!,
    }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

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

  // Computed once and reused for both the per-card badges and the
  // dashboard-wide rollup, so the two never drift out of sync.
  const subjectPaces = subjects.map((subject) =>
    getPace({
      examDate: subject.examDate,
      createdAt: subject.createdAt,
      topicsTotal: subject.topicsTotal,
      topicsDone: subject.topicsDone,
      now,
    }),
  );

  const paceRollupSubjects = subjects
    .map((subject, index) => {
      const pace = subjectPaces[index];
      return pace ? { id: subject.id, name: subject.name, status: pace.status } : null;
    })
    .filter((subject) => subject !== null);

  const paceById = Object.fromEntries(subjects.map((subject, index) => [subject.id, subjectPaces[index]]));
  const subjectsByOrder = [...subjects].sort((a, b) => a.order - b.order);

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

  const studyMarkers = completedTopics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    subjectId: topic.subjectId,
    subjectName: topic.subject.name,
    completedAt: topic.completedAt!,
  }));

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
      <SubjectList subjectsByExam={subjects} subjectsByOrder={subjectsByOrder} paceById={paceById} />
    );

  const calendarView = (
    <CalendarView
      exams={examMarkers}
      classEvents={classMarkers}
      studyActivity={studyMarkers}
      subjects={subjectOptions}
    />
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
        <>
          <PaceRollup subjects={paceRollupSubjects} />
          <SummaryStrip
            totalTopics={totalTopics}
            doneTopics={doneTopics}
            nextExam={
              nextExamSubject
                ? { subjectName: nextExamSubject.name, examDate: nextExamSubject.examDate! }
                : null
            }
          />
          <DueForRevision dueTopics={dueTopics} totalEligible={revisableTopics.length} />
          <StreakHeatmap
            completedDates={completedTopics.map((topic) => topic.completedAt!)}
            now={now}
          />
        </>
      ) : null}

      <CreateSubjectForm />

      <ViewToggle listView={listView} calendarView={calendarView} />
    </main>
  );
}

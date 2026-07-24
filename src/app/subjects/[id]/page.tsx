import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { AddTopicsForm } from "@/components/topics/add-topics-form";
import { TopicRow } from "@/components/topics/topic-row";
import { ExamDatePicker } from "@/components/subjects/exam-date-picker";
import { Countdown } from "@/components/subjects/countdown";
import { ProgressBar } from "@/components/subjects/progress-bar";
import { SubjectLinks } from "@/components/subjects/subject-links";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const subject = await db.subject.findFirst({
    where: { id, userId: user.id },
    include: {
      topics: { orderBy: { order: "asc" } },
      links: { orderBy: { order: "asc" } },
    },
  });
  if (!subject) {
    notFound();
  }

  const doneCount = subject.topics.filter((topic) => topic.isDone).length;

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16"
    >
      <div>
        <Link
          href="/dashboard"
          className="text-muted-foreground rounded-md text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          ← Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{subject.name}</h1>
      </div>

      <div className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)] sm:flex-row sm:items-end sm:justify-between">
        <ExamDatePicker subjectId={subject.id} examDate={subject.examDate} />
        <Countdown examDate={subject.examDate} />
      </div>

      <ProgressBar total={subject.topics.length} done={doneCount} />

      <SubjectLinks subjectId={subject.id} links={subject.links} />

      <AddTopicsForm subjectId={subject.id} />

      {subject.topics.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-lg border border-dashed p-8 text-center text-sm">
          No topics yet — paste your syllabus above, one topic per line.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {subject.topics.map((topic, index) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              isFirst={index === 0}
              isLast={index === subject.topics.length - 1}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

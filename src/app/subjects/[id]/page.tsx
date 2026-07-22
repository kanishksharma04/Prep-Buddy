import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { AddTopicsForm } from "@/components/topics/add-topics-form";
import { TopicRow } from "@/components/topics/topic-row";
import { ExamDatePicker } from "@/components/subjects/exam-date-picker";
import { Countdown } from "@/components/subjects/countdown";
import { ProgressBar } from "@/components/subjects/progress-bar";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const subject = await db.subject.findFirst({
    where: { id, userId: user.id },
    include: { topics: { orderBy: { order: "asc" } } },
  });
  if (!subject) {
    notFound();
  }

  const doneCount = subject.topics.filter((topic) => topic.isDone).length;

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16"
    >
      <div>
        <Link
          href="/dashboard"
          className="text-muted-foreground rounded-md text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{subject.name}</h1>
      </div>

      <div className="border-border flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-end sm:justify-between">
        <ExamDatePicker subjectId={subject.id} examDate={subject.examDate} />
        <Countdown examDate={subject.examDate} />
      </div>

      <ProgressBar total={subject.topics.length} done={doneCount} />

      <AddTopicsForm subjectId={subject.id} />

      {subject.topics.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-lg border border-dashed p-6 text-center text-sm">
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { AddTopicsForm } from "@/components/topics/add-topics-form";
import { TopicRow } from "@/components/topics/topic-row";

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
        <p className="text-muted-foreground text-sm">
          {subject.examDate ? `Exam: ${formatDate(subject.examDate)}` : "No exam date set"}
        </p>
      </div>

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

"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { addTopicsSchema, editTopicSchema } from "@/lib/validation/topic";

export type TopicFormState = { error?: string; ok?: boolean } | undefined;

const MAX_BULK_TOPICS = 500;

export async function addTopicsAction(
  _prevState: TopicFormState,
  formData: FormData,
): Promise<TopicFormState> {
  const user = await requireUser();

  const parsed = addTopicsSchema.safeParse({
    subjectId: formData.get("subjectId"),
    titles: formData.get("titles"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const subject = await db.subject.findFirst({
    where: { id: parsed.data.subjectId, userId: user.id },
    select: { id: true },
  });
  if (!subject) {
    return { error: "Subject not found" };
  }

  const titles = parsed.data.titles
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_BULK_TOPICS);

  if (titles.length === 0) {
    return { error: "Enter at least one topic" };
  }

  const startOrder = await db.topic.count({ where: { subjectId: subject.id } });

  await db.topic.createMany({
    data: titles.map((title, index) => ({
      subjectId: subject.id,
      title,
      order: startOrder + index,
    })),
  });

  revalidatePath(`/subjects/${subject.id}`);
  return { ok: true };
}

export async function editTopicAction(
  _prevState: TopicFormState,
  formData: FormData,
): Promise<TopicFormState> {
  const user = await requireUser();

  const parsed = editTopicSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const topic = await db.topic.findFirst({
    where: { id: parsed.data.id, subject: { userId: user.id } },
  });
  if (!topic) {
    return { error: "Topic not found" };
  }

  await db.topic.update({
    where: { id: topic.id },
    data: { title: parsed.data.title },
  });

  revalidatePath(`/subjects/${topic.subjectId}`);
  return { ok: true };
}

export async function deleteTopicAction(formData: FormData) {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const topic = await db.topic.findFirst({
    where: { id, subject: { userId: user.id } },
  });
  if (!topic) return;

  await db.topic.delete({ where: { id: topic.id } });
  revalidatePath(`/subjects/${topic.subjectId}`);
}

export async function toggleTopicAction(id: string, isDone: boolean) {
  const user = await requireUser();

  const topic = await db.topic.findFirst({
    where: { id, subject: { userId: user.id } },
  });
  if (!topic) return;

  await db.topic.update({ where: { id: topic.id }, data: { isDone } });
  revalidatePath(`/subjects/${topic.subjectId}`);
}

export async function moveTopicAction(formData: FormData) {
  const user = await requireUser();

  const id = formData.get("id");
  const direction = formData.get("direction");
  if (typeof id !== "string" || !id) return;
  if (direction !== "up" && direction !== "down") return;

  const topic = await db.topic.findFirst({
    where: { id, subject: { userId: user.id } },
  });
  if (!topic) return;

  const neighbor = await db.topic.findFirst({
    where: {
      subjectId: topic.subjectId,
      order: direction === "up" ? { lt: topic.order } : { gt: topic.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await db.$transaction([
    db.topic.update({ where: { id: topic.id }, data: { order: neighbor.order } }),
    db.topic.update({ where: { id: neighbor.id }, data: { order: topic.order } }),
  ]);

  revalidatePath(`/subjects/${topic.subjectId}`);
}

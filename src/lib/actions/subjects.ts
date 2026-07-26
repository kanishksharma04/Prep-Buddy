"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { subjectSchema, examDateSchema } from "@/lib/validation/subject";

export type SubjectFormState = { error?: string; ok?: boolean } | undefined;

export async function createSubjectAction(
  _prevState: SubjectFormState,
  formData: FormData,
): Promise<SubjectFormState> {
  const user = await requireUser();

  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    examDate: formData.get("examDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const count = await db.subject.count({ where: { userId: user.id } });

  await db.subject.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      examDate: parsed.data.examDate ? new Date(parsed.data.examDate) : null,
      order: count,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function renameSubjectAction(
  _prevState: SubjectFormState,
  formData: FormData,
): Promise<SubjectFormState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Invalid subject" };
  }

  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    examDate: formData.get("examDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await db.subject.updateMany({
    where: { id, userId: user.id },
    data: {
      name: parsed.data.name,
      examDate: parsed.data.examDate ? new Date(parsed.data.examDate) : null,
    },
  });

  if (result.count === 0) {
    return { error: "Subject not found" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateExamDateAction(
  _prevState: SubjectFormState,
  formData: FormData,
): Promise<SubjectFormState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Invalid subject" };
  }

  const parsed = examDateSchema.safeParse({ examDate: formData.get("examDate") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await db.subject.updateMany({
    where: { id, userId: user.id },
    data: { examDate: parsed.data.examDate ? new Date(parsed.data.examDate) : null },
  });

  if (result.count === 0) {
    return { error: "Subject not found" };
  }

  revalidatePath(`/subjects/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteSubjectAction(formData: FormData) {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await db.subject.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard");
}

export async function moveSubjectAction(formData: FormData) {
  const user = await requireUser();

  const id = formData.get("id");
  const direction = formData.get("direction");
  if (typeof id !== "string" || !id) return;
  if (direction !== "up" && direction !== "down") return;

  const subject = await db.subject.findFirst({ where: { id, userId: user.id } });
  if (!subject) return;

  const neighbor = await db.subject.findFirst({
    where: {
      userId: user.id,
      order: direction === "up" ? { lt: subject.order } : { gt: subject.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await db.$transaction([
    db.subject.update({ where: { id: subject.id }, data: { order: neighbor.order } }),
    db.subject.update({ where: { id: neighbor.id }, data: { order: subject.order } }),
  ]);

  revalidatePath("/dashboard");
}

export async function reorderSubjectsAction(orderedIds: string[]) {
  const user = await requireUser();

  const subjects = await db.subject.findMany({ where: { userId: user.id }, select: { id: true } });
  const subjectIds = new Set(subjects.map((subject) => subject.id));
  if (orderedIds.length !== subjectIds.size || !orderedIds.every((id) => subjectIds.has(id))) {
    return;
  }

  await db.$transaction(
    orderedIds.map((id, index) => db.subject.update({ where: { id }, data: { order: index } })),
  );

  revalidatePath("/dashboard");
}

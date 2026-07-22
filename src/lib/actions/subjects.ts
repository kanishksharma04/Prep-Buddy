"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { subjectSchema } from "@/lib/validation/subject";

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

export async function deleteSubjectAction(formData: FormData) {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await db.subject.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard");
}

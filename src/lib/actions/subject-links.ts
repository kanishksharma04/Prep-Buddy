"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { subjectLinkSchema } from "@/lib/validation/subject-link";

export type SubjectLinkFormState = { error?: string; ok?: boolean } | undefined;

export async function createSubjectLinkAction(
  _prevState: SubjectLinkFormState,
  formData: FormData,
): Promise<SubjectLinkFormState> {
  const user = await requireUser();

  const subjectId = String(formData.get("subjectId") ?? "").trim();
  if (!subjectId) {
    return { error: "Invalid subject" };
  }

  const parsed = subjectLinkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const subject = await db.subject.findFirst({
    where: { id: subjectId, userId: user.id },
    select: { id: true },
  });
  if (!subject) {
    return { error: "Subject not found" };
  }

  const count = await db.subjectLink.count({ where: { subjectId: subject.id } });

  await db.subjectLink.create({
    data: {
      subjectId: subject.id,
      title: parsed.data.title,
      url: parsed.data.url,
      order: count,
    },
  });

  revalidatePath(`/subjects/${subjectId}`);
  return { ok: true };
}

export async function deleteSubjectLinkAction(formData: FormData) {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const link = await db.subjectLink.findFirst({
    where: { id, subject: { userId: user.id } },
  });
  if (!link) return;

  await db.subjectLink.delete({ where: { id: link.id } });
  revalidatePath(`/subjects/${link.subjectId}`);
}

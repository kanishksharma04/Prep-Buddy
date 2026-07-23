"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { classEventSchema } from "@/lib/validation/class-event";

export type ClassEventFormState = { error?: string; ok?: boolean } | undefined;

export async function createClassEventAction(
  _prevState: ClassEventFormState,
  formData: FormData,
): Promise<ClassEventFormState> {
  const user = await requireUser();

  const parsed = classEventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    link: formData.get("link"),
    subjectId: formData.get("subjectId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let subjectId: string | null = null;
  if (parsed.data.subjectId) {
    const subject = await db.subject.findFirst({
      where: { id: parsed.data.subjectId, userId: user.id },
      select: { id: true },
    });
    if (!subject) {
      return { error: "Subject not found" };
    }
    subjectId = subject.id;
  }

  await db.classEvent.create({
    data: {
      userId: user.id,
      subjectId,
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      link: parsed.data.link ? parsed.data.link : null,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteClassEventAction(formData: FormData) {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await db.classEvent.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard");
}

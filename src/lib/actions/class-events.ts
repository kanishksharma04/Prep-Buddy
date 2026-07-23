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

// Bulk row: one date + one join-class link per existing subject, all saved
// in a single submit. Rows with no date chosen are skipped; a link with no
// date is meaningless since a class event needs a day.
export async function createClassLinksForSubjectsAction(
  _prevState: ClassEventFormState,
  formData: FormData,
): Promise<ClassEventFormState> {
  const user = await requireUser();

  const subjects = await db.subject.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
  });

  const toCreate: { userId: string; subjectId: string; title: string; date: Date; link: string | null }[] = [];
  const errors: string[] = [];

  for (const subject of subjects) {
    const dateRaw = formData.get(`date-${subject.id}`);
    const linkRaw = formData.get(`link-${subject.id}`);
    const date = typeof dateRaw === "string" ? dateRaw.trim() : "";
    const link = typeof linkRaw === "string" ? linkRaw.trim() : "";

    if (!date) continue;

    const parsed = classEventSchema.safeParse({ title: subject.name, date, link, subjectId: subject.id });
    if (!parsed.success) {
      errors.push(`${subject.name}: ${parsed.error.issues[0]?.message ?? "Invalid input"}`);
      continue;
    }

    toCreate.push({
      userId: user.id,
      subjectId: subject.id,
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      link: parsed.data.link || null,
    });
  }

  if (errors.length > 0) {
    return { error: errors.join("; ") };
  }
  if (toCreate.length === 0) {
    return { error: "Choose a date for at least one subject" };
  }

  await db.classEvent.createMany({ data: toCreate });

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

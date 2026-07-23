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

  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDateRaw = String(formData.get("endDate") ?? "").trim();
  // Leaving "end date" blank means a single-day class on the start date.
  const endDate = endDateRaw || startDate;

  const parsed = classEventSchema.safeParse({
    title: formData.get("title"),
    startDate,
    endDate,
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
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      link: parsed.data.link ? parsed.data.link : null,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

// Bulk rows: each row independently picks a subject + date range + optional
// join link, saved together in one submit. Sent as parallel indexed arrays
// (subjectId[], startDate[], endDate[], link[]) since rows are added/removed
// client-side rather than being fixed one-per-subject.
export async function createClassLinksForSubjectsAction(
  _prevState: ClassEventFormState,
  formData: FormData,
): Promise<ClassEventFormState> {
  const user = await requireUser();

  const subjectIds = formData.getAll("subjectId[]").map(String);
  const startDates = formData.getAll("startDate[]").map(String);
  const endDates = formData.getAll("endDate[]").map(String);
  const links = formData.getAll("link[]").map(String);

  const userSubjects = await db.subject.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
  });
  const subjectNameById = new Map(userSubjects.map((s) => [s.id, s.name]));

  const toCreate: {
    userId: string;
    subjectId: string;
    title: string;
    startDate: Date;
    endDate: Date;
    link: string | null;
  }[] = [];
  const errors: string[] = [];

  for (let i = 0; i < subjectIds.length; i++) {
    const subjectId = subjectIds[i]?.trim() ?? "";
    const startDate = startDates[i]?.trim() ?? "";
    const endDateRaw = endDates[i]?.trim() ?? "";
    const link = links[i]?.trim() ?? "";

    // A row with no subject chosen or no start date is incomplete — skip it
    // rather than erroring, so partially-filled rows don't block the rest.
    if (!subjectId || !startDate) continue;

    const subjectName = subjectNameById.get(subjectId);
    if (!subjectName) {
      errors.push(`Row ${i + 1}: subject not found`);
      continue;
    }

    const endDate = endDateRaw || startDate;

    const parsed = classEventSchema.safeParse({
      title: subjectName,
      startDate,
      endDate,
      link,
      subjectId,
    });
    if (!parsed.success) {
      errors.push(`${subjectName}: ${parsed.error.issues[0]?.message ?? "Invalid input"}`);
      continue;
    }

    toCreate.push({
      userId: user.id,
      subjectId,
      title: parsed.data.title,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      link: parsed.data.link || null,
    });
  }

  if (errors.length > 0) {
    return { error: errors.join("; ") };
  }
  if (toCreate.length === 0) {
    return { error: "Add at least one subject with a start date" };
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

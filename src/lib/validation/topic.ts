import { z } from "zod";

export const addTopicsSchema = z.object({
  subjectId: z.string().min(1),
  titles: z.string().min(1, "Enter at least one topic"),
});

export const editTopicSchema = z.object({
  id: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(1, "Topic title is required")
    .max(200, "Keep it under 200 characters"),
});

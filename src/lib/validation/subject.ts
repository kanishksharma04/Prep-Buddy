import { z } from "zod";

export const subjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Subject name is required")
    .max(100, "Keep the name under 100 characters"),
  examDate: z
    .string()
    .trim()
    .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), {
      message: "Enter a valid date",
    }),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

import { z } from "zod";

export const classEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Class title is required")
    .max(100, "Keep the title under 100 characters"),
  date: z
    .string()
    .trim()
    .min(1, "Date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Enter a valid date" }),
  link: z
    .string()
    .trim()
    .refine((value) => value === "" || z.url().safeParse(value).success, {
      message: "Enter a valid URL (starting with http:// or https://)",
    }),
  subjectId: z.string().trim(),
});

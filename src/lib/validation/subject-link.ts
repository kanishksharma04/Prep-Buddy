import { z } from "zod";

export const subjectLinkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Keep the title under 100 characters"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine((value) => z.url().safeParse(value).success, {
      message: "Enter a valid URL (starting with http:// or https://)",
    }),
});

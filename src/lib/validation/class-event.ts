import { z } from "zod";

const MAX_RANGE_DAYS = 366;

const dateField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: `Enter a valid ${label.toLowerCase()}` });

export const classEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Class title is required")
      .max(100, "Keep the title under 100 characters"),
    startDate: dateField("Start date"),
    endDate: dateField("End date"),
    link: z
      .string()
      .trim()
      .refine((value) => value === "" || z.url().safeParse(value).success, {
        message: "Enter a valid URL (starting with http:// or https://)",
      }),
    subjectId: z.string().trim(),
  })
  .refine((data) => Date.parse(data.endDate) >= Date.parse(data.startDate), {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const days = (Date.parse(data.endDate) - Date.parse(data.startDate)) / (1000 * 60 * 60 * 24);
      return days <= MAX_RANGE_DAYS;
    },
    { message: "Date range can't be longer than a year", path: ["endDate"] },
  );

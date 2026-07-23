-- Replace ClassEvent.date with startDate/endDate, preserving existing rows
-- as single-day ranges (startDate = endDate = old date value).
ALTER TABLE "ClassEvent" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "ClassEvent" ADD COLUMN "endDate" TIMESTAMP(3);

UPDATE "ClassEvent" SET "startDate" = "date", "endDate" = "date";

ALTER TABLE "ClassEvent" ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE "ClassEvent" ALTER COLUMN "endDate" SET NOT NULL;

ALTER TABLE "ClassEvent" DROP COLUMN "date";

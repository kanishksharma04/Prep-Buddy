-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "lastRevisedAt" TIMESTAMP(3),
ADD COLUMN     "revisionStage" INTEGER NOT NULL DEFAULT 0;

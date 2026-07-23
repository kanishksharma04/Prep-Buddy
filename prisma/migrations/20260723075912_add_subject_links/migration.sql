-- CreateTable
CREATE TABLE "SubjectLink" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubjectLink_subjectId_idx" ON "SubjectLink"("subjectId");

-- AddForeignKey
ALTER TABLE "SubjectLink" ADD CONSTRAINT "SubjectLink_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

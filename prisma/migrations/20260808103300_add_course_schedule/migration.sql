-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'INACTIVE';

-- CreateIndex
CREATE INDEX "Course_startDate_idx" ON "Course"("startDate");

-- CreateIndex
CREATE INDEX "Course_endDate_idx" ON "Course"("endDate");

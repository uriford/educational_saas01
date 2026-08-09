-- CreateEnum
CREATE TYPE "AssessmentMode" AS ENUM ('EXAM', 'PRACTICE');

-- DropIndex
DROP INDEX "AssessmentSubmission_assessmentId_studentId_key";

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "instantFeedback" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "mode" "AssessmentMode" NOT NULL DEFAULT 'EXAM',
ADD COLUMN     "randomizeOptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "AssessmentSubmission_assessmentId_studentId_idx" ON "AssessmentSubmission"("assessmentId", "studentId");

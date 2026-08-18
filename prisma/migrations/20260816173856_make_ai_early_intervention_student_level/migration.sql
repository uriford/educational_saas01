/*
  Warnings:

  - You are about to drop the column `courseId` on the `AIEarlyIntervention` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `AIEarlyIntervention` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AIEarlyIntervention" DROP CONSTRAINT "AIEarlyIntervention_courseId_fkey";

-- DropIndex
DROP INDEX "AIEarlyIntervention_courseId_idx";

-- DropIndex
DROP INDEX "AIEarlyIntervention_studentId_courseId_key";

-- AlterTable
ALTER TABLE "AIEarlyIntervention" DROP COLUMN "courseId";

-- CreateIndex
CREATE UNIQUE INDEX "AIEarlyIntervention_studentId_key" ON "AIEarlyIntervention"("studentId");

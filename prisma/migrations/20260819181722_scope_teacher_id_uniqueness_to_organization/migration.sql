/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,teacherId]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Teacher_teacherId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_organizationId_teacherId_key" ON "Teacher"("organizationId", "teacherId");

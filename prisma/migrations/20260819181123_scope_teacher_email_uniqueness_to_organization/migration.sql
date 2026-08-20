/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,email]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Teacher_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_organizationId_email_key" ON "Teacher"("organizationId", "email");

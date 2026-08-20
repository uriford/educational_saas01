/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Student_email_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "branchId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_organizationId_email_key" ON "Student"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "User_organizationId_email_key" ON "User"("organizationId", "email");

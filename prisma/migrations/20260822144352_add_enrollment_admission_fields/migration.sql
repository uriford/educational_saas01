/*
  Warnings:

  - You are about to drop the column `studentName` on the `EnrollmentRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EnrollmentRequest" DROP COLUMN "studentName",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "admissionNote" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "guardianEmail" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianPhone" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

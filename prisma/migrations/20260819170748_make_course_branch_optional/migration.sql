-- AlterTable
ALTER TABLE "ChatMessage" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "branchId" DROP NOT NULL;

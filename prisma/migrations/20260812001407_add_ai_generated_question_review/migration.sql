-- CreateEnum
CREATE TYPE "AISourceDocumentStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "AIQuestionGenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AIQuestionReviewStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AISourceDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "status" "AISourceDocumentStatus" NOT NULL DEFAULT 'PROCESSING',
    "extractedText" TEXT,
    "selectedSections" JSONB,
    "pageCount" INTEGER,
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "AISourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIQuestionGeneration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "status" "AIQuestionGenerationStatus" NOT NULL DEFAULT 'PENDING',
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "questionTypes" JSONB,
    "difficulty" TEXT,
    "instructions" TEXT,
    "generatedQuestions" JSONB,
    "model" TEXT,
    "promptVersion" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "AIQuestionGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGeneratedQuestion" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "AssessmentQuestionType" NOT NULL,
    "marks" DECIMAL(10,2) NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT,
    "status" "AIQuestionReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "assessmentQuestionId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIGeneratedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AIQuestionGenerationToAISourceDocument" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AIQuestionGenerationToAISourceDocument_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "AISourceDocument_organizationId_idx" ON "AISourceDocument"("organizationId");

-- CreateIndex
CREATE INDEX "AISourceDocument_branchId_idx" ON "AISourceDocument"("branchId");

-- CreateIndex
CREATE INDEX "AISourceDocument_status_idx" ON "AISourceDocument"("status");

-- CreateIndex
CREATE INDEX "AISourceDocument_createdAt_idx" ON "AISourceDocument"("createdAt");

-- CreateIndex
CREATE INDEX "AIQuestionGeneration_organizationId_idx" ON "AIQuestionGeneration"("organizationId");

-- CreateIndex
CREATE INDEX "AIQuestionGeneration_branchId_idx" ON "AIQuestionGeneration"("branchId");

-- CreateIndex
CREATE INDEX "AIQuestionGeneration_assessmentId_idx" ON "AIQuestionGeneration"("assessmentId");

-- CreateIndex
CREATE INDEX "AIQuestionGeneration_status_idx" ON "AIQuestionGeneration"("status");

-- CreateIndex
CREATE INDEX "AIQuestionGeneration_createdAt_idx" ON "AIQuestionGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "AIGeneratedQuestion_generationId_idx" ON "AIGeneratedQuestion"("generationId");

-- CreateIndex
CREATE INDEX "AIGeneratedQuestion_status_idx" ON "AIGeneratedQuestion"("status");

-- CreateIndex
CREATE INDEX "AIGeneratedQuestion_assessmentQuestionId_idx" ON "AIGeneratedQuestion"("assessmentQuestionId");

-- CreateIndex
CREATE INDEX "AIGeneratedQuestion_reviewedById_idx" ON "AIGeneratedQuestion"("reviewedById");

-- CreateIndex
CREATE INDEX "AIGeneratedQuestion_createdAt_idx" ON "AIGeneratedQuestion"("createdAt");

-- CreateIndex
CREATE INDEX "_AIQuestionGenerationToAISourceDocument_B_index" ON "_AIQuestionGenerationToAISourceDocument"("B");

-- AddForeignKey
ALTER TABLE "AISourceDocument" ADD CONSTRAINT "AISourceDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISourceDocument" ADD CONSTRAINT "AISourceDocument_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIQuestionGeneration" ADD CONSTRAINT "AIQuestionGeneration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIQuestionGeneration" ADD CONSTRAINT "AIQuestionGeneration_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIQuestionGeneration" ADD CONSTRAINT "AIQuestionGeneration_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGeneratedQuestion" ADD CONSTRAINT "AIGeneratedQuestion_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AIQuestionGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGeneratedQuestion" ADD CONSTRAINT "AIGeneratedQuestion_assessmentQuestionId_fkey" FOREIGN KEY ("assessmentQuestionId") REFERENCES "AssessmentQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AIQuestionGenerationToAISourceDocument" ADD CONSTRAINT "_AIQuestionGenerationToAISourceDocument_A_fkey" FOREIGN KEY ("A") REFERENCES "AIQuestionGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AIQuestionGenerationToAISourceDocument" ADD CONSTRAINT "_AIQuestionGenerationToAISourceDocument_B_fkey" FOREIGN KEY ("B") REFERENCES "AISourceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

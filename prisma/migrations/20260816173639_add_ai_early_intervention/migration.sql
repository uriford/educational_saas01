-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "guardianEmail" TEXT;

-- CreateTable
CREATE TABLE "AIEarlyIntervention" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "reasons" JSONB,
    "recommendedActions" JSONB,
    "summary" TEXT,
    "nextAction" TEXT,
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIEarlyIntervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInterventionLog" (
    "id" TEXT NOT NULL,
    "riskAssessmentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInterventionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIEarlyIntervention_organizationId_idx" ON "AIEarlyIntervention"("organizationId");

-- CreateIndex
CREATE INDEX "AIEarlyIntervention_branchId_idx" ON "AIEarlyIntervention"("branchId");

-- CreateIndex
CREATE INDEX "AIEarlyIntervention_studentId_idx" ON "AIEarlyIntervention"("studentId");

-- CreateIndex
CREATE INDEX "AIEarlyIntervention_courseId_idx" ON "AIEarlyIntervention"("courseId");

-- CreateIndex
CREATE INDEX "AIEarlyIntervention_riskLevel_idx" ON "AIEarlyIntervention"("riskLevel");

-- CreateIndex
CREATE INDEX "AIEarlyIntervention_riskScore_idx" ON "AIEarlyIntervention"("riskScore");

-- CreateIndex
CREATE INDEX "AIEarlyIntervention_lastAnalyzedAt_idx" ON "AIEarlyIntervention"("lastAnalyzedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AIEarlyIntervention_studentId_courseId_key" ON "AIEarlyIntervention"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "AIInterventionLog_riskAssessmentId_idx" ON "AIInterventionLog"("riskAssessmentId");

-- CreateIndex
CREATE INDEX "AIInterventionLog_createdAt_idx" ON "AIInterventionLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIInterventionLog_createdById_idx" ON "AIInterventionLog"("createdById");

-- AddForeignKey
ALTER TABLE "AIEarlyIntervention" ADD CONSTRAINT "AIEarlyIntervention_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEarlyIntervention" ADD CONSTRAINT "AIEarlyIntervention_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInterventionLog" ADD CONSTRAINT "AIInterventionLog_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "AIEarlyIntervention"("id") ON DELETE CASCADE ON UPDATE CASCADE;

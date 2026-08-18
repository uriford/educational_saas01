-- CreateTable
CREATE TABLE "AIPersonalization" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "learningLevel" TEXT,
    "strengths" JSONB,
    "knowledgeGaps" JSONB,
    "recommendations" JSONB,
    "summary" TEXT,
    "nextAction" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIPersonalization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIPersonalization_studentId_idx" ON "AIPersonalization"("studentId");

-- CreateIndex
CREATE INDEX "AIPersonalization_courseId_idx" ON "AIPersonalization"("courseId");

-- CreateIndex
CREATE INDEX "AIPersonalization_generatedAt_idx" ON "AIPersonalization"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AIPersonalization_studentId_courseId_key" ON "AIPersonalization"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "AIPersonalization" ADD CONSTRAINT "AIPersonalization_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPersonalization" ADD CONSTRAINT "AIPersonalization_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

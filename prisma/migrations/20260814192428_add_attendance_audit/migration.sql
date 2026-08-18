-- CreateTable
CREATE TABLE "AttendanceAudit" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "oldStatus" "AttendanceStatus",
    "newStatus" "AttendanceStatus" NOT NULL,
    "oldNotes" TEXT,
    "newNotes" TEXT,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceAudit_organizationId_idx" ON "AttendanceAudit"("organizationId");

-- CreateIndex
CREATE INDEX "AttendanceAudit_branchId_idx" ON "AttendanceAudit"("branchId");

-- CreateIndex
CREATE INDEX "AttendanceAudit_attendanceId_idx" ON "AttendanceAudit"("attendanceId");

-- CreateIndex
CREATE INDEX "AttendanceAudit_classSessionId_idx" ON "AttendanceAudit"("classSessionId");

-- CreateIndex
CREATE INDEX "AttendanceAudit_studentId_idx" ON "AttendanceAudit"("studentId");

-- CreateIndex
CREATE INDEX "AttendanceAudit_changedAt_idx" ON "AttendanceAudit"("changedAt");

-- CreateIndex
CREATE INDEX "AttendanceAudit_changedById_idx" ON "AttendanceAudit"("changedById");

-- AddForeignKey
ALTER TABLE "AttendanceAudit" ADD CONSTRAINT "AttendanceAudit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceAudit" ADD CONSTRAINT "AttendanceAudit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceAudit" ADD CONSTRAINT "AttendanceAudit_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceAudit" ADD CONSTRAINT "AttendanceAudit_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceAudit" ADD CONSTRAINT "AttendanceAudit_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

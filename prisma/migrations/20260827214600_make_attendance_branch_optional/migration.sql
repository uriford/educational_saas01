-- Make branch association optional for organizations without branches.
ALTER TABLE "ClassSession"
  ALTER COLUMN "branchId" DROP NOT NULL;

ALTER TABLE "Attendance"
  ALTER COLUMN "branchId" DROP NOT NULL;

ALTER TABLE "AttendanceAudit"
  ALTER COLUMN "branchId" DROP NOT NULL;

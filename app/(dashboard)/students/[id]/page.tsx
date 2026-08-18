import { notFound } from "next/navigation";

import StudentHeader from "@/features/students/components/details/StudentHeader";
import StudentInfoCard from "@/features/students/components/details/StudentInfoCard";
import GuardianCard from "@/features/students/components/details/GuardianCard";
import OrganizationCard from "@/features/students/components/details/OrganizationCard";
import StudentAccountCard from "@/features/students/components/details/StudentAccountCard";
import StudentActions from "@/features/students/components/details/StudentActions";
import StudentAttendanceReport from "@/features/attendance/components/StudentAttendanceReport";
import { getStudentAttendanceReportAction } from "@/features/attendance/actions/get-student-attendance-report.action";
import StudentPaymentSection from "@/features/payments/components/StudentPaymentSection";
import { getStudentAction } from "@/features/students/actions/get-student.actions";
import AIEarlyInterventionCard from "@/features/ai-early-intervention/components/AIEarlyInterventionCard";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentDetailsPage({ params }: Props) {
  const { id } = await params;

  const student = await getStudentAction(id);

  if (!student) {
    notFound();
  }

  const attendanceResult =
    await getStudentAttendanceReportAction(id);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <StudentHeader student={student} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentInfoCard student={student} />

        <GuardianCard student={student} />
      </div>

      <OrganizationCard student={student} />

      <StudentAccountCard student={student} />

      <StudentPaymentSection studentId={student.id} />

      {attendanceResult.success &&
        attendanceResult.report && (
          <StudentAttendanceReport
            report={attendanceResult.report}
          />
        )}

      {!attendanceResult.success &&
        attendanceResult.message ===
          "Attendance tracking is disabled." && (
          <div className="lg:col-span-2 rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">
              Attendance tracking is disabled
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Enable attendance tracking from organization
              settings to view this student&apos;s attendance report.
            </p>
          </div>
        )}

      <div className="lg:col-span-2">
        <AIEarlyInterventionCard
          studentId={student.id}
        />
      </div>

      <StudentActions studentId={student.id} />
    </div>
  );
}

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { StudentService } from "@/features/students/services/student.service";
import { ResultService } from "@/features/results/services/result.service";
import StudentResults from "@/features/results/components/StudentResults";

export default async function StudentResultsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/student-pending");
  }

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-bold">
          Results
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Results will appear after completing assessments.
        </p>
      </div>
    );
  }

  const result =
    await ResultService.getStudentResults({
      studentId: student.id,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
    });

  if (!result.success) {
    return (
      <StudentResults
        results={[]}
        summary={{
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0,
          averagePercentage: 0,
        }}
      />
    );
  }

  return (
    <StudentResults
      results={result.results ?? []}
      summary={
        result.summary ?? {
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0,
          averagePercentage: 0,
        }
      }
    />
  );
}

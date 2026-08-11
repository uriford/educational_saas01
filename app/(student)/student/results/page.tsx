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

  if (
    !session.user.organizationId ||
    !session.user.branchId
  ) {
    redirect("/login");
  }

  const student = await StudentService.getByUserId(
    session.user.id,
    session.user.organizationId,
    session.user.branchId,
  );

  if (!student) {
    redirect("/login");
  }

  const result =
    await ResultService.getStudentResults({
      studentId: student.id,
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

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { StudentService } from "@/features/students/services/student.service";
import StudentWelcome from "@/features/student-portal/components/StudentWelcome";
import StudentOverview from "@/features/student-portal/components/StudentOverview";

export default async function StudentPage() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "STUDENT" ||
    !session.user.organizationId
  ) {
    redirect("/login");
  }

  const student =
    await StudentService.getByUserId(
      session.user.id,
      session.user.organizationId,
      session.user.branchId ?? undefined,
    );

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Student profile not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account is authenticated, but no student
            profile is connected to it yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <StudentWelcome
        firstName={student.firstName}
        lastName={student.lastName}
        studentId={student.studentId}
        avatar={student.avatar}
      />

      <StudentOverview student={student} />
    </div>
  );
}

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { StudentService } from "@/features/students/services/student.service";
import StudentProfileEdit from "@/features/student-portal/components/StudentProfileEdit";

export default async function StudentProfileEditPage() {
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
    );

  if (!student) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Student profile not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your student profile has not been connected yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <StudentProfileEdit
        student={student}
      />
    </div>
  );
}

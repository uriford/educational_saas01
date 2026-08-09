import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { CourseService } from "@/features/courses/services/course.service";
import { StudentService } from "@/features/students/services/student.service";

import EnrollStudentForm from "../components/EnrollStudentForm";

type Props = {
  courseId: string;
};

export default async function EnrollStudentPage({
  courseId,
}: Props) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    notFound();
  }

  const course = await CourseService.getById(
    courseId,
    session.user.organizationId,
    session.user.branchId ?? undefined,
  );

  if (!course) {
    notFound();
  }

  const result = await StudentService.getAll(
    session.user.organizationId,
    session.user.branchId ?? undefined,
    undefined,
    1,
    100,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Enroll Student
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Enroll a student in{" "}
          <span className="font-medium text-foreground">
            {course.name}
          </span>
          .
        </p>
      </div>

      <EnrollStudentForm
        courseId={course.id}
        students={result.students}
      />
    </div>
  );
}

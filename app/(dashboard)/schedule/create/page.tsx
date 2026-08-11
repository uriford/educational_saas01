import { requireAdmin } from "@/features/auth/authorization";
import { auth } from "@/auth";
import { CourseService } from "@/features/courses/services/course.service";
import { TeacherService } from "@/features/teachers/services/teacher.service";
import CreateScheduleForm from "@/features/schedule/components/CreateScheduleForm";

export default async function ScheduleCreatePage() {
  await requireAdmin();

  const session = await auth();

  if (
    !session?.user?.organizationId ||
    !session.user.branchId
  ) {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-xl font-semibold">
          Schedule a Class
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Organization or branch information is missing.
        </p>
      </div>
    );
  }

  const [courseResult, teacherResult] =
    await Promise.all([
      CourseService.getAll(
        session.user.organizationId,
        session.user.branchId,
        undefined,
        1,
        100,
      ),

      TeacherService.getAll(
        session.user.organizationId,
        session.user.branchId,
        undefined,
        1,
        100,
      ),
    ]);

  const courses = courseResult.courses
    .filter((course) => course.status !== "INACTIVE")
    .map((course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
    }));

  const teachers = teacherResult.teachers.map(
    (teacher) => ({
      id: teacher.id,
      teacherId: teacher.teacherId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      status: teacher.status,
    }),
  );

  return (
    <CreateScheduleForm
      courses={courses}
      teachers={teachers}
    />
  );
}

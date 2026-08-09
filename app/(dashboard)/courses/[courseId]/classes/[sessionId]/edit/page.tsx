import { notFound } from "next/navigation";

import { requireAdmin } from "@/features/auth/authorization";
import { CourseService } from "@/features/courses/services/course.service";
import { TeacherService } from "@/features/teachers/services/teacher.service";
import { ClassSessionService } from "@/features/class-sessions/services/class-session.service";

import EditClassSessionForm from "@/features/class-sessions/components/EditClassSessionForm";

type Props = {
  params: Promise<{
    courseId: string;
    sessionId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const session = await requireAdmin();

  const { courseId, sessionId } = await params;

  if (!session.user.organizationId) {
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

  const classSession =
    await ClassSessionService.getById(
      sessionId,
      session.user.organizationId,
      session.user.branchId ?? undefined,
    );

  if (!classSession || classSession.courseId !== courseId) {
    notFound();
  }

  const result = await TeacherService.getAll(
    session.user.organizationId,
    session.user.branchId ?? undefined,
    undefined,
    1,
    100,
  );

  const safeSession = {
    id: classSession.id,
    title: classSession.title,
    description: classSession.description,
    startTime: classSession.startTime,
    endTime: classSession.endTime,
    room: classSession.room,
    status: classSession.status,
    teacherId: classSession.teacherId,
  };

  const teachers = result.teachers.map((teacher) => ({
    id: teacher.id,
    teacherId: teacher.teacherId,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    status: teacher.status,
  }));

  return (
    <EditClassSessionForm
      session={safeSession}
      courseId={course.id}
      courseName={course.name}
      teachers={teachers}
    />
  );
}


import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { ClassSessionService } from "@/features/class-sessions/services/class-session.service";
import { CourseService } from "@/features/courses/services/course.service";

import AdminScheduleBoard from "@/features/schedule/components/AdminScheduleBoard";

export default async function SchedulePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.BRANCH_ADMIN,
  ];

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;
  const branchId = session.user.branchId;

  const [sessions, coursesResult] = await Promise.all([
    ClassSessionService.getAll(
      organizationId,
      branchId,
    ),

    CourseService.getAll(
      organizationId,
      branchId,
      undefined,
      1,
      100,
    ),
  ]);

  const serializedSessions = sessions.map((item) => ({
    id: item.id,
    courseId: item.courseId,
    courseCode: item.course.code,
    courseName: item.course.name,
    title: item.title,
    description: item.description,
    teacherName: `${item.teacher.firstName} ${
      item.teacher.lastName ?? ""
    }`.trim(),
    startTime: item.startTime.toISOString(),
    endTime: item.endTime.toISOString(),
    room: item.room,
    status: item.status,
  }));

  const serializedCourses = coursesResult.courses.map(
    (course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
    }),
  );

  return (
    <AdminScheduleBoard
      sessions={serializedSessions}
      courses={serializedCourses}
    />
  );
}

import { db } from "@/lib/db";

export interface AIStaffContextInput {
  organizationId: string;
  studentId?: string | null;
}

export interface AIStaffContext {
  organization: {
    id: string;
    code: string;
    name: string;
    email: string | null;
    phone: string | null;
    domain: string | null;
    status: string;
    timezone: string;
    language: string;
    currency: string;
    attendanceEnabled: boolean;
  };
  branches: Array<{
    id: string;
    code: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isHeadquarters: boolean;
    status: string;
  }>;
  currentStudent: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string | null;
    branchId: string | null;
    branchName: string | null;
    enrollments: Array<{
      enrollmentId: string;
      status: string;
      progress: number;
      enrolledAt: string;
      completedAt: string | null;
      course: {
        id: string;
        code: string;
        name: string;
        description: string | null;
        duration: number | null;
        fee: string | null;
        status: string;
        startDate: string | null;
        endDate: string | null;
        lessons: Array<{
          id: string;
          title: string;
          description: string | null;
          type: string;
          duration: number | null;
          order: number;
          status: string;
          completed: boolean;
          completedAt: string | null;
        }>;
      };
    }>;
  } | null;
  courses: Array<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    duration: number | null;
    fee: string | null;
    capacity: number | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
    branchId: string | null;
    branchName: string;
    lessons: Array<{
      id: string;
      title: string;
      description: string | null;
      type: string;
      duration: number | null;
      order: number;
    }>;
  }>;
  upcomingClasses: Array<{
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    room: string | null;
    status: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    teacherName: string;
    branchId: string | null;
    branchName: string;
  }>;
}

function serializeDecimal(
  value: unknown,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

function serializeDate(
  value: Date | null | undefined,
): string | null {
  return value ? value.toISOString() : null;
}

export async function getAIStaffContext(
  input: AIStaffContextInput,
): Promise<AIStaffContext> {
  const organization =
    await db.organization.findUnique({
      where: {
        id: input.organizationId,
      },
      include: {
        settings: true,
        branches: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });

  if (!organization || organization.deletedAt) {
    throw new Error(
      "Organization context could not be found.",
    );
  }

  const branches = organization.branches.map(
    (branch) => ({
      id: branch.id,
      code: branch.code,
      name: branch.name,
      email: branch.email,
      phone: branch.phone,
      address: branch.address,
      isHeadquarters:
        branch.isHeadquarters,
      status: branch.status,
    }),
  );

  /*
   * Courses are intentionally scoped to this organization.
   * If a student belongs to a branch, only that branch's
   * courses are exposed as the primary course catalog.
   */
  const student = input.studentId
    ? await db.student.findFirst({
        where: {
          id: input.studentId,
          organizationId:
            input.organizationId,
          deletedAt: null,
        },
        include: {
          branch: true,
          courseEnrollments: {
            where: {
              status: "ACTIVE",
            },
            include: {
              course: {
                include: {
                  lessons: {
                    where: {
                      deletedAt: null,
                      status: "PUBLISHED",
                    },
                    orderBy: {
                      order: "asc",
                    },
                  },
                },
              },
              lessonProgress: true,
            },
            orderBy: {
              enrolledAt: "desc",
            },
          },
        },
      })
    : null;

  const courseBranchFilter =
    student?.branchId
      ? {
          branchId: student.branchId,
        }
      : {};

  const courses =
    await db.course.findMany({
      where: {
        organizationId:
          input.organizationId,
        deletedAt: null,
        status: "ACTIVE",
        ...courseBranchFilter,
      },
      include: {
        branch: true,
        lessons: {
          where: {
            deletedAt: null,
            status: "PUBLISHED",
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

  const now = new Date();

  /*
   * Class sessions are scoped to the organization and,
   * when available, the student's branch.
   */
  const upcomingClasses =
    await db.classSession.findMany({
      where: {
        organizationId:
          input.organizationId,
        deletedAt: null,
        startTime: {
          gte: now,
        },
        status: "SCHEDULED",
        ...(student?.branchId
          ? {
              branchId:
                student.branchId,
            }
          : {}),
      },
      include: {
        course: true,
        teacher: true,
        branch: true,
      },
      orderBy: {
        startTime: "asc",
      },
      take: 20,
    });

  const studentContext =
    student
      ? {
          id: student.id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          branchId: student.branchId,
          branchName:
            student.branch?.name ?? null,
          enrollments:
            student.courseEnrollments.map(
              (enrollment) => {
                const progressByLesson =
                  new Map(
                    enrollment.lessonProgress.map(
                      (progress) => [
                        progress.lessonId,
                        progress,
                      ],
                    ),
                  );

                return {
                  enrollmentId:
                    enrollment.id,
                  status:
                    enrollment.status,
                  progress:
                    enrollment.progress,
                  enrolledAt:
                    enrollment.enrolledAt.toISOString(),
                  completedAt:
                    serializeDate(
                      enrollment.completedAt,
                    ),
                  course: {
                    id:
                      enrollment.course.id,
                    code:
                      enrollment.course.code,
                    name:
                      enrollment.course.name,
                    description:
                      enrollment.course.description,
                    duration:
                      enrollment.course.duration,
                    fee:
                      serializeDecimal(
                        enrollment.course.fee,
                      ),
                    status:
                      enrollment.course.status,
                    startDate:
                      serializeDate(
                        enrollment.course.startDate,
                      ),
                    endDate:
                      serializeDate(
                        enrollment.course.endDate,
                      ),
                    lessons:
                      enrollment.course.lessons.map(
                        (lesson) => {
                          const progress =
                            progressByLesson.get(
                              lesson.id,
                            );

                          return {
                            id: lesson.id,
                            title:
                              lesson.title,
                            description:
                              lesson.description,
                            type:
                              lesson.type,
                            duration:
                              lesson.duration,
                            order:
                              lesson.order,
                            status:
                              lesson.status,
                            completed:
                              progress?.completed ??
                              false,
                            completedAt:
                              serializeDate(
                                progress?.completedAt,
                              ),
                          };
                        },
                      ),
                  },
                };
              },
            ),
        }
      : null;

  return {
    organization: {
      id: organization.id,
      code: organization.code,
      name: organization.name,
      email: organization.email,
      phone: organization.phone,
      domain: organization.domain,
      status: organization.status,
      timezone:
        organization.settings?.timezone ??
        "Asia/Dhaka",
      language:
        organization.settings?.language ??
        "en",
      currency:
        organization.settings?.currency ??
        "BDT",
      attendanceEnabled:
        organization.settings
          ?.attendanceEnabled ??
        false,
    },

    branches,

    currentStudent:
      studentContext,

    courses: courses.map(
      (course) => ({
        id: course.id,
        code: course.code,
        name: course.name,
        description: course.description,
        duration: course.duration,
        fee: serializeDecimal(course.fee),
        capacity: course.capacity,
        status: course.status,
        startDate: serializeDate(
          course.startDate,
        ),
        endDate: serializeDate(
          course.endDate,
        ),
        branchId: course.branchId,
        branchName: course.branch?.name ?? "Organization-wide",
        lessons: course.lessons.map(
          (lesson) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            type: lesson.type,
            duration: lesson.duration,
            order: lesson.order,
          }),
        ),
      }),
    ),

    upcomingClasses:
      upcomingClasses.map(
        (session) => ({
          id: session.id,
          title: session.title,
          description:
            session.description,
          startTime:
            session.startTime.toISOString(),
          endTime:
            session.endTime.toISOString(),
          room: session.room,
          status: session.status,
          courseId: session.courseId,
          courseName:
            session.course.name,
          courseCode:
            session.course.code,
          teacherName:
            `${session.teacher.firstName}${
              session.teacher.lastName
                ? ` ${session.teacher.lastName}`
                : ""
            }`,
          branchId:
            session.branchId,
          branchName:
            session.branch?.name ?? "Unassigned",
        }),
      ),
  };
}

export function serializeAIStaffContext(
  context: AIStaffContext,
): string {
  return JSON.stringify(
    context,
    null,
    2,
  );
}

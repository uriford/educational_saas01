import { db } from "@/lib/db";

export type AttendanceReportFilters = {
  organizationId: string;
  branchId?: string;
  period: "WEEK" | "MONTH";
  search?: string;
  courseId?: string;
  teacherId?: string;
  status?: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  startDate?: Date;
  endDate?: Date;
};

function getPeriodRange(period: "WEEK" | "MONTH") {
  const now = new Date();

  if (period === "WEEK") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - diff);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return { start, end };
  }

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  return { start, end };
}

function percentage(value: number, total: number) {
  return total === 0
    ? 0
    : Number(((value / total) * 100).toFixed(1));
}

function summarize(records: Array<{ status: string }>) {
  const present = records.filter(
    (r) => r.status === "PRESENT",
  ).length;

  const absent = records.filter(
    (r) => r.status === "ABSENT",
  ).length;

  const late = records.filter(
    (r) => r.status === "LATE",
  ).length;

  const excused = records.filter(
    (r) => r.status === "EXCUSED",
  ).length;

  const total = records.length;

  return {
    total,
    present,
    absent,
    late,
    excused,
    presentPercentage: percentage(present, total),
    absentPercentage: percentage(absent, total),
    latePercentage: percentage(late, total),
    excusedPercentage: percentage(excused, total),
    attendanceRate: percentage(
      present + late,
      total,
    ),
  };
}


type StudentAttendanceReport = {
  studentId: string;
  studentCode: string;
  studentName: string;
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
};

type CourseAttendanceReport = {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  teacherIds: Set<string>;
};

type TeacherAttendanceReport = {
  teacherId: string;
  teacherCode: string;
  teacherName: string;
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  courses: Set<string>;
};

export class AttendanceReportsRepository {
  static async getFilterOptions(
    organizationId: string,
    branchId?: string,
  ) {
    const baseWhere = {
      organizationId,
      ...(branchId ? { branchId } : {}),
      deletedAt: null,
    };

    const [courses, teachers] = await Promise.all([
      db.course.findMany({
        where: baseWhere,
        select: {
          id: true,
          code: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),

      db.teacher.findMany({
        where: baseWhere,
        select: {
          id: true,
          teacherId: true,
          firstName: true,
          lastName: true,
        },
        orderBy: [
          {
            firstName: "asc",
          },
          {
            lastName: "asc",
          },
        ],
      }),
    ]);

    return {
      courses,
      teachers: teachers.map((teacher) => ({
        id: teacher.id,
        teacherId: teacher.teacherId,
        name:
          `${teacher.firstName} ${teacher.lastName ?? ""}`.trim(),
      })),
    };
  }

  static async getReports(filters: AttendanceReportFilters) {
    const periodRange = getPeriodRange(filters.period);

    const start =
      filters.startDate ?? periodRange.start;

    const end =
      filters.endDate ?? periodRange.end;

    const records = await db.attendance.findMany({
      where: {
        organizationId: filters.organizationId,
        ...(filters.branchId
          ? { branchId: filters.branchId }
          : {}),
        ...(filters.status
          ? { status: filters.status }
          : {}),
        classSession: {
          deletedAt: null,
          startTime: {
            gte: start,
            lt: end,
          },
          ...(filters.courseId
            ? { courseId: filters.courseId }
            : {}),
          ...(filters.teacherId
            ? { teacherId: filters.teacherId }
            : {}),
        },
        ...(filters.search
          ? {
              student: {
                OR: [
                  {
                    studentId: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                  {
                    firstName: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastName: {
                      contains: filters.search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            }
          : {}),
      },
      select: {
        id: true,
        status: true,
        notes: true,
        markedAt: true,
        markedById: true,
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
          },
        },
        classSession: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            teacher: {
              select: {
                id: true,
                teacherId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        classSession: {
          startTime: "desc",
        },
      },
    });

    const studentsMap = new Map<string, StudentAttendanceReport>();
    const coursesMap = new Map<string, CourseAttendanceReport>();
    const teachersMap = new Map<string, TeacherAttendanceReport>();

    for (const record of records) {
      const student = record.student;
      const course = record.classSession.course;
      const teacher = record.classSession.teacher;

      if (!studentsMap.has(student.id)) {
        studentsMap.set(student.id, {
          studentId: student.id,
          studentCode: student.studentId,
          studentName:
            `${student.firstName} ${student.lastName ?? ""}`.trim(),
          totalSessions: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        });
      }

      const studentReport = studentsMap.get(student.id)!;
      studentReport.totalSessions++;

      if (record.status === "PRESENT") {
        studentReport.present++;
      }

      if (record.status === "ABSENT") {
        studentReport.absent++;
      }

      if (record.status === "LATE") {
        studentReport.late++;
      }

      if (record.status === "EXCUSED") {
        studentReport.excused++;
      }

      if (!coursesMap.has(course.id)) {
        coursesMap.set(course.id, {
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          totalRecords: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          teacherIds: new Set<string>(),
        });
      }

      const courseReport = coursesMap.get(course.id)!;
      courseReport.totalRecords++;
      courseReport.teacherIds.add(teacher.id);

      if (record.status === "PRESENT") {
        courseReport.present++;
      }

      if (record.status === "ABSENT") {
        courseReport.absent++;
      }

      if (record.status === "LATE") {
        courseReport.late++;
      }

      if (record.status === "EXCUSED") {
        courseReport.excused++;
      }

      if (!teachersMap.has(teacher.id)) {
        teachersMap.set(teacher.id, {
          teacherId: teacher.id,
          teacherCode: teacher.teacherId,
          teacherName:
            `${teacher.firstName} ${teacher.lastName ?? ""}`.trim(),
          totalRecords: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          courses: new Set<string>(),
        });
      }

      const teacherReport = teachersMap.get(teacher.id)!;
      teacherReport.totalRecords++;
      teacherReport.courses.add(course.id);

      if (record.status === "PRESENT") {
        teacherReport.present++;
      }

      if (record.status === "ABSENT") {
        teacherReport.absent++;
      }

      if (record.status === "LATE") {
        teacherReport.late++;
      }

      if (record.status === "EXCUSED") {
        teacherReport.excused++;
      }
    }

    const students = Array.from(
      studentsMap.values(),
    ).map((student) => ({
      ...student,
      attendanceRate: percentage(
        student.present + student.late,
        student.totalSessions,
      ),
    }));

    const courses = Array.from(
      coursesMap.values(),
    ).map((course) => ({
      ...course,
      teacherCount: course.teacherIds.size,
      attendanceRate: percentage(
        course.present + course.late,
        course.totalRecords,
      ),
      teacherIds: undefined,
    }));

    const teachers = Array.from(
      teachersMap.values(),
    ).map((teacher) => ({
      ...teacher,
      courseCount: teacher.courses.size,
      attendanceRate: percentage(
        teacher.present + teacher.late,
        teacher.totalRecords,
      ),
      courses: undefined,
    }));

    return {
      filters: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: summarize(records),
      students,
      courses,
      teachers,
      records,
    };
  }

  static async getStudentHistory(
    organizationId: string,
    branchId: string | undefined,
    studentId: string,
  ) {
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        organizationId,
        ...(branchId ? { branchId } : {}),
        deletedAt: null,
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        email: true,
        attendances: {
          orderBy: {
            classSession: {
              startTime: "desc",
            },
          },
          select: {
            id: true,
            status: true,
            notes: true,
            markedAt: true,
            markedById: true,
            classSession: {
              select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                course: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
                teacher: {
                  select: {
                    id: true,
                    teacherId: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return null;
    }

    return {
      student: {
        id: student.id,
        studentCode: student.studentId,
        name:
          `${student.firstName} ${student.lastName ?? ""}`.trim(),
        email: student.email,
      },
      history: student.attendances,
      summary: summarize(student.attendances),
    };
  }

  static async getAuditHistory(
    organizationId: string,
    branchId: string | undefined,
    studentId?: string,
  ) {
    return db.attendanceAudit.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        ...(studentId ? { studentId } : {}),
      },
      orderBy: {
        changedAt: "desc",
      },
      take: 200,
      select: {
        id: true,
        attendanceId: true,
        oldStatus: true,
        newStatus: true,
        oldNotes: true,
        newNotes: true,
        changedById: true,
        changedAt: true,
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
          },
        },
        classSession: {
          select: {
            title: true,
            startTime: true,
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}

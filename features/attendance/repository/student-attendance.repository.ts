import { db } from "@/lib/db";

export class StudentAttendanceRepository {
  static async getReport(
    organizationId: string,
    studentId: string,
    branchId?: string,
  ) {
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        organizationId,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        branchId: true,
      },
    });

    if (!student) {
      return null;
    }

    const records = await db.attendance.findMany({
      where: {
        organizationId,
        studentId,
        ...(branchId ? { branchId } : {}),
      },
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
            room: true,
            status: true,
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
        attendanceAudits: {
          orderBy: {
            changedAt: "desc",
          },
          select: {
            id: true,
            oldStatus: true,
            newStatus: true,
            oldNotes: true,
            newNotes: true,
            changedById: true,
            changedAt: true,
          },
        },
      },
    });

    const total = records.length;

    const present = records.filter(
      (record) => record.status === "PRESENT",
    ).length;

    const absent = records.filter(
      (record) => record.status === "ABSENT",
    ).length;

    const late = records.filter(
      (record) => record.status === "LATE",
    ).length;

    const excused = records.filter(
      (record) => record.status === "EXCUSED",
    ).length;

    const percentage = (value: number) =>
      total === 0
        ? 0
        : Number(((value / total) * 100).toFixed(1));

    const attendanceRate =
      total === 0
        ? 0
        : Number(
            (((present + late) / total) * 100).toFixed(1),
          );

    const courseMap = new Map<
      string,
      {
        courseId: string;
        courseCode: string;
        courseName: string;
        teacherName: string;
        sessionIds: Set<string>;
        total: number;
        present: number;
        absent: number;
        late: number;
        excused: number;
      }
    >();

    for (const record of records) {
      const course = record.classSession.course;
      const teacher = record.classSession.teacher;

      const existing = courseMap.get(course.id);

      const teacherName = [
        teacher.firstName,
        teacher.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      if (!existing) {
        courseMap.set(course.id, {
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          teacherName,
          sessionIds: new Set([record.classSession.id]),
          total: 1,
          present: record.status === "PRESENT" ? 1 : 0,
          absent: record.status === "ABSENT" ? 1 : 0,
          late: record.status === "LATE" ? 1 : 0,
          excused: record.status === "EXCUSED" ? 1 : 0,
        });
      } else {
        existing.sessionIds.add(record.classSession.id);
        existing.total += 1;

        if (record.status === "PRESENT") {
          existing.present += 1;
        }

        if (record.status === "ABSENT") {
          existing.absent += 1;
        }

        if (record.status === "LATE") {
          existing.late += 1;
        }

        if (record.status === "EXCUSED") {
          existing.excused += 1;
        }
      }
    }

    const courses = Array.from(courseMap.values())
      .map((course) => ({
        courseId: course.courseId,
        courseCode: course.courseCode,
        courseName: course.courseName,
        teacherName: course.teacherName,
        totalSessions: course.sessionIds.size,
        totalRecords: course.total,
        present: course.present,
        absent: course.absent,
        late: course.late,
        excused: course.excused,
        attendanceRate:
          course.total === 0
            ? 0
            : Number(
                (
                  ((course.present + course.late) /
                    course.total) *
                  100
                ).toFixed(1),
              ),
      }))
      .sort((a, b) =>
        a.courseName.localeCompare(b.courseName),
      );

    const trendMap = new Map<
      string,
      {
        date: string;
        present: number;
        absent: number;
        late: number;
        excused: number;
        total: number;
      }
    >();

    for (const record of records) {
      const date = record.classSession.startTime
        .toISOString()
        .slice(0, 10);

      const point = trendMap.get(date) ?? {
        date,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
      };

      point.total += 1;

      if (record.status === "PRESENT") {
        point.present += 1;
      }

      if (record.status === "ABSENT") {
        point.absent += 1;
      }

      if (record.status === "LATE") {
        point.late += 1;
      }

      if (record.status === "EXCUSED") {
        point.excused += 1;
      }

      trendMap.set(date, point);
    }

    const trend = Array.from(trendMap.values())
      .sort((a, b) =>
        a.date.localeCompare(b.date),
      )
      .map((point) => ({
        ...point,
        attendanceRate:
          point.total === 0
            ? 0
            : Number(
                (
                  ((point.present + point.late) /
                    point.total) *
                  100
                ).toFixed(1),
              ),
      }));

    const audits = records
      .flatMap((record) =>
        record.attendanceAudits.map((audit) => ({
          ...audit,
          attendanceId: record.id,
          courseName:
            record.classSession.course.name,
          courseCode:
            record.classSession.course.code,
          sessionTitle:
            record.classSession.title,
          sessionStart:
            record.classSession.startTime,
        })),
      )
      .sort(
        (a, b) =>
          b.changedAt.getTime() -
          a.changedAt.getTime(),
      );

    return {
      student: {
        id: student.id,
        studentId: student.studentId,
        name: [
          student.firstName,
          student.lastName,
        ]
          .filter(Boolean)
          .join(" "),
      },

      summary: {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate,
        presentPercentage: percentage(present),
        absentPercentage: percentage(absent),
        latePercentage: percentage(late),
        excusedPercentage: percentage(excused),
      },

      courses,

      trend,

      records: records.map((record) => ({
        id: record.id,
        status: record.status,
        notes: record.notes,
        markedAt: record.markedAt.toISOString(),
        markedById: record.markedById,
        session: {
          id: record.classSession.id,
          title: record.classSession.title,
          startTime:
            record.classSession.startTime.toISOString(),
          endTime:
            record.classSession.endTime.toISOString(),
          room: record.classSession.room,
          status: record.classSession.status,
        },
        course: record.classSession.course,
        teacher: {
          id: record.classSession.teacher.id,
          teacherId:
            record.classSession.teacher.teacherId,
          name: [
            record.classSession.teacher.firstName,
            record.classSession.teacher.lastName,
          ]
            .filter(Boolean)
            .join(" "),
        },
      })),

      audits: audits.map((audit) => ({
        id: audit.id,
        attendanceId: audit.attendanceId,
        oldStatus: audit.oldStatus,
        newStatus: audit.newStatus,
        oldNotes: audit.oldNotes,
        newNotes: audit.newNotes,
        changedById: audit.changedById,
        changedAt: audit.changedAt.toISOString(),
        courseName: audit.courseName,
        courseCode: audit.courseCode,
        sessionTitle: audit.sessionTitle,
        sessionStart:
          audit.sessionStart.toISOString(),
      })),
    };
  }

  static async saveManyWithAudit(
    organizationId: string,
    branchId: string,
    classSessionId: string,
    markedById: string,
    records: {
      studentId: string;
      status:
        | "PRESENT"
        | "ABSENT"
        | "LATE"
        | "EXCUSED";
      notes?: string | null;
    }[],
  ) {
    return db.$transaction(async (tx) => {
      for (const record of records) {
        const existing =
          await tx.attendance.findUnique({
            where: {
              classSessionId_studentId: {
                classSessionId,
                studentId: record.studentId,
              },
            },
            select: {
              id: true,
              status: true,
              notes: true,
            },
          });

        if (!existing) {
          await tx.attendance.create({
            data: {
              organizationId,
              branchId,
              classSessionId,
              studentId: record.studentId,
              status: record.status,
              notes: record.notes ?? null,
              markedById,
            },
          });

          continue;
        }

        const changed =
          existing.status !== record.status ||
          existing.notes !==
            (record.notes ?? null);

        if (!changed) {
          continue;
        }

        await tx.attendance.update({
          where: {
            id: existing.id,
          },
          data: {
            status: record.status,
            notes: record.notes ?? null,
            markedById,
            markedAt: new Date(),
          },
        });

        await tx.attendanceAudit.create({
          data: {
            organizationId,
            branchId,
            attendanceId: existing.id,
            classSessionId,
            studentId: record.studentId,
            oldStatus: existing.status,
            newStatus: record.status,
            oldNotes: existing.notes,
            newNotes: record.notes ?? null,
            changedById: markedById,
          },
        });
      }
    });
  }
}

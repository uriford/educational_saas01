import { db } from "@/lib/db";

export class AttendanceRepository {
  static async getSession(
    classSessionId: string,
    organizationId: string,
    branchId?: string | null,
  ) {
    return db.classSession.findFirst({
      where: {
        id: classSessionId,
        organizationId,
        ...(branchId ? { branchId } : { branchId: null }),
        deletedAt: null,
      },
      include: {
        course: {
          include: {
            enrollments: {
              where: {
                status: "ACTIVE",
                student: {
                  deletedAt: null,
                  status: "ACTIVE",
                },
              },
              include: {
                student: true,
              },
              orderBy: {
                student: {
                  firstName: "asc",
                },
              },
            },
          },
        },
        teacher: true,
      },
    });
  }

  static async getForSession(
    classSessionId: string,
    organizationId: string,
    branchId?: string | null,
  ) {
    return db.attendance.findMany({
      where: {
        classSessionId,
        organizationId,
        ...(branchId ? { branchId } : { branchId: null }),
      },
      orderBy: {
        student: {
          firstName: "asc",
        },
      },
      include: {
        student: true,
      },
    });
  }

  static async saveMany(
    organizationId: string,
    branchId: string | null,
    classSessionId: string,
    markedById: string,
    records: {
      studentId: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
      notes?: string | null;
    }[],
  ) {
    return db.$transaction(
      records.map((record) =>
        db.attendance.upsert({
          where: {
            classSessionId_studentId: {
              classSessionId,
              studentId: record.studentId,
            },
          },
          create: {
            organizationId,
            branchId: branchId ?? null,
            classSessionId,
            studentId: record.studentId,
            status: record.status,
            notes: record.notes ?? null,
            markedById,
          },
          update: {
            status: record.status,
            notes: record.notes ?? null,
            markedById,
            markedAt: new Date(),
          },
        }),
      ),
    );
  }
}

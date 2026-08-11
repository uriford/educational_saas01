import { db } from "@/lib/db";

export class EnrollmentRepository {
  static async findById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.courseEnrollment.findFirst({
      where: {
        id,
        course: {
          organizationId,
          ...(branchId && { branchId }),
        },
      },
      include: {
        student: true,
        course: true,
      },
    });
  }

  static async findByStudentAndCourse(
    studentId: string,
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId,
        course: {
          organizationId,
          ...(branchId && { branchId }),
        },
      },
      include: {
        student: true,
        course: true,
      },
    });
  }

  static async findByCourse(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.courseEnrollment.findMany({
      where: {
        courseId,
        course: {
          organizationId,
          ...(branchId && { branchId }),
        },
        status: {
          in: ["ACTIVE", "COMPLETED", "SUSPENDED"],
        },
        student: {
          deletedAt: null,
        },
      },
      include: {
        student: true,
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  static async findByStudent(
    studentId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.courseEnrollment.findMany({
      where: {
        studentId,
        course: {
          organizationId,
          ...(branchId && { branchId }),
          deletedAt: null,
        },
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
      include: {
        course: {
          include: {
            organization: true,
            branch: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });
  }

  static async countActiveByCourse(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.courseEnrollment.count({
      where: {
        courseId,
        status: {
          in: ["ACTIVE", "SUSPENDED"],
        },
        course: {
          organizationId,
          ...(branchId && { branchId }),
        },
      },
    });
  }

  static async create(data: {
    studentId: string;
    courseId: string;
    status?: "ACTIVE" | "COMPLETED" | "DROPPED" | "SUSPENDED";
    progress?: number;
  }) {
    return db.courseEnrollment.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        status: data.status ?? "ACTIVE",
        progress: data.progress ?? 0,
      },
      include: {
        student: true,
        course: true,
      },
    });
  }

  static async updateStatus(
    id: string,
    organizationId: string,
    branchId: string | undefined,
    status: "ACTIVE" | "COMPLETED" | "DROPPED" | "SUSPENDED",
  ) {
    return db.courseEnrollment.updateMany({
      where: {
        id,
        course: {
          organizationId,
          ...(branchId && { branchId }),
        },
      },
      data: {
        status,
        completedAt:
          status === "COMPLETED"
            ? new Date()
            : null,
      },
    });
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string | undefined,
    data: {
      status: "ACTIVE" | "COMPLETED" | "DROPPED" | "SUSPENDED";
      progress: number;
    },
  ) {
    return db.courseEnrollment.updateMany({
      where: {
        id,
        course: {
          organizationId,
          ...(branchId && { branchId }),
        },
      },
      data: {
        status: data.status,
        progress: data.progress,
        completedAt:
          data.status === "COMPLETED"
            ? new Date()
            : null,
      },
    });
  }

  static async delete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.courseEnrollment.deleteMany({
      where: {
        id,
        course: {
          organizationId,
          ...(branchId && { branchId }),
        },
      },
    });
  }
}

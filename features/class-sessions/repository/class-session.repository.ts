import { db } from "@/lib/db";

export class ClassSessionRepository {
  static async create(data: {
    organizationId: string;
    branchId: string;
    courseId: string;
    teacherId: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    room?: string;
    createdById?: string;
  }) {
    return db.classSession.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        courseId: data.courseId,
        teacherId: data.teacherId,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        createdById: data.createdById,
      },
      include: {
        course: true,
        teacher: true,
        branch: true,
      },
    });
  }

  static async findById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.classSession.findFirst({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        course: true,
        teacher: true,
        branch: true,
      },
    });
  }

  static async findAll(
    organizationId: string,
    branchId?: string,
  ) {
    return db.classSession.findMany({
      where: {
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        course: true,
        teacher: true,
        branch: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  static async findByCourse(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.classSession.findMany({
      where: {
        courseId,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        course: true,
        teacher: true,
        branch: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  static async findByTeacher(
    teacherId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.classSession.findMany({
      where: {
        teacherId,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        course: true,
        teacher: true,
        branch: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  static async findByStudent(
    studentId: string,
    organizationId: string,
    branchId: string,
  ) {
    return db.classSession.findMany({
      where: {
        organizationId,
        branchId,
        deletedAt: null,
        status: {
          not: "CANCELLED",
        },
        course: {
          enrollments: {
            some: {
              studentId,
              status: {
                in: ["ACTIVE", "COMPLETED"],
              },
            },
          },
        },
      },
      include: {
        course: true,
        teacher: true,
        branch: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string,
    data: {
      title?: string;
      description?: string | null;
      startTime?: Date;
      endTime?: Date;
      room?: string | null;
      status?:
        | "SCHEDULED"
        | "ONGOING"
        | "COMPLETED"
        | "CANCELLED";
      teacherId?: string;
      courseId?: string;
      updatedById?: string;
    },
  ) {
    return db.classSession.updateMany({
      where: {
        id,
        organizationId,
        branchId,
        deletedAt: null,
      },
      data,
    });
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.classSession.updateMany({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

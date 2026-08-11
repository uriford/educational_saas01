import { db } from "@/lib/db";

export class AssessmentRepository {
  static async create(data: {
    organizationId: string;
    branchId: string;
    courseId: string;
    title: string;
    description?: string | null;
    duration?: number | null;
    totalMarks: number;
    passingMarks: number;
    maxAttempts: number;
    status?:
      | "DRAFT"
      | "PUBLISHED"
      | "CLOSED"
      | "ARCHIVED";
    startDate?: Date | null;
    endDate?: Date | null;
    createdById?: string;
  }) {
    return db.assessment.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        duration: data.duration,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        maxAttempts: data.maxAttempts,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        createdById: data.createdById,
      },
      include: {
        course: true,
      },
    });
  }

  static async findById(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessment.findFirst({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        course: true,
        questions: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  static async findAll(
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessment.findMany({
      where: {
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findByCourse(
    courseId: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.assessment.findMany({
      where: {
        courseId,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc",
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
      duration?: number | null;
      totalMarks?: number;
      passingMarks?: number;
    maxAttempts?: number;
      status?:
        | "DRAFT"
        | "PUBLISHED"
        | "CLOSED"
        | "ARCHIVED";
      startDate?: Date | null;
      endDate?: Date | null;
      updatedById?: string;
    },
  ) {
    return db.assessment.updateMany({
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
    return db.assessment.updateMany({
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
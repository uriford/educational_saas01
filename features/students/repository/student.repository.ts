import { db } from "@/lib/db";
import type { CreateStudentData } from "../types";

export class StudentRepository {
  static async create(
    data: CreateStudentData & {
      studentId: string;
    },
  ) {
    return db.student.create({
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      },
    });
  }

  static async findById(id: string, organizationId: string, branchId?: string) {
    return db.student.findFirst({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
      include: {
        organization: true,
        branch: true,
        user: true,
      },
    });
  }

  static async findAll(
    organizationId: string,
    branchId?: string,
    search?: string,
    page = 1,
    limit = 10,
  ) {
    const where = {
      organizationId,
      ...(branchId && { branchId }),
      deletedAt: null,

      ...(search && {
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            studentId: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            phone: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,
      }),

      db.student.count({
        where,
      }),
    ]);

    return {
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async delete(id: string, organizationId: string, branchId?: string) {
    return db.student.updateMany({
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

  static async count(organizationId: string, branchId?: string) {
    return db.student.count({
      where: {
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },
    });
  }
  static async findByUserId(
userId: string,
organizationId: string,
branchId?: string,
) {
return db.student.findFirst({
where: {
userId,
organizationId,
...(branchId && { branchId }),
deletedAt: null,
},
include: {
organization: true,
branch: true,
user: true,
},
});
}

static async findByEmail(email: string, organizationId: string) {
    return db.student.findFirst({
      where: {
        email,
        organizationId,
        deletedAt: null,
      },
    });
  }
  static async generateStudentId() {
    const lastStudent = await db.student.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        studentId: true,
      },
    });

    if (!lastStudent) {
      return "STD-000001";
    }

    const lastNumber = Number(lastStudent.studentId.replace("STD-", ""));

    return `STD-${String(lastNumber + 1).padStart(6, "0")}`;
  }

  static async createWithGeneratedId(data: CreateStudentData) {
    const studentId = await this.generateStudentId();

    return this.create({
      ...data,
      studentId,
    });
  }

  static async update(
    id: string,
    organizationId: string,
    branchId: string | undefined,
    data: CreateStudentData,
  ) {
    return db.student.updateMany({
      where: {
        id,
        organizationId,
        ...(branchId && { branchId }),
        deletedAt: null,
      },

      data: {
        ...data,

        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      },
    });
  }
  static async softDelete(
    id: string,
    organizationId: string,
    branchId?: string,
  ) {
    return db.student.updateMany({
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
  static async getStatistics(organizationId: string, branchId?: string) {
    const where = {
      organizationId,
      ...(branchId && { branchId }),
      deletedAt: null,
    };

    const now = new Date();

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalStudents, activeStudents, inactiveStudents, newStudents] =
      await Promise.all([
        db.student.count({
          where,
        }),

        db.student.count({
          where: {
            ...where,
            status: "ACTIVE",
          },
        }),

        db.student.count({
          where: {
            ...where,
            status: "INACTIVE",
          },
        }),

        db.student.count({
          where: {
            ...where,
            createdAt: {
              gte: firstDayOfMonth,
            },
          },
        }),
      ]);

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      newStudents,
    };
  }
}

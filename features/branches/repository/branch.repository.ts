import { db } from "@/lib/db";

export class BranchRepository {
  static async getCreationCredential(
    organizationId: string,
  ) {
    return db.branchCreationCredential.findUnique({
      where: {
        organizationId,
      },
      select: {
        id: true,
        passwordHash: true,
        updatedAt: true,
      },
    });
  }

  static async createCreationCredential(
    organizationId: string,
    passwordHash: string,
  ) {
    return db.branchCreationCredential.upsert({
      where: {
        organizationId,
      },
      create: {
        organizationId,
        passwordHash,
      },
      update: {
        passwordHash,
      },
    });
  }

  static async getAllBranches(
    organizationId: string,
  ) {
    return db.branch.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: [
        {
          isHeadquarters: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
        phone: true,
        address: true,
        isHeadquarters: true,
        status: true,
        createdAt: true,
      },
    });
  }

  static async findBranch(
    organizationId: string,
    branchId: string,
  ) {
    return db.branch.findFirst({
      where: {
        id: branchId,
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        isHeadquarters: true,
        status: true,
      },
    });
  }

  static async createBranch(data: {
    organizationId: string;
    name: string;
    slug: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    createdById: string;
  }) {
    return db.branch.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        slug: data.slug,
        code: data.code,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        createdById: data.createdById,
        isHeadquarters: false,
      },
    });
  }

  static async getUserForBranchSecurity(
    userId: string,
    organizationId: string,
  ) {
    return db.user.findFirst({
      where: {
        id: userId,
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        role: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            isHeadquarters: true,
            deletedAt: true,
          },
        },
      },
    });
  }
}

import { db } from "@/lib/db";

export class SettingsRepository {
  static async getOrganization(organizationId: string) {
    return db.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: null,
      },
      include: {
        settings: true,
      },
    });
  }

  static async getUser(userId: string) {
    return db.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        organizationId: true,
        branchId: true,
        emailVerified: true,
        lastLoginAt: true,
      },
    });
  }

  static async getBranch(branchId: string) {
    return db.branch.findFirst({
      where: {
        id: branchId,
        deletedAt: null,
      },
      select: {
        name: true,
        code: true,
        email: true,
        phone: true,
        address: true,
        isHeadquarters: true,
        status: true,
      },
    });
  }

  static async updateOrganization(
    organizationId: string,
    data: {
      name: string;
      email?: string;
      phone?: string;
      domain?: string;
    },
  ) {
    return db.organization.updateMany({
      where: {
        id: organizationId,
        deletedAt: null,
      },
      data,
    });
  }

  static async updateOrganizationSettings(
    organizationId: string,
    data: {
      timezone: string;
      language: string;
      currency: string;
    },
  ) {
    return db.organizationSettings.upsert({
      where: {
        organizationId,
      },
      create: {
        organizationId,
        ...data,
      },
      update: data,
    });
  }

  static async updateUser(
    userId: string,
    data: {
      firstName: string;
      lastName?: string;
      phone?: string;
    },
  ) {
    return db.user.updateMany({
      where: {
        id: userId,
        deletedAt: null,
      },
      data,
    });
  }
}
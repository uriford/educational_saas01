import "server-only";

import { db } from "@/lib/db";

export class OrganizationRepository {
  static async getAll() {
    return db.organization.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        status: true,
        hasBranches: true,
        createdAt: true,

        branches: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            code: true,
            isHeadquarters: true,
            status: true,
          },
          orderBy: {
            isHeadquarters: "desc",
          },
        },

        _count: {
          select: {
            users: true,
            students: true,
            teachers: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async findBySlug(slug: string) {
    return db.organization.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });
  }

  static async findUserByEmail(email: string) {
    return db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  static async suspend(id: string) {
    const organization = await db.organization.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!organization) {
      throw new Error("Organization not found.");
    }

    if (organization.status === "DELETED") {
      throw new Error("Deleted organizations cannot be suspended.");
    }

    if (organization.status === "SUSPENDED") {
      throw new Error("Organization is already suspended.");
    }

    return db.organization.update({
      where: {
        id,
      },
      data: {
        status: "SUSPENDED",
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  static async activate(id: string) {
    const organization = await db.organization.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!organization) {
      throw new Error("Organization not found.");
    }

    if (organization.status === "DELETED") {
      throw new Error("Deleted organizations cannot be activated.");
    }

    if (organization.status === "ACTIVE") {
      throw new Error("Organization is already active.");
    }

    return db.organization.update({
      where: {
        id,
      },
      data: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  static async remove(
    id: string,
    _deletedById: string,
  ) {
    void _deletedById;
    return db.$transaction(async (tx) => {
      const organization = await tx.organization.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      if (!organization) {
        throw new Error("Organization not found.");
      }

      /*
       * IMPORTANT:
       * This is a PERMANENT deletion.
       *
       * We intentionally do not use deletedAt here.
       * The organization and its related records are removed
       * from the database so the same organization name,
       * slug, email, branch slug, admin email, etc. can be
       * registered again later.
       */

      // Delete organization-level records that do not rely
      // on Organization's cascade to remove them.
      await tx.organizationSettings.deleteMany({
        where: {
          organizationId: id,
        },
      });

      await tx.subscription.deleteMany({
        where: {
          organizationId: id,
        },
      });

      await tx.branchCreationCredential.deleteMany({
        where: {
          organizationId: id,
        },
      });

      /*
       * Branches have many branch-scoped relations.
       * Most of the Prisma schema already uses Cascade,
       * so deleting the branches allows Prisma/database
       * cascades to remove their dependent records.
       */
      await tx.branch.deleteMany({
        where: {
          organizationId: id,
        },
      });

      /*
       * Delete organization-level records that may remain
       * after branch deletion.
       *
       * These are safe because they belong exclusively
       * to this organization.
       */

      await tx.chatStaff.deleteMany({
        where: {
          organizationId: id,
        },
      });

      await tx.chatConversation.deleteMany({
        where: {
          organizationId: id,
        },
      });

      await tx.notification.deleteMany({
        where: {
          organizationId: id,
        },
      });

      await tx.announcement.deleteMany({
        where: {
          organizationId: id,
        },
      });

      await tx.auditLog.deleteMany({
        where: {
          organizationId: id,
        },
      });

      /*
       * Delete remaining organization-level users.
       * Branch users should already be gone through the
       * branch cascade, but this handles users whose
       * branchId is null.
       */
      await tx.user.deleteMany({
        where: {
          organizationId: id,
        },
      });

      /*
       * Finally remove the organization itself.
       */
      const deletedOrganization =
        await tx.organization.delete({
          where: {
            id,
          },
          select: {
            id: true,
            name: true,
          },
        });

      return {
        success: true as const,
        organization: deletedOrganization,
      };
    });
  }

  static async createOrganizationWithAdmin(data: {
    code: string;
    name: string;
    slug: string;
    email: string;
    phone: string | null;

    hasBranches: boolean;

    adminCode: string;
    adminFirstName: string;
    adminLastName: string | null;
    adminEmail: string;
    password: string;
    createdById: string;
  }) {
    return db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          code: data.code,
          name: data.name,
          slug: data.slug,
          email: data.email,
          phone: data.phone,
          hasBranches: data.hasBranches,
          status: "ACTIVE",
          createdById: data.createdById,
        },
      });

      await tx.organizationSettings.create({
        data: {
          organizationId: organization.id,
        },
      });

      const startDate = new Date();

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planName: "TRIAL",
          status: "TRIAL",
          startDate,
          endDate,
        },
      });

      let branch: {
        id: string;
        code: string;
        name: string;
        slug: string;
        organizationId: string;
        isHeadquarters: boolean;
        status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
      } | null = null;

      if (data.hasBranches) {
        branch = await tx.branch.create({
          data: {
            code: `BR-${data.code.replace(/^ORG-/, "")}`,
            name: "Head Office",
            slug: `${data.slug}-head-office`,
            organizationId: organization.id,
            isHeadquarters: true,
            status: "ACTIVE",
            createdById: data.createdById,
          },
        });
      }

      const admin = await tx.user.create({
        data: {
          code: data.adminCode,
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          email: data.adminEmail,
          password: data.password,
          role: "ORGANIZATION_ADMIN",
          status: "ACTIVE",
          organizationId: organization.id,

          /*
           * No branch means NULL.
           */
          branchId: branch?.id ?? null,

          emailVerified: false,

          /*
           * Only branch-based organizations have a
           * branch manager.
           */
          isBranchManager: data.hasBranches,

          createdById: data.createdById,
        },

        select: {
          id: true,
          code: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          organizationId: true,
          branchId: true,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          branchId: branch?.id ?? null,
          userId: data.createdById,
          action: "CREATE",
          entityType: "Organization",
          entityId: organization.id,
          description: data.hasBranches
            ? `Organization "${organization.name}" was created with its headquarters branch and initial organization administrator.`
            : `Organization "${organization.name}" was created without branches and with its initial organization administrator.`,
        },
      });

      return {
        organization,
        branch,
        admin,
      };
    });
  }

  static async findPublicBySlug(slug: string) {
    return db.organization.findFirst({
      where: {
        slug,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
    });
  }

}

import "server-only";

import { db } from "@/lib/db";

export interface OrganizationChatContext {
  organization: {
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    domain: string | null;
  };

  branches: Array<{
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    isHeadquarters: boolean;
  }>;

  branch: {
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;

  courses: Array<{
    code: string;
    name: string;
    description: string | null;
    duration: number | null;
    fee: string | null;
    capacity: number | null;
    startDate: string | null;
    endDate: string | null;
  }>;
}

/**
 * Builds organization-level knowledge available to Gemini.
 *
 * Security rules:
 * - Organization is resolved by organizationId.
 * - Only active, non-deleted branches are exposed.
 * - Student branch is resolved server-side.
 * - Only active courses from the student's branch are exposed.
 * - No private/internal identifiers are exposed to Gemini.
 */
export async function getOrganizationChatContext(
  organizationId: string,
  studentId?: string,
): Promise<OrganizationChatContext> {
  const organization = await db.organization.findFirst({
    where: {
      id: organizationId,
      status: "ACTIVE",
      deletedAt: null,
    },
    select: {
      name: true,
      code: true,
      email: true,
      phone: true,
      domain: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found or inactive.");
  }

  const branches = await db.branch.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      deletedAt: null,
    },
    select: {
      name: true,
      code: true,
      email: true,
      phone: true,
      address: true,
      isHeadquarters: true,
    },
    orderBy: [
      {
        isHeadquarters: "desc",
      },
      {
        name: "asc",
      },
    ],
  });

  let branchId: string | null = null;

  if (studentId) {
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        organizationId,
        deletedAt: null,
      },
      select: {
        branchId: true,
      },
    });

    branchId = student?.branchId ?? null;
  }

  const branch = branchId
    ? await db.branch.findFirst({
        where: {
          id: branchId,
          organizationId,
          status: "ACTIVE",
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          code: true,
          email: true,
          phone: true,
          address: true,
        },
      })
    : null;

  const courses = branch
    ? await db.course.findMany({
        where: {
          organizationId,
          branchId: branch.id,
          status: "ACTIVE",
          deletedAt: null,
        },
        select: {
          code: true,
          name: true,
          description: true,
          duration: true,
          fee: true,
          capacity: true,
          startDate: true,
          endDate: true,
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  return {
    organization: {
      name: organization.name,
      code: organization.code,
      email: organization.email,
      phone: organization.phone,
      domain: organization.domain,
    },

    branches: branches.map((item) => ({
      name: item.name,
      code: item.code,
      email: item.email,
      phone: item.phone,
      address: item.address,
      isHeadquarters: item.isHeadquarters,
    })),

    branch: branch
      ? {
          name: branch.name,
          code: branch.code,
          email: branch.email,
          phone: branch.phone,
          address: branch.address,
        }
      : null,

    courses: courses.map((course) => ({
      code: course.code,
      name: course.name,
      description: course.description,
      duration: course.duration,
      fee: course.fee?.toString() ?? null,
      capacity: course.capacity,
      startDate: course.startDate?.toISOString() ?? null,
      endDate: course.endDate?.toISOString() ?? null,
    })),
  };
}

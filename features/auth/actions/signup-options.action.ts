"use server";

import { db } from "@/lib/db";

export async function getSignupOrganizations() {
  try {
    const organizations = await db.organization.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        hasBranches: true,
        branches: {
          where: {
            status: "ACTIVE",
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true as const,
      organizations,
    };
  } catch (error) {
    console.error("SIGNUP ORGANIZATION OPTIONS ERROR:", error);

    return {
      success: false as const,
      message: "Unable to load organizations right now.",
      organizations: [],
    };
  }
}

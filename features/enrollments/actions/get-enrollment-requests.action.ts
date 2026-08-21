"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getEnrollmentRequestsAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  if (
    session.user.role !== "SUPER_ADMIN" &&
    session.user.role !== "ORGANIZATION_ADMIN"
  ) {
    return [];
  }

  const where =
    session.user.role === "SUPER_ADMIN"
      ? {
          status: "PENDING" as const,
        }
      : {
          status: "PENDING" as const,
          organizationId:
            session.user.organizationId,
        };


  return db.enrollmentRequest.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      course: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

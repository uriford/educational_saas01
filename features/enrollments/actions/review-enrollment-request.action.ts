"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { EnrollmentRepository } from "../repository/enrollment.repository";
import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";

export async function reviewEnrollmentRequestAction(
  requestId: string,
  decision: "APPROVE" | "REJECT",
  rejectionReason?: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    if (
      session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "ORGANIZATION_ADMIN"
    ) {
      return {
        success: false,
        message: "You do not have permission.",
      };
    }


    if (decision === "REJECT") {
      const request =
        await db.enrollmentRequest.findUnique({
          where: {
            id: requestId,
          },
        });

      if (!request) {
        return {
          success: false,
          message: "Enrollment request not found.",
        };
      }

      await db.enrollmentRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "REJECTED",
          rejectionReason:
            rejectionReason ?? "Rejected by admin.",
          reviewedById: session.user.id,
          reviewedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Enrollment request rejected.",
      };
    }


    const result = await db.$transaction(
      async (tx) => {
        const request =
          await tx.enrollmentRequest.findUnique({
            where: {
              id: requestId,
            },
          });

        if (!request) {
          throw new Error(
            "Enrollment request not found.",
          );
        }

        if (request.status !== "PENDING") {
          throw new Error(
            "This request has already been reviewed.",
          );
        }


        const enrollment =
          await EnrollmentRepository.createWithTx(
            tx,
            {
              studentId: request.studentId,
              courseId: request.courseId,
            },
          );


        await tx.enrollmentRequest.update({
          where: {
            id: requestId,
          },
          data: {
            status: "APPROVED",
            reviewedById: session.user.id,
            reviewedAt: new Date(),
          },
        });


        await tx.auditLog.create({
          data: {
            organizationId:
              request.organizationId,
            branchId:
              request.branchId,
            userId:
              session.user.id,
            action: "CREATE",
            entityType:
              "CourseEnrollment",
            entityId:
              enrollment.id,
            description:
              `Enrollment approved for ${request.studentName}.`,
          },
        });


        return {
          enrollmentId: enrollment.id,
          studentId: request.studentId,
          organizationId:
            request.organizationId,
          courseId: request.courseId,
          courseName:
            enrollment.course.name,
        };
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    );


    await NotificationAutomationService.notifyStudent({
      studentId: result.studentId,
      organizationId:
        result.organizationId,
      type: "SUCCESS",
      title:
        "Enrollment approved",
      message:
        `Your enrollment request for ${result.courseName} has been approved.`,
      href:
        `/student/courses/${result.courseId}`,
      dedupeKey:
        `enrollment-approved:${result.enrollmentId}`,
    });


    return {
      success: true,
      message:
        "Enrollment approved successfully.",
    };

  } catch (error) {
    console.error(
      "REVIEW ENROLLMENT REQUEST ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to review request.",
    };
  }
}

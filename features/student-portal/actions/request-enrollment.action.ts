"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PaymentMethod } from "@prisma/client";

type EnrollmentRequestPayload = {
  paymentMethod: PaymentMethod;
  requestedAmount: string;
  transactionId?: string;
  paymentPhone?: string;
  paymentDate?: string;
  paymentReference?: string;
  cardHolderName?: string;
  cardLastFour?: string;
  paymentNote?: string;
};

export async function requestEnrollmentAction(
  courseId: string,
  payload: EnrollmentRequestPayload,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in.",
      };
    }

    if (session.user.role !== "STUDENT") {
      return {
        success: false,
        message: "Only students can request enrollment.",
      };
    }

    const student = await db.student.findFirst({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!student) {
      return {
        success: false,
        message: "Student profile not found.",
      };
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
      },
    });

    if (!course) {
      return {
        success: false,
        message: "Course unavailable.",
      };
    }

    const existingRequest =
      await db.enrollmentRequest.findFirst({
        where: {
          studentId: student.id,
          courseId: course.id,
          status: "PENDING",
        },
      });

    if (existingRequest) {
      return {
        success: false,
        message: "Enrollment request already submitted.",
      };
    }

    await db.enrollmentRequest.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        organizationId: course.organizationId,
        branchId: course.branchId,

        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email ?? "",
        phone: student.phone,

        paymentMethod:
          payload.paymentMethod,

        requestedAmount:
          payload.requestedAmount
            ? Number(payload.requestedAmount)
            : null,

        transactionId:
          payload.transactionId || null,

        paymentPhone:
          payload.paymentPhone || null,

        paymentDate:
          payload.paymentDate
            ? new Date(payload.paymentDate)
            : null,

        paymentReference:
          payload.paymentReference || null,

        cardHolderName:
          payload.cardHolderName || null,

        cardLastFour:
          payload.cardLastFour || null,

        paymentNote:
          payload.paymentNote || null,

        status: "PENDING",
      },
    });

    return {
      success: true,
      message:
        "Enrollment request submitted successfully.",
    };

  } catch (error) {
    console.error(
      "REQUEST ENROLLMENT ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit request.",
    };
  }
}

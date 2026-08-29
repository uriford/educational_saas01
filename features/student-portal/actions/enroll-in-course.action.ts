"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function enrollInCourseAction(courseId: string) {
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

        // Defense-in-depth tenant isolation:
        // students can only request enrollment in courses
        // belonging to their own organization + branch.
        organizationId: student.organizationId,
        branchId: student.branchId,
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
        message: "This course is no longer available.",
      };
    }

    const existingEnrollment =
      await db.courseEnrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
      });

    if (existingEnrollment) {
      return {
        success: false,
        message: "You are already enrolled in this course.",
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
        message:
          "Your enrollment request is already pending approval.",
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

        email:
          student.email ??
          session.user.email ??
          "",

        phone: student.phone,

        status: "PENDING",
      },
    });

    return {
      success: true,
      message:
        "Enrollment request submitted. Waiting for approval.",
    };

  } catch (error) {
    console.error(
      "STUDENT ENROLLMENT REQUEST ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit enrollment request.",
    };
  }
}

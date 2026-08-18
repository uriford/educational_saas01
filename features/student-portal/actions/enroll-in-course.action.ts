"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EnrollmentService } from "@/features/enrollments/services/enrollment.service";

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
        message: "Only students can enroll in courses.",
      };
    }

    const organizationId = session.user.organizationId;

    if (!organizationId) {
      return {
        success: false,
        message: "Organization context is missing.",
      };
    }

    const student = await db.student.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
        ...(session.user.branchId
          ? { branchId: session.user.branchId }
          : {}),
        deletedAt: null,
      },
      select: {
        id: true,
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
        organizationId,
        ...(session.user.branchId
          ? { branchId: session.user.branchId }
          : {}),
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return {
        success: false,
        message: "This course is no longer available for enrollment.",
      };
    }

    return EnrollmentService.create(
      {
        studentId: student.id,
        courseId: course.id,
      },
      organizationId,
      session.user.branchId ?? undefined,
      session.user.id,
    );
  } catch (error) {
    console.error("STUDENT ENROLL COURSE ERROR:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to enroll in course.",
    };
  }
}

"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { db } from "@/lib/db";
import { EnrollmentService } from "../services/enrollment.service";

export async function enrollInCourseAction(courseId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to enroll.",
      };
    }

    if (session.user.role !== ROLES.STUDENT) {
      return {
        success: false,
        message: "Only student accounts can enroll.",
      };
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!course) {
      return {
        success: false,
        message: "Course not found.",
      };
    }


    let student = await db.student.findFirst({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
    });


    if (!student) {
      const generatedId =
        await generateStudentId();

      student = await db.student.create({
        data: {
          userId: session.user.id,
          organizationId: course.organizationId,
          branchId: course.branchId,
          studentId: generatedId,
          firstName:
            session.user.name?.split(" ")[0] ??
            "Student",
          lastName:
            session.user.name?.split(" ").slice(1).join(" ") ||
            null,
          email: session.user.email ?? null,
        },
      });


      await db.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          organizationId:
            course.organizationId,
          branchId:
            course.branchId,
        },
      });
    }


    return EnrollmentService.create(
      {
        studentId: student.id,
        courseId,
      },
      course.organizationId,
      course.branchId ?? undefined,
      session.user.id,
    );

  } catch (error) {
    console.error(
      "STUDENT COURSE ENROLLMENT ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to enroll.",
    };
  }
}


async function generateStudentId() {
  const lastStudent =
    await db.student.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        studentId: true,
      },
    });


  if (!lastStudent) {
    return "STD-000001";
  }


  const number =
    Number(
      lastStudent.studentId.replace(
        "STD-",
        "",
      ),
    ) + 1;


  return `STD-${String(number).padStart(6,"0")}`;
}

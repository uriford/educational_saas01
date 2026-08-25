"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { EnrollmentRepository } from "../repository/enrollment.repository";
import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";
import { StudentRepository } from "@/features/students/repository/student.repository";

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


        let student;

        if (request.studentId) {

          student =
            await tx.student.findUnique({
              where: {
                id: request.studentId,
              },
            });

          if (!student) {
            throw new Error(
              "Existing student not found.",
            );
          }

          // A branchless student gets their permanent branch
          // context from the approved enrollment request.
          if (!student.branchId && request.branchId) {
            student = await tx.student.update({
              where: {
                id: student.id,
              },
              data: {
                branchId: request.branchId,
              },
            });
          }

        } else {

          const existingStudent =
            request.email
              ? await tx.student.findFirst({
                  where: {
                    organizationId:
                      request.organizationId,

                    email:
                      request.email,

                    deletedAt:
                      null,
                  },
                })
              : null;


          if (existingStudent) {

            student = existingStudent;

          } else {

            const studentId =
              await StudentRepository.generateStudentIdWithTx(tx);


            student =
              await tx.student.create({
                data: {

                  studentId,

                  organizationId:
                    request.organizationId,

                  branchId:
                    request.branchId,

                  firstName:
                    request.firstName ?? "Unknown",

                  lastName:
                    request.lastName,

                  email:
                    request.email,

                  phone:
                    request.phone,

                  guardianName:
                    request.guardianName,

                  guardianPhone:
                    request.guardianPhone,

                  guardianEmail:
                    request.guardianEmail,

                  gender:
                    request.gender,

                  dateOfBirth:
                    request.dateOfBirth,

                  address:
                    request.address,
                },
              });

          }

        }


        const enrollment =
          await EnrollmentRepository.createWithTx(
            tx,
            {
              studentId: student.id,
              courseId: request.courseId,
            },
          );


        await tx.enrollmentRequest.update({
          where: {
            id: requestId,
          },
          data: {
            studentId: student.id,
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
              `Enrollment approved for ${request.firstName ?? "Student"}.`,
          },
        });


        return {
          enrollmentId: enrollment.id,
          studentId: student.id,
          organizationId:
            request.organizationId,
          courseId: request.courseId,
          courseName:
            enrollment.course.name,

          temporaryPassword:
            (
              student as typeof student & {
                temporaryPassword?: string | null;
              }
            ).temporaryPassword ?? null,

          email:
            request.email,
        };
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    );


    await NotificationAutomationService.notifyStudent({
      studentId: result.studentId!,
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

      email:
        result.email,

      temporaryPassword:
        result.temporaryPassword,
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

"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { EnrollmentRepository } from "../repository/enrollment.repository";
import { NotificationAutomationService } from "@/features/notifications/services/notification-automation.service";
import { StudentRepository } from "@/features/students/repository/student.repository";
import { redeemCouponWithTx } from "@/lib/coupons/coupon.redemption";

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


    /*
     * Generate the temporary student password before opening the
     * interactive database transaction.
     *
     * bcrypt is CPU-intensive. Keeping it outside the transaction
     * prevents password hashing from consuming the transaction's
     * limited lifetime and causing transaction expiry under load.
     */
    const generatedTemporaryPassword =
      `Account@${crypto
        .randomBytes(6)
        .toString("base64url")}`;

    const generatedPasswordHash =
      await bcrypt.hash(
        generatedTemporaryPassword,
        12,
      );

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
              include: {
                user: true,
              },
            });

          if (!student) {
            throw new Error(
              "Existing student not found.",
            );
          }

          if (!student.branchId && request.branchId) {
            student = await tx.student.update({
              where: {
                id: student.id,
              },
              data: {
                branchId: request.branchId,
              },
              include: {
                user: true,
              },
            });
          }
        } else {
          const normalizedEmail =
            request.email?.trim().toLowerCase() || null;

          const existingStudent =
            normalizedEmail
              ? await tx.student.findFirst({
                  where: {
                    organizationId:
                      request.organizationId,
                    email: normalizedEmail,
                    deletedAt: null,
                  },
                  include: {
                    user: true,
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
                    normalizedEmail,
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
                include: {
                  user: true,
                },
              });
          }
        }

        /*
         * Every approved admission must have a STUDENT User account.
         *
         * We create it here instead of using AccountService because
         * AccountService currently requires a branch. Online students
         * are allowed to have branchId = null.
         */
        let temporaryPassword: string | null = null;

        if (!student.userId) {
          const normalizedEmail =
            student.email?.trim().toLowerCase() || null;

          if (!normalizedEmail) {
            throw new Error(
              "A student email is required to create the student account.",
            );
          }

          const existingUser =
            await tx.user.findUnique({
              where: {
                organizationId_email: {
                  organizationId:
                    student.organizationId,
                  email: normalizedEmail,
                },
              },
            });

          if (existingUser) {
            if (existingUser.role !== "STUDENT") {
              throw new Error(
                "A non-student account already exists with this email.",
              );
            }

            student = await tx.student.update({
              where: {
                id: student.id,
              },
              data: {
                userId: existingUser.id,
              },
              include: {
                user: true,
              },
            });
          } else {
            temporaryPassword =
              generatedTemporaryPassword;

            const user =
              await tx.user.create({
                data: {
                  code: `USR-${crypto
                    .randomBytes(5)
                    .toString("hex")
                    .toUpperCase()}`,
                  firstName:
                    student.firstName,
                  lastName:
                    student.lastName || null,
                  email:
                    normalizedEmail,
                  phone:
                    student.phone || null,
                  password:
                    generatedPasswordHash,
                  role: "STUDENT",
                  status: "ACTIVE",
                  organizationId:
                    student.organizationId,
                  branchId:
                    student.branchId,
                  emailVerified: false,
                },
              });

            student = await tx.student.update({
              where: {
                id: student.id,
              },
              data: {
                userId: user.id,
              },
              include: {
                user: true,
              },
            });
          }
        }

        /*
         * Redeem the coupon only when the enrollment is approved.
         *
         * Pending/rejected requests must not consume coupon usage.
         * The redemption runs inside the same transaction as the
         * enrollment approval, so coupon usage and enrollment stay
         * consistent if anything fails.
         */
        if (
          request.couponId &&
          request.couponCode &&
          request.originalAmount !== null
        ) {
          await redeemCouponWithTx(tx, {
            couponId:
              request.couponId,
            couponCode:
              request.couponCode,
            organizationId:
              request.organizationId,
            branchId:
              request.branchId,
            studentId:
              student.id,
            enrollmentRequestId:
              request.id,
            amount:
              Number(request.originalAmount),
          });
        }

        const enrollment =
          await EnrollmentRepository.createWithTx(
            tx,
            {
              studentId: student.id,
              courseId: request.courseId,
            },
          );

        /*
         * Automatically create the payment plan and record the
         * admission payment when the enrollment is approved.
         *
         * The payment plan follows the enrollment request/course
         * branch, NOT the student's current branch. This is
         * important because students are allowed to request
         * courses across branches.
         *
         * Branchless/online courses intentionally keep branchId = null.
         */
        const paymentTotal =
          request.finalAmount !== null &&
          request.finalAmount !== undefined
            ? Number(request.finalAmount)
            : Number(enrollment.course.fee);

        if (!Number.isFinite(paymentTotal) || paymentTotal <= 0) {
          throw new Error(
            "Unable to create the payment plan because the course fee is invalid.",
          );
        }

        const firstPaymentAmount =
          request.requestedAmount !== null &&
          request.requestedAmount !== undefined
            ? Number(request.requestedAmount)
            : 0;

        if (
          !Number.isFinite(firstPaymentAmount) ||
          firstPaymentAmount < 0
        ) {
          throw new Error(
            "The submitted payment amount is invalid.",
          );
        }

        if (firstPaymentAmount > paymentTotal + 0.01) {
          throw new Error(
            "The submitted payment amount cannot exceed the final payable amount.",
          );
        }

        const paymentDate =
          request.paymentDate ?? new Date();

        const firstInstallmentStatus =
          firstPaymentAmount <= 0
            ? "UPCOMING"
            : firstPaymentAmount >= paymentTotal - 0.01
              ? "PAID"
              : "PARTIALLY_PAID";

        const paymentPlan =
          await tx.paymentPlan.create({
            data: {
              organizationId:
                request.organizationId,
              branchId:
                request.branchId,
              enrollmentId:
                enrollment.id,
              totalAmount:
                new Prisma.Decimal(paymentTotal),
              status:
                firstPaymentAmount >= paymentTotal - 0.01
                  ? "PAID"
                  : "ACTIVE",
              installments: {
                create: {
                  installmentNumber: 1,
                  amount:
                    new Prisma.Decimal(
                      firstPaymentAmount > 0
                        ? firstPaymentAmount
                        : paymentTotal,
                    ),
                  dueDate: paymentDate,
                  status: firstInstallmentStatus,
                  paidAmount:
                    new Prisma.Decimal(firstPaymentAmount),
                  paidAt:
                    firstPaymentAmount >= paymentTotal - 0.01
                      ? paymentDate
                      : firstPaymentAmount > 0
                        ? paymentDate
                        : null,
                  notes:
                    firstPaymentAmount > 0
                      ? "Initial admission payment."
                      : "Initial payment pending.",
                },
              },
            },
            include: {
              installments: true,
            },
          });

        const firstInstallment =
          paymentPlan.installments[0];

        if (firstPaymentAmount > 0) {
          const paymentNotes = [
            request.paymentNote?.trim()
              ? `Admission note: ${request.paymentNote.trim()}`
              : null,
            request.paymentPhone?.trim()
              ? `Payment phone: ${request.paymentPhone.trim()}`
              : null,
            request.cardHolderName?.trim()
              ? `Card holder: ${request.cardHolderName.trim()}`
              : null,
            request.cardLastFour?.trim()
              ? `Card last four: ${request.cardLastFour.trim()}`
              : null,
          ]
            .filter(Boolean)
            .join(" | ");

          const paymentReference = [
            request.transactionId?.trim()
              ? `Transaction ID: ${request.transactionId.trim()}`
              : null,
            request.paymentReference?.trim()
              ? `Payment reference: ${request.paymentReference.trim()}`
              : null,
          ]
            .filter(Boolean)
            .join(" | ");

          const paymentTransaction =
            await tx.paymentTransaction.create({
              data: {
                installmentId:
                  firstInstallment.id,
                amount:
                  new Prisma.Decimal(firstPaymentAmount),
                paymentDate,
                method:
                  request.paymentMethod ?? "OTHER",
                reference:
                  paymentReference || undefined,
                notes:
                  paymentNotes || undefined,
                recordedById:
                  session.user.id,
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
                "PaymentTransaction",
              entityId:
                paymentTransaction.id,
              description:
                `Initial admission payment of ` +
                `${firstPaymentAmount.toFixed(2)} recorded automatically ` +
                `for student ${student.studentId} ` +
                `for course ${enrollment.course.name}. ` +
                `Payment plan total: ${paymentTotal.toFixed(2)}. ` +
                `Method: ${request.paymentMethod}.`,
            },
          });
        }

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
              "PaymentPlan",
            entityId:
              paymentPlan.id,
            description:
              `Payment plan created automatically during enrollment approval ` +
              `for student ${student.studentId} ` +
              `for course ${enrollment.course.name}. ` +
              `Total amount: ${paymentTotal.toFixed(2)}. ` +
              `Initial payment: ${firstPaymentAmount.toFixed(2)}. ` +
              `Status: ${paymentPlan.status}.`,
          },
        });


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

          temporaryPassword,

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

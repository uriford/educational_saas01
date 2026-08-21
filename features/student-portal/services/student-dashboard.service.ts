import { db } from "@/lib/db";

export class StudentDashboardService {
  static async getOverview({
    studentId,
    organizationId,
    branchId,
  }: {
    studentId: string;
    organizationId: string;
    branchId?: string;
  }) {
    const now = new Date();

    const [
      enrollments,
      upcomingClasses,
      paymentPlans,
      enrollmentRequests,
    ] = await Promise.all([
      db.courseEnrollment.findMany({
        where: {
          studentId,
          course: {
            organizationId,
            ...(branchId && { branchId }),
          },
          status: {
            in: [
              "ACTIVE",
              "COMPLETED",
            ],
          },
        },
        include: {
          course: true,
        },
      }),

      db.classSession.findMany({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          course: {
            enrollments: {
              some: {
                studentId,
              },
            },
          },
          startTime: {
            gte: now,
          },
          status: {
            not: "CANCELLED",
          },
        },
        include: {
          course: true,
          teacher: true,
        },
        orderBy: {
          startTime: "asc",
        },
        take: 5,
      }),

      db.paymentPlan.findMany({
        where: {
          organizationId,
          ...(branchId && { branchId }),
          enrollment: {
            studentId,
          },
        },
        include: {
          installments: true,
          enrollment: {
            include: {
              course: true,
            },
          },
        },
      }),

      db.enrollmentRequest.findMany({
        where: {
          studentId,
          organizationId,
          ...(branchId && { branchId }),
        },
        include: {
          course: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);


    const paymentDue = paymentPlans
      .flatMap((plan) =>
        plan.installments,
      )
      .filter(
        (item) =>
          item.status !== "PAID",
      )
      .reduce(
        (sum, item) =>
          sum +
          (
            Number(item.amount) -
            Number(item.paidAmount)
          ),
        0,
      );


    return {
      totalCourses:
        enrollments.length,

      upcomingClasses,

      pendingPayments:
        paymentDue,

      paymentPlans,

      enrollmentRequests,

      enrollments,
    };
  }
}

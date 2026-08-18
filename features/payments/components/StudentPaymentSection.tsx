import { CircleDollarSign } from "lucide-react";

import { db } from "@/lib/db";

import { getStudentPaymentsAction } from "../actions/get-student-payments.action";
import { getPaymentPlanAction } from "../actions/get-payment-plan.action";
import { serializePaymentData } from "../utils/serialize-payment-data";
import PaymentPlanPanel from "./PaymentPlanPanel";

type Props = {
  studentId: string;
};

export default async function StudentPaymentSection({
  studentId,
}: Props) {
  const payments = await getStudentPaymentsAction(studentId);

  const enrollments = await db.courseEnrollment.findMany({
    where: {
      studentId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          fee: true,
        },
      },
    },
    orderBy: {
      enrolledAt: "desc",
    },
  });

  const activePlan =
    payments.find(
      (payment) => payment.status !== "FINALIZED",
    ) ?? payments[0] ?? null;

  let detailedPlan = null;

  if (activePlan) {
    detailedPlan = await getPaymentPlanAction(
      activePlan.enrollmentId,
    );
  }

  const serializedPlan = detailedPlan
    ? serializePaymentData(detailedPlan)
    : null;

  const serializedEnrollments =
    serializePaymentData(enrollments);

  return (
    <section className="space-y-4 lg:col-span-2">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <CircleDollarSign className="size-5 text-primary" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Payment Management
          </h2>

          <p className="text-sm text-muted-foreground">
            Track course fees, installments and payment history.
          </p>
        </div>
      </div>

      <PaymentPlanPanel
        plan={serializedPlan}
        enrollments={serializedEnrollments}
      />
    </section>
  );
}

import { getPaymentPlansAction } from "@/features/payments/actions/get-payment-plans.action";
import { PaymentOverview } from "@/features/payments/components/PaymentOverview";
import { serializePaymentData } from "@/features/payments/utils/serialize-payment-data";

export default async function PaymentsPage() {
  const rawPlans = await getPaymentPlansAction();

  const plans = serializePaymentData(rawPlans);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <PaymentOverview plans={plans} />
    </div>
  );
}

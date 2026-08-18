import { getPaymentHistoryAction } from "@/features/payments/actions/get-payment-history.action";
import { PaymentHistory } from "@/features/payments/components/PaymentHistory";
import { serializePaymentData } from "@/features/payments/utils/serialize-payment-data";

export default async function PaymentHistoryPage() {
  const rawTransactions = await getPaymentHistoryAction();

  const transactions = serializePaymentData(rawTransactions);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <PaymentHistory transactions={transactions} />
    </div>
  );
}

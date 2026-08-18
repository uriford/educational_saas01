import { Badge } from "@/components/ui/badge";
import type {
  PaymentStatus,
  InstallmentStatus,
} from "../types";

type Props = {
  status: PaymentStatus | InstallmentStatus;
};

const config = {
  ACTIVE: {
    label: "Partially Paid",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  PAID: {
    label: "Paid",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  FINALIZED: {
    label: "Finalized",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
  },
  UPCOMING: {
    label: "Upcoming",
    className:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
  },
  DUE: {
    label: "Due Today",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
  },
  OVERDUE: {
    label: "Overdue",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
} as const;

export function PaymentStatusBadge({ status }: Props) {
  const item = config[status];

  return (
    <Badge
      variant="outline"
      className={item.className}
    >
      {item.label}
    </Badge>
  );
}

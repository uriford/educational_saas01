export type PaymentStatus =
  | "ACTIVE"
  | "PAID"
  | "FINALIZED";

export type InstallmentStatus =
  | "UPCOMING"
  | "DUE"
  | "OVERDUE"
  | "PARTIALLY_PAID"
  | "PAID";

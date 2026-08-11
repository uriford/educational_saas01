import type {
  CreateEnrollmentInput,
  UpdateEnrollmentInput,
} from "../schemas/enrollment.schema";

export type {
  CreateEnrollmentInput,
  UpdateEnrollmentInput,
};

export type EnrollmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "DROPPED"
  | "SUSPENDED";

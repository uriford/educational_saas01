import type {
  Role,
  UserStatus,
} from "@prisma/client";

import type {
  CreateGuardianInput,
  UpdateGuardianInput,
} from "./schemas/guardian.schema";

export type {
  CreateGuardianInput,
  UpdateGuardianInput,
};

export interface GuardianListItem {
  id: string;
  userId: string;
  code: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  avatar: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  branchId: string;
  branch: {
    id: string;
    name: string;
    code: string;
  };
  students: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string | null;
    relationship: string | null;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

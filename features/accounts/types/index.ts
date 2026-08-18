import type { Role, UserStatus } from "@prisma/client";
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "../schemas/account.schema";

export type {
  CreateAccountInput,
  UpdateAccountInput,
};

export interface AccountListItem {
  id: string;
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
  branchId: string | null;
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

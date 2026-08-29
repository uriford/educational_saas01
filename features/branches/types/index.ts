export type CreateBranchInput = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  creationPassword: string;
};

export type SetBranchCreationPasswordInput =
  | {
      mode: "INITIAL";
      password: string;
      confirmPassword: string;
    }
  | {
      mode: "CHANGE";
      currentPassword: string;
      password: string;
      confirmPassword: string;
    };

export type ResetBranchCreationPasswordInput = {
  token: string;
  password: string;
  confirmPassword: string;
};


export type AssignBranchAdminInput = {
  userId: string;
  branchId: string;
};

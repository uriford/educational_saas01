export type CreateBranchInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  creationPassword: string;
};

export type SetBranchCreationPasswordInput = {
  password: string;
};

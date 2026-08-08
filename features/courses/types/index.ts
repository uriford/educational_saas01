export type CreateCourseData = {
  code: string;
  name: string;
  description?: string;
  duration?: number;
  fee?: number;
  capacity?: number;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  startDate?: string;
  endDate?: string;
};

export type CreateCourseRepositoryData =
  CreateCourseData & {
    organizationId: string;
    branchId: string;
  };

export type UpdateCourseData = Partial<CreateCourseData>;
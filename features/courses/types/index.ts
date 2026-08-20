export type CourseStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export type CreateCourseData = {
  code: string;
  name: string;
  description?: string;
  duration?: number;
  fee?: number;
  capacity?: number;
  status?: CourseStatus;
  startDate?: string;
  endDate?: string;
};

export type CreateCourseRepositoryData = CreateCourseData & {
  organizationId: string;
  branchId: string | null;
  createdById: string;
};

export type UpdateCourseData = Partial<CreateCourseData>;

export type UpdateCourseRepositoryData = UpdateCourseData & {
  updatedById: string;
};

export type DeleteCourseRepositoryData = {
  updatedById: string;
};

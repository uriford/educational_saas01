export type CourseStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export type CreateCourseData = {
  code: string;
  name: string;
  description?: string;
  duration?: number;
  totalClasses?: number;
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

export type UpdateCourseData =
  Omit<Partial<CreateCourseData>, "totalClasses"> & {
    totalClasses?: number | null;
  };

export type UpdateCourseRepositoryData = UpdateCourseData & {
  updatedById: string;
};

export type DeleteCourseRepositoryData = {
  updatedById: string;
};

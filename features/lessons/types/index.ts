export type LessonType =
  | "TEXT"
  | "VIDEO"
  | "DOCUMENT"
  | "LINK";

export type LessonStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export type CreateLessonData = {
  courseId: string;
  title: string;
  description?: string;
  content?: string;
  type: LessonType;
  videoUrl?: string;
  documentUrl?: string;
  externalUrl?: string;
  duration?: number;
};

export type UpdateLessonData = {
  title?: string;
  description?: string;
  content?: string;
  type?: LessonType;
  videoUrl?: string;
  documentUrl?: string;
  externalUrl?: string;
  duration?: number;
};

export type CreateLessonRepositoryData = CreateLessonData & {
  organizationId: string;
  branchId: string;
  createdById?: string;
};

export type UpdateLessonRepositoryData = UpdateLessonData & {
  updatedById?: string;
};

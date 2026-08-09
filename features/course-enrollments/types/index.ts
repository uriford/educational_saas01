export type EnrollmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "DROPPED"
  | "SUSPENDED";

export type EnrollStudentData = {
  studentId: string;
  courseId: string;
};

export type RemoveEnrollmentData = {
  enrollmentId: string;
  studentId: string;
};

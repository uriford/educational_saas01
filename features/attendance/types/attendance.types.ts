export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED";

export type AttendancePeriod = "WEEK" | "MONTH";

export type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
  presentPercentage: number;
  absentPercentage: number;
  latePercentage: number;
  excusedPercentage: number;
};

export type AttendanceComparison = {
  current: AttendanceSummary;
  previous: AttendanceSummary;
  attendanceRateChange: number;
  presentChange: number;
  absentChange: number;
};

export type AttendanceTrendPoint = {
  label: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  attendanceRate: number;
};

export type StudentAttendanceReport = {
  studentId: string;
  studentCode: string;
  studentName: string;
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
};

export type CourseAttendanceReport = {
  courseId: string;
  courseCode: string;
  courseName: string;
  teacherName: string;
  totalSessions: number;
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
};

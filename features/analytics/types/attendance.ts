export type AttendanceAnalyticsPeriod = "WEEK" | "MONTH";

export type AttendanceAnalyticsSummary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  presentPercentage: number;
  absentPercentage: number;
  latePercentage: number;
  excusedPercentage: number;
  attendanceRate: number;
};

export type AttendanceAnalyticsPoint = {
  label: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
};

export type AttendanceAnalytics = {
  enabled: boolean;
  period: AttendanceAnalyticsPeriod;
  current: AttendanceAnalyticsSummary;
  previous: AttendanceAnalyticsSummary;
  changes: {
    attendanceRate: number;
    presentPercentage: number;
    absentPercentage: number;
  };
  chart: AttendanceAnalyticsPoint[];
  currentRange: {
    start: string;
    end: string;
  };
  previousRange: {
    start: string;
    end: string;
  };
};

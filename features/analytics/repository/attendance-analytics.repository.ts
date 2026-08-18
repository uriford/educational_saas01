import { db } from "@/lib/db";

import type {
  AttendanceAnalyticsPeriod,
  AttendanceAnalyticsPoint,
  AttendanceAnalyticsSummary,
} from "../types/attendance";

function getRange(period: AttendanceAnalyticsPeriod) {
  const now = new Date();

  if (period === "WEEK") {
    const currentStart = new Date(now);
    currentStart.setHours(0, 0, 0, 0);

    const day = currentStart.getDay();
    const diff = day === 0 ? 6 : day - 1;

    currentStart.setDate(currentStart.getDate() - diff);

    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 7);

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 7);

    const previousEnd = new Date(currentStart);

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    };
  }

  const currentStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const currentEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  const previousStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  );

  const previousEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
  };
}

function summarize(
  records: {
    status:
      | "PRESENT"
      | "ABSENT"
      | "LATE"
      | "EXCUSED";
  }[],
): AttendanceAnalyticsSummary {
  const present = records.filter(
    (record) => record.status === "PRESENT",
  ).length;

  const absent = records.filter(
    (record) => record.status === "ABSENT",
  ).length;

  const late = records.filter(
    (record) => record.status === "LATE",
  ).length;

  const excused = records.filter(
    (record) => record.status === "EXCUSED",
  ).length;

  const total = records.length;

  const percentage = (value: number) =>
    total === 0 ? 0 : Number(((value / total) * 100).toFixed(1));

  return {
    present,
    absent,
    late,
    excused,
    total,
    presentPercentage: percentage(present),
    absentPercentage: percentage(absent),
    latePercentage: percentage(late),
    excusedPercentage: percentage(excused),

    // Late students are considered attended for the overall
    // attendance rate, while absent students are not.
    attendanceRate:
      total === 0
        ? 0
        : Number(
            (((present + late) / total) * 100).toFixed(1),
          ),
  };
}

function buildChart(
  records: {
    startTime: Date;
    status:
      | "PRESENT"
      | "ABSENT"
      | "LATE"
      | "EXCUSED";
  }[],
  period: AttendanceAnalyticsPeriod,
  start: Date,
): AttendanceAnalyticsPoint[] {
  const points: AttendanceAnalyticsPoint[] = [];

  if (period === "WEEK") {
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);

      const key = date.toISOString().slice(0, 10);

      const dayRecords = records.filter(
        (record) =>
          record.startTime.toISOString().slice(0, 10) === key,
      );

      points.push({
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        present: dayRecords.filter(
          (record) => record.status === "PRESENT",
        ).length,
        absent: dayRecords.filter(
          (record) => record.status === "ABSENT",
        ).length,
        late: dayRecords.filter(
          (record) => record.status === "LATE",
        ).length,
        excused: dayRecords.filter(
          (record) => record.status === "EXCUSED",
        ).length,
        total: dayRecords.length,
      });
    }

    return points;
  }

  const year = start.getFullYear();
  const month = start.getMonth();
  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  for (let i = 0; i < daysInMonth; i++) {
    const date = new Date(year, month, i + 1);

    const key = date.toISOString().slice(0, 10);

    const dayRecords = records.filter(
      (record) =>
        record.startTime.toISOString().slice(0, 10) === key,
    );

    points.push({
      label: String(i + 1),
      present: dayRecords.filter(
        (record) => record.status === "PRESENT",
      ).length,
      absent: dayRecords.filter(
        (record) => record.status === "ABSENT",
      ).length,
      late: dayRecords.filter(
        (record) => record.status === "LATE",
      ).length,
      excused: dayRecords.filter(
        (record) => record.status === "EXCUSED",
      ).length,
      total: dayRecords.length,
    });
  }

  return points;
}

export class AttendanceAnalyticsRepository {
  static async getAnalytics(
    organizationId: string,
    branchId: string | undefined,
    period: AttendanceAnalyticsPeriod,
  ) {
    const organization = await db.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: null,
      },
      include: {
        settings: true,
      },
    });

    if (!organization?.settings?.attendanceEnabled) {
      return {
        enabled: false,
        period,
        current: summarize([]),
        previous: summarize([]),
        changes: {
          attendanceRate: 0,
          presentPercentage: 0,
          absentPercentage: 0,
        },
        chart: [],
        currentRange: {
          start: "",
          end: "",
        },
        previousRange: {
          start: "",
          end: "",
        },
      };
    }

    const {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    } = getRange(period);

    const baseWhere = {
      organizationId,
      ...(branchId ? { branchId } : {}),
    };

    const [currentRecords, previousRecords] =
      await Promise.all([
        db.attendance.findMany({
          where: {
            ...baseWhere,
            classSession: {
              deletedAt: null,
              startTime: {
                gte: currentStart,
                lt: currentEnd,
              },
            },
          },
          select: {
            status: true,
            classSession: {
              select: {
                startTime: true,
              },
            },
          },
        }),

        db.attendance.findMany({
          where: {
            ...baseWhere,
            classSession: {
              deletedAt: null,
              startTime: {
                gte: previousStart,
                lt: previousEnd,
              },
            },
          },
          select: {
            status: true,
            classSession: {
              select: {
                startTime: true,
              },
            },
          },
        }),
      ]);

    const current = summarize(currentRecords);
    const previous = summarize(previousRecords);

    const currentChartRecords = currentRecords.map(
      (record) => ({
        status: record.status,
        startTime: record.classSession.startTime,
      }),
    );

    return {
      enabled: true,
      period,
      current,
      previous,
      changes: {
        attendanceRate: Number(
          (
            current.attendanceRate -
            previous.attendanceRate
          ).toFixed(1),
        ),
        presentPercentage: Number(
          (
            current.presentPercentage -
            previous.presentPercentage
          ).toFixed(1),
        ),
        absentPercentage: Number(
          (
            current.absentPercentage -
            previous.absentPercentage
          ).toFixed(1),
        ),
      },
      chart: buildChart(
        currentChartRecords,
        period,
        currentStart,
      ),
      currentRange: {
        start: currentStart.toISOString(),
        end: currentEnd.toISOString(),
      },
      previousRange: {
        start: previousStart.toISOString(),
        end: previousEnd.toISOString(),
      },
    };
  }
}

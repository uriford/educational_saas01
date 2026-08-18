"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { AttendanceAnalytics as AttendanceAnalyticsType } from "../types/attendance";

type Props = {
  analytics: AttendanceAnalyticsType;
};

function changeLabel(value: number) {
  if (value > 0) return `+${value}%`;
  return `${value}%`;
}

export default function AttendanceAnalytics({
  analytics,
}: Props) {
  if (!analytics.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Analytics</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground" />

            <h3 className="mt-3 font-semibold">
              Attendance tracking is disabled
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Enable attendance tracking from organization
              settings to start collecting attendance analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    current,
    previous,
    changes,
    chart,
    period,
  } = analytics;

  const cards = [
    {
      title: "Attendance Rate",
      value: `${current.attendanceRate}%`,
      change: changes.attendanceRate,
      icon: Activity,
    },
    {
      title: "Present",
      value: `${current.presentPercentage}%`,
      detail: `${current.present} records`,
      change: changes.presentPercentage,
      icon: CheckCircle2,
    },
    {
      title: "Absent",
      value: `${current.absentPercentage}%`,
      detail: `${current.absent} records`,
      change: changes.absentPercentage,
      icon: AlertCircle,
    },
    {
      title: "Late",
      value: `${current.latePercentage}%`,
      detail: `${current.late} records`,
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Attendance Analytics
          </h2>

          <p className="text-sm text-muted-foreground">
            {period === "WEEK"
              ? "This week compared with the previous week."
              : "This month compared with the previous month."}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            Previous period
          </span>{" "}
          <span className="font-medium">
            {previous.attendanceRate}%
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>

                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {card.value}
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs">
                  {card.change !== undefined && (
                    <span
                      className={
                        card.change > 0
                          ? "font-medium text-emerald-600"
                          : card.change < 0
                            ? "font-medium text-red-600"
                            : "text-muted-foreground"
                      }
                    >
                      {changeLabel(card.change)}
                    </span>
                  )}

                  {card.detail && (
                    <span className="text-muted-foreground">
                      {card.detail}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              {period === "WEEK"
                ? "Weekly Attendance"
                : "Monthly Attendance"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-[340px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="label" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="present"
                    name="Present"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="absent"
                    name="Absent"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="late"
                    name="Late"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="excused"
                    name="Excused"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Breakdown</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Present</span>
                <span className="font-medium">
                  {current.presentPercentage}%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{
                    width: `${current.presentPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Absent</span>
                <span className="font-medium">
                  {current.absentPercentage}%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{
                    width: `${current.absentPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Late</span>
                <span className="font-medium">
                  {current.latePercentage}%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{
                    width: `${current.latePercentage}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Excused</span>
                <span className="font-medium">
                  {current.excusedPercentage}%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-slate-500"
                  style={{
                    width: `${current.excusedPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total records
                </span>

                <span className="font-semibold">
                  {current.total}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Period Comparison</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Current{" "}
                {period === "WEEK" ? "week" : "month"}
              </p>

              <p className="mt-1 text-2xl font-bold">
                {current.attendanceRate}%
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {current.present} present ·{" "}
                {current.absent} absent ·{" "}
                {current.late} late
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Previous{" "}
                {period === "WEEK" ? "week" : "month"}
              </p>

              <p className="mt-1 text-2xl font-bold">
                {previous.attendanceRate}%
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {previous.present} present ·{" "}
                {previous.absent} absent ·{" "}
                {previous.late} late
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

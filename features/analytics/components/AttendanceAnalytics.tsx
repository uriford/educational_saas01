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
  Clock3,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

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

function changeClass(value: number | undefined) {
  if (value === undefined || value === 0) {
    return "text-muted-foreground";
  }

  return value > 0
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400";
}

const tooltipStyle = {
  borderRadius: "10px",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--card-foreground))",
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
};

export default function AttendanceAnalytics({
  analytics,
}: Props) {
  if (!analytics.enabled) {
    return (
      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Activity className="h-4 w-4" />
            </span>
            Attendance Analytics
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border/60">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>

            <h3 className="mt-4 font-semibold">
              Attendance tracking is disabled
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Enable attendance tracking from organization settings
              to start collecting attendance analytics.
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
      iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Present",
      value: `${current.presentPercentage}%`,
      detail: `${current.present} records`,
      change: changes.presentPercentage,
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Absent",
      value: `${current.absentPercentage}%`,
      detail: `${current.absent} records`,
      change: changes.absentPercentage,
      icon: AlertCircle,
      iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      title: "Late",
      value: `${current.latePercentage}%`,
      detail: `${current.late} records`,
      icon: Clock3,
      iconClass:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-r from-card via-card to-muted/30 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>

            <h2 className="text-lg font-semibold">
              Attendance Analytics
            </h2>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {period === "WEEK"
              ? "This week compared with the previous week."
              : "This month compared with the previous month."}
          </p>
        </div>

        <div className="rounded-xl border bg-background/80 px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">
            Previous period
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-xl font-bold">
              {previous.attendanceRate}%
            </span>

            {changes.attendanceRate !== undefined && (
              <span
                className={`flex items-center gap-1 text-xs font-medium ${changeClass(
                  changes.attendanceRate,
                )}`}
              >
                {changes.attendanceRate > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : changes.attendanceRate < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}

                {changeLabel(changes.attendanceRate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="border-0 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {card.value}
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  {card.change !== undefined && (
                    <span
                      className={`font-medium ${changeClass(
                        card.change,
                      )}`}
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div>
              <CardTitle>
                {period === "WEEK"
                  ? "Weekly Attendance"
                  : "Monthly Attendance"}
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Attendance records grouped across the selected period.
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="h-[340px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chart}
                  margin={{
                    top: 8,
                    right: 8,
                    left: -18,
                    bottom: 4,
                  }}
                  barGap={5}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.55}
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    dy={8}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{
                      fill: "hsl(var(--muted))",
                      opacity: 0.45,
                    }}
                  />

                  <Bar
                    dataKey="present"
                    name="Present"
                    fill="#10b981"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={18}
                  />

                  <Bar
                    dataKey="absent"
                    name="Absent"
                    fill="#ef4444"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={18}
                  />

                  <Bar
                    dataKey="late"
                    name="Late"
                    fill="#f59e0b"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={18}
                  />

                  <Bar
                    dataKey="excused"
                    name="Excused"
                    fill="#64748b"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/60">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle>Attendance Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribution of current attendance records.
            </p>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            {[
              {
                label: "Present",
                value: current.presentPercentage,
                className: "bg-emerald-500",
              },
              {
                label: "Absent",
                value: current.absentPercentage,
                className: "bg-red-500",
              },
              {
                label: "Late",
                value: current.latePercentage,
                className: "bg-amber-500",
              },
              {
                label: "Excused",
                value: current.excusedPercentage,
                className: "bg-slate-500",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">
                    {item.value}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${item.className}`}
                    style={{
                      width: `${Math.min(
                        Math.max(item.value, 0),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total records
                </span>

                <span className="text-xl font-bold">
                  {current.total}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle>Period Comparison</CardTitle>
          <p className="text-xs text-muted-foreground">
            Compare attendance performance against the previous
            equivalent period.
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-500/5 to-transparent p-5">
              <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>

              <p className="text-sm text-muted-foreground">
                Current {period === "WEEK" ? "week" : "month"}
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {current.attendanceRate}%
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {current.present} present · {current.absent} absent ·{" "}
                {current.late} late
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-transparent p-5">
              <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Activity className="h-4 w-4" />
              </div>

              <p className="text-sm text-muted-foreground">
                Previous {period === "WEEK" ? "week" : "month"}
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {previous.attendanceRate}%
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {previous.present} present · {previous.absent} absent ·{" "}
                {previous.late} late
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

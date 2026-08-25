"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Activity,
  Megaphone,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { AnalyticsOverview } from "../types";

type Props = {
  analytics: AnalyticsOverview;
};

const chartColors = {
  students: "#3b82f6",
  teachers: "#8b5cf6",
  courses: "#10b981",
};

const announcementColors = [
  "#94a3b8",
  "#f59e0b",
  "#10b981",
  "#64748b",
];

const tooltipStyle = {
  borderRadius: "10px",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--card-foreground))",
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
};

export default function AnalyticsCharts({
  analytics,
}: Props) {
  const statusData = [
    {
      name: "Active",
      students: analytics.students.active,
      teachers: analytics.teachers.active,
      courses: analytics.courses.active,
    },
    {
      name: "Inactive",
      students: analytics.students.inactive,
      teachers: analytics.teachers.inactive,
      courses: analytics.courses.inactive,
    },
    {
      name: "Archived",
      students: 0,
      teachers: analytics.teachers.archived,
      courses: analytics.courses.archived,
    },
    {
      name: "Graduated",
      students: analytics.students.graduated,
      teachers: 0,
      courses: 0,
    },
  ];

  const announcementData = [
    {
      name: "Draft",
      value: analytics.announcements.draft,
    },
    {
      name: "Scheduled",
      value: analytics.announcements.scheduled,
    },
    {
      name: "Published",
      value: analytics.announcements.published,
    },
    {
      name: "Archived",
      value: analytics.announcements.archived,
    },
  ];

  const totalAnnouncements = announcementData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </span>
                Organization Status
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Current activity across students, teachers, and courses.
              </p>
            </div>

            <div className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
              Live overview
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{
                  top: 8,
                  right: 8,
                  left: -16,
                  bottom: 4,
                }}
                barGap={8}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.55}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
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
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.45 }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                    paddingBottom: 18,
                  }}
                />

                <Bar
                  dataKey="students"
                  name="Students"
                  fill={chartColors.students}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={22}
                />

                <Bar
                  dataKey="teachers"
                  name="Teachers"
                  fill={chartColors.teachers}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={22}
                />

                <Bar
                  dataKey="courses"
                  name="Courses"
                  fill={chartColors.courses}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm ring-1 ring-border/60">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Megaphone className="h-4 w-4" />
                </span>
                Announcement Status
              </CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Distribution of announcements by lifecycle stage.
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold">
                {totalAnnouncements}
              </div>
              <div className="text-[11px] text-muted-foreground">
                total
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="relative h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={announcementData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={72}
                  outerRadius={108}
                  paddingAngle={3}
                  strokeWidth={0}
                  labelLine={false}
                >
                  {announcementData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={announcementColors[index]}
                    />
                  ))}
                </Pie>

                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-5">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {analytics.announcements.published}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  published
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-x-4 gap-y-2">
              {announcementData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: announcementColors[index],
                    }}
                  />
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

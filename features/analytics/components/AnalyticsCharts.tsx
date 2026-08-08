"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Organization Status</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="students"
                  name="Students"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="teachers"
                  name="Teachers"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="courses"
                  name="Courses"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Status</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={announcementData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label
                >
                  {announcementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
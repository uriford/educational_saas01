import {
  Megaphone,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AnalyticsOverview as AnalyticsOverviewType } from "../types";

type Props = {
  analytics: AnalyticsOverviewType;
};

export default function AnalyticsOverview({
  analytics,
}: Props) {
  const cards = [
    {
      title: "Students",
      value: analytics.students.total,
      subtitle: `${analytics.students.active} active`,
      icon: GraduationCap,
    },
    {
      title: "Teachers",
      value: analytics.teachers.total,
      subtitle: `${analytics.teachers.active} active`,
      icon: Users,
    },
    {
      title: "Courses",
      value: analytics.courses.total,
      subtitle: `${analytics.courses.active} active`,
      icon: BookOpen,
    },
    {
      title: "Announcements",
      value: analytics.announcements.total,
      subtitle: `${analytics.announcements.published} published`,
      icon: Megaphone,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

              <p className="text-xs text-muted-foreground">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
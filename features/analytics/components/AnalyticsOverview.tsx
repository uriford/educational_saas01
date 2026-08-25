import {
  Megaphone,
  BookOpen,
  GraduationCap,
  Users,
  ArrowUpRight,
  Activity,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      line: "bg-blue-500",
    },
    {
      title: "Teachers",
      value: analytics.teachers.total,
      subtitle: `${analytics.teachers.active} active`,
      icon: Users,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      line: "bg-violet-500",
    },
    {
      title: "Courses",
      value: analytics.courses.total,
      subtitle: `${analytics.courses.active} active`,
      icon: BookOpen,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      line: "bg-emerald-500",
    },
    {
      title: "Announcements",
      value: analytics.announcements.total,
      subtitle: `${analytics.announcements.published} published`,
      icon: Megaphone,
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      line: "bg-amber-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/20 shadow-sm ring-1 ring-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 ${card.line}`}
            />

            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <Activity className="h-3 w-3" />
                  Active overview
                </div>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-3xl font-bold tracking-tight">
                    {card.value}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>

                <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-muted/70">
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

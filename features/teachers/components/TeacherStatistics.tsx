"use client";

import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  UserMinus,
  UserPlus,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/providers/LanguageProvider";

type Props = {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
  resigned: number;
  newThisMonth: number;
};

export default function TeacherStatistics({
  total,
  active,
  inactive,
  onLeave,
  resigned,
  newThisMonth,
}: Props) {
  const { t } = useLanguage();

  const statistics = [
    {
      title: t("teacherStatistics.totalTeachers"),
      value: total,
      description: t("teacherStatistics.totalDescription"),
      icon: Users,
    },
    {
      title: t("teacherStatistics.active"),
      value: active,
      description: t("teacherStatistics.activeDescription"),
      icon: UserCheck,
    },
    {
      title: t("teacherStatistics.inactive"),
      value: inactive,
      description: t("teacherStatistics.inactiveDescription"),
      icon: UserX,
    },
    {
      title: t("teacherStatistics.onLeave"),
      value: onLeave,
      description: t("teacherStatistics.onLeaveDescription"),
      icon: Clock3,
    },
    {
      title: t("teacherStatistics.resigned"),
      value: resigned,
      description: t("teacherStatistics.resignedDescription"),
      icon: UserMinus,
    },
    {
      title: t("teacherStatistics.newThisMonth"),
      value: newThisMonth,
      description: t("teacherStatistics.newThisMonthDescription"),
      icon: UserPlus,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statistics.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.title}
            className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>

                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
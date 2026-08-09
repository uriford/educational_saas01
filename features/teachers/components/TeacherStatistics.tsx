import {
  Users,
  UserCheck,
  UserX,
  Clock3,
  UserMinus,
  UserPlus,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

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
  const statistics = [
    {
      title: "Total Teachers",
      value: total,
      description: "All active records",
      icon: Users,
    },
    {
      title: "Active",
      value: active,
      description: "Currently teaching",
      icon: UserCheck,
    },
    {
      title: "Inactive",
      value: inactive,
      description: "Currently inactive",
      icon: UserX,
    },
    {
      title: "On Leave",
      value: onLeave,
      description: "Temporarily unavailable",
      icon: Clock3,
    },
    {
      title: "Resigned",
      value: resigned,
      description: "No longer working",
      icon: UserMinus,
    },
    {
      title: "New This Month",
      value: newThisMonth,
      description: "Recently added",
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
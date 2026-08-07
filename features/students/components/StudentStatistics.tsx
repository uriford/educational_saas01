import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  statistics: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    newStudents: number;
  };
};

export default function StudentStatistics({
  statistics,
}: Props) {
  const cards = [
    {
      title: "Total Students",
      value: statistics.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Students",
      value: statistics.activeStudents,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Inactive",
      value: statistics.inactiveStudents,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "New This Month",
      value: statistics.newStudents,
      icon: CalendarDays,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {card.value}
                </h2>
              </div>

              <div
                className={`rounded-xl p-3 ${card.bg}`}
              >
                <Icon
                  className={card.color}
                  size={28}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
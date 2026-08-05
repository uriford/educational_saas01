import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { StatsCardData } from "../types";

export default function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
}: StatsCardData) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <h3 className="text-3xl font-bold tracking-tight">
              {value}
            </h3>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <TrendingUp className="size-4 text-green-600" />

          <span className="text-sm font-medium text-green-600">
            {trend.value}
          </span>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
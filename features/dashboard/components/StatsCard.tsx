import { Card, CardContent } from "@/components/ui/card";
import {
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { StatsCardData } from "../types";

export default function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
}: StatsCardData) {
  const TrendIcon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : Minus;

  const trendClass =
    trend.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend.direction === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <Card className="group overflow-hidden rounded-xl border-border/60 bg-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>

            <p className="mt-3 truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {value}
            </p>
          </div>

          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
            <Icon className="size-5" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${trendClass}`}
          >
            <TrendIcon className="size-3.5" />
            {trend.value}
          </span>

          <span className="text-xs text-muted-foreground">
            {description}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

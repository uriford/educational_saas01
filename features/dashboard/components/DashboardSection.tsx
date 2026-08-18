import { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border-border/60 bg-background shadow-sm",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b border-border/50 px-5 py-4 sm:px-6">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight">
            {title}
          </CardTitle>

          {description && (
            <CardDescription className="text-xs sm:text-sm">
              {description}
            </CardDescription>
          )}
        </div>

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </CardHeader>

      <CardContent className="px-5 py-5 sm:px-6">
        {children}
      </CardContent>
    </Card>
  );
}

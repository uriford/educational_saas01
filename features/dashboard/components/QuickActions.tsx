"use client";

import { ArrowUpRight, Zap } from "lucide-react";

import DashboardSection from "./DashboardSection";
import EmptyState from "./EmptyState";
import { quickActions } from "../data";

export default function QuickActions() {
  return (
    <DashboardSection
      title="Quick Actions"
      description="Frequently used shortcuts"
    >
      {quickActions.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No quick actions"
          description="Available shortcuts will appear here."
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <a
                key={action.title}
                href={action.href}
                className="group flex items-center gap-3 rounded-xl border border-border/60 p-3.5 transition-all duration-200 hover:border-border hover:bg-muted/40 hover:shadow-sm"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
                  <Icon className="size-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {action.title}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>

                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}

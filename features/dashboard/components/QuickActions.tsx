"use client";

import { Zap } from "lucide-react";

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <span className="font-medium">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
"use client";

import { Activity } from "lucide-react";

import DashboardSection from "./DashboardSection";
import EmptyState from "./EmptyState";
import { recentActivities } from "../data";

export default function RecentActivity() {
  return (
    <DashboardSection
      title="Recent Activity"
      description="Latest actions across the platform"
    >
      {recentActivities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No recent activity"
          description="Recent actions across the platform will appear here."
        />
      ) : (
        <div className="space-y-6">
          {recentActivities.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <div key={index}>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">
                      {activity.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.description}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>

                {index !== recentActivities.length - 1 && (
                  <div className="mt-6 border-b" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
"use client";

import { CalendarClock } from "lucide-react";

import DashboardSection from "./DashboardSection";
import EmptyState from "./EmptyState";
import { upcomingClasses } from "../data";

export default function UpcomingClasses() {
  return (
    <DashboardSection
      title="Upcoming Classes"
      description="Today's scheduled classes"
    >
      {upcomingClasses.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming classes"
          description="Today's scheduled classes will appear here."
        />
      ) : (
        <div className="space-y-5">
          {upcomingClasses.map((item, index) => (
            <div key={item.title}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarClock className="size-5 text-primary" />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.startTime} - {item.endTime}
                  </p>

                  <p className="mt-1 text-sm">
                    {item.teacher}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {item.room}
                  </p>
                </div>
              </div>

              {index !== upcomingClasses.length - 1 && (
                <div className="mt-5 border-b" />
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
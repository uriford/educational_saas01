"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { getAttendanceAnalyticsAction } from "../actions/get-attendance-analytics.action";

import AttendanceAnalytics from "./AttendanceAnalytics";

import type {
  AttendanceAnalytics as AttendanceAnalyticsType,
  AttendanceAnalyticsPeriod,
} from "../types/attendance";

type Props = {
  initialAnalytics: AttendanceAnalyticsType;
};

export default function AttendanceAnalyticsSection({
  initialAnalytics,
}: Props) {
  const [period, setPeriod] =
    useState<AttendanceAnalyticsPeriod>(
      initialAnalytics.period,
    );

  const [analytics, setAnalytics] =
    useState<AttendanceAnalyticsType>(
      initialAnalytics,
    );

  const [isPending, startTransition] =
    useTransition();

  function changePeriod(
    nextPeriod: AttendanceAnalyticsPeriod,
  ) {
    if (nextPeriod === period) return;

    setPeriod(nextPeriod);

    startTransition(async () => {
      const result =
        await getAttendanceAnalyticsAction(
          nextPeriod,
        );

      if (result.success && result.analytics) {
        setAnalytics(result.analytics);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            Attendance period
          </p>

          <p className="text-xs text-muted-foreground">
            Compare attendance with the previous equivalent period.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={
              period === "WEEK"
                ? "default"
                : "outline"
            }
            disabled={isPending}
            onClick={() => changePeriod("WEEK")}
          >
            Week
          </Button>

          <Button
            type="button"
            variant={
              period === "MONTH"
                ? "default"
                : "outline"
            }
            disabled={isPending}
            onClick={() => changePeriod("MONTH")}
          >
            Month
          </Button>
        </div>
      </Card>

      <div
        className={
          isPending
            ? "pointer-events-none opacity-60 transition-opacity"
            : "transition-opacity"
        }
      >
        <AttendanceAnalytics analytics={analytics} />
      </div>
    </div>
  );
}

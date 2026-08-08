import { NextResponse } from "next/server";

import { CourseSchedulerService } from "@/features/courses/services/course-sheduler.service";
import { AnnouncementSchedulerService } from "@/features/announcements/services/announcement-scheduler.service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    await CourseSchedulerService.syncCourseStatuses();

    await AnnouncementSchedulerService.syncAnnouncementStatuses();

    return NextResponse.json({
      success: true,
      message: "Scheduled jobs completed successfully.",
    });
  } catch (error) {
    console.error("Cron job failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Scheduled jobs failed.",
      },
      {
        status: 500,
      },
    );
  }
}
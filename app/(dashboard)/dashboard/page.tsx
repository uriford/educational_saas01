import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Users,
  GraduationCap,
  BookOpen,
  Megaphone,
} from "lucide-react";

import StatsCard from "@/features/dashboard/components/StatsCard";
import WelcomeBanner from "@/features/dashboard/components/WelcomeBanner";
import RecentActivity from "@/features/dashboard/components/RecentActivity";
import RecentAnnouncements from "@/features/dashboard/components/RecentAnnouncement";
import UpcomingClasses from "@/features/dashboard/components/UpcomingClasses";
import QuickActions from "@/features/dashboard/components/QuickActions";

import { AnalyticsService } from "@/features/analytics/services/analytics.service";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  /*
   * SUPER_ADMIN is a platform-level account.
   *
   * The organization dashboard statistics are tenant-scoped,
   * so there is no organization-wide dashboard data to show
   * for SUPER_ADMIN yet.
   */
  if (session.user.role === "SUPER_ADMIN") {
    return (
      <div className="space-y-5 sm:space-y-6">
        <WelcomeBanner
          userName={session.user.name?.split(" ")[0] ?? "Admin"}
          organizationName="American Council Platform"
        />

        <div className="rounded-xl border bg-background p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Platform Administration
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Organization-level dashboard analytics are available after
            entering an organization context.
          </p>
        </div>
      </div>
    );
  }

  if (!session.user.organizationId) {
    redirect("/login");
  }

  if (!session.user.branchId) {
    redirect("/login");
  }

  const [
    overview,
    recentActivities,
    upcomingClasses,
    recentAnnouncements,
  ] = await Promise.all([
    AnalyticsService.getOverview(
      session.user.organizationId,
      session.user.branchId,
    ),
    DashboardService.getRecentActivity(
      session.user.organizationId,
      session.user.branchId,
    ),
    DashboardService.getUpcomingClasses(
      session.user.organizationId,
      session.user.branchId,
    ),
    DashboardService.getRecentAnnouncements(
      session.user.organizationId,
      session.user.branchId,
    ),
  ]);

  const userName =
    session.user.name?.split(" ")[0] ??
    "Admin";

  return (
    <div className="space-y-5 sm:space-y-6">
      <WelcomeBanner
        userName={userName}
        organizationName="your organization"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={overview.students.total}
          trend={{
            value: `${overview.students.active} active`,
            direction: "neutral",
          }}
          description="Students in your organization"
          icon={Users}
        />

        <StatsCard
          title="Teachers"
          value={overview.teachers.total}
          trend={{
            value: `${overview.teachers.active} active`,
            direction: "neutral",
          }}
          description="Teachers in your organization"
          icon={GraduationCap}
        />

        <StatsCard
          title="Courses"
          value={overview.courses.total}
          trend={{
            value: `${overview.courses.active} active`,
            direction: "neutral",
          }}
          description="Courses in your organization"
          icon={BookOpen}
        />

        <StatsCard
          title="Announcements"
          value={overview.announcements.total}
          trend={{
            value: `${overview.announcements.published} published`,
            direction: "neutral",
          }}
          description="Announcements in your organization"
          icon={Megaphone}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivities} />
        </div>

        <QuickActions />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingClasses classes={upcomingClasses} />

        <RecentAnnouncements
          announcements={recentAnnouncements}
        />
      </div>
    </div>
  );
}

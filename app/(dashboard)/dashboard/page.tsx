import QuickActions from "@/features/dashboard/components/QuickActions";
import RecentActivity from "@/features/dashboard/components/RecentActivity";
import RecentAnnouncements from "@/features/dashboard/components/RecentAnnouncement";
import StatsCard from "@/features/dashboard/components/StatsCard";
import UpcomingClasses from "@/features/dashboard/components/UpcomingClasses";
import WelcomeBanner from "@/features/dashboard/components/WelcomeBanner";
import { dashboardStats } from "@/features/dashboard/data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeBanner userName="Mamun" organizationName="American Council" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <StatsCard key={item.title} {...item} />
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        <QuickActions />
      </div>

      {/* Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingClasses />

        <RecentAnnouncements />
      </div>
    </div>
  );
}

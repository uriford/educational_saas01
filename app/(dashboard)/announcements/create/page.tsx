import { requireAdmin } from "@/features/auth/authorization";
import AnnouncementForm from "@/features/announcements/components/AnnouncementForm";

export default async function CreateAnnouncementPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Create Announcement
        </h1>

        <p className="text-muted-foreground">
          Create an announcement for your organization.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <AnnouncementForm mode="create" />
      </div>
    </div>
  );
}
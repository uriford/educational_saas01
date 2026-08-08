import AnnouncementForm from "@/features/announcements/components/AnnouncementForm";

export default function CreateAnnouncementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Announcement
        </h1>

        <p className="text-sm text-muted-foreground">
          Create an announcement for your organization.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <AnnouncementForm mode="create" />
      </div>
    </div>
  );
}
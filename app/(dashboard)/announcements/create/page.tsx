import { requireAdmin } from "@/features/auth/authorization";
import AnnouncementForm from "@/features/announcements/components/AnnouncementForm";

export default async function CreateAnnouncementPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <AnnouncementForm mode="create" />
    </div>
  );
}

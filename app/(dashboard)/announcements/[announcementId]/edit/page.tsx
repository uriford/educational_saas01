import { notFound } from "next/navigation";

import AnnouncementForm from "@/features/announcements/components/AnnouncementForm";
import { AnnouncementService } from "@/features/announcements/services/announcement.service";
import { requireAdmin } from "@/features/auth/authorization";

type Props = {
  params: Promise<{
    announcementId: string;
  }>;
};

function toDateTimeLocal(value: Date | null | undefined) {
  if (!value) return undefined;

  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default async function Page({ params }: Props) {
  const { announcementId } = await params;

  const session = await requireAdmin();

  if (!session?.user?.organizationId) {
    return null;
  }

  const announcement =
    await AnnouncementService.getById(
      announcementId,
      session.user.organizationId,
      session.user.branchId ?? undefined,
    );

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AnnouncementForm
        mode="edit"
        announcementId={announcement.id}
        defaultValues={{
          title: announcement.title,
          content: announcement.content,
          status: announcement.status,
          publishAt: toDateTimeLocal(announcement.publishAt),
          expiresAt: toDateTimeLocal(announcement.expiresAt),
        }}
      />
    </div>
  );
}

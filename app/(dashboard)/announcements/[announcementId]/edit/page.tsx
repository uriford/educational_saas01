import { notFound } from "next/navigation";

import AnnouncementForm from "@/features/announcements/components/AnnouncementForm";
import { AnnouncementService } from "@/features/announcements/services/announcement.service";
import { requireAdmin } from "@/features/auth/authorization";

type Props = {
  params: Promise<{
    announcementId: string;
  }>;
};

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Announcement
        </h1>

        <p className="text-sm text-muted-foreground">
          Update this announcement.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <AnnouncementForm
          mode="edit"
          announcementId={announcement.id}
          defaultValues={{
            title: announcement.title,
            content: announcement.content,
            status: announcement.status,
            publishAt: announcement.publishAt
              ? new Date(announcement.publishAt)
              : undefined,
            expiresAt: announcement.expiresAt
              ? new Date(announcement.expiresAt)
              : undefined,
          }}
        />
      </div>
    </div>
  );
}
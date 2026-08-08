import AnnouncementDetailsPage from "@/features/announcements/pages/AnnouncementDetailsPage";

type Props = {
  params: Promise<{
    announcementId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { announcementId } = await params;

  return (
    <AnnouncementDetailsPage
      announcementId={announcementId}
    />
  );
}
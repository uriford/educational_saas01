import { auth } from "@/auth";
import { SettingsService } from "@/features/settings/services/settings.service";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return null;
  }

  const settings = await SettingsService.getSettings(
    session.user.organizationId,
    session.user.id,
    session.user.branchId ?? undefined,
  );

  if (!settings.organization || !settings.user) {
    return null;
  }

  return (
    <DashboardLayout
      organization={{
        name: settings.organization.name,
        logo: settings.organization.logo,
      }}
      user={{
        firstName: settings.user.firstName,
        lastName: settings.user.lastName ?? "",
        role: String(settings.user.role),
        avatar: settings.user.avatar,
      }}
    >
      {children}
    </DashboardLayout>
  );
}

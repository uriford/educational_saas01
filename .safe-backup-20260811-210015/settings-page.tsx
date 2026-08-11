import { auth } from "@/auth";

import { SettingsService } from "@/features/settings/services/settings.service";
import SettingsTabs from "@/features/settings/components/SettingsTabs";

export default async function SettingsPage() {
  const session = await auth();

  if (
    !session?.user?.organizationId ||
    !session?.user?.id
  ) {
    return null;
  }

  const settings =
    await SettingsService.getSettings(
      session.user.organizationId,
      session.user.id,
      session.user.branchId ?? undefined,
    );

  if (!settings.organization || !settings.user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your organization, account, preferences,
          and security.
        </p>
      </div>

      <SettingsTabs
        organization={{
          name: settings.organization.name,
          email:
            settings.organization.email ?? "",
          phone:
            settings.organization.phone ?? "",
          domain:
            settings.organization.domain ?? "",
          timezone:
            settings.organization.settings?.timezone ??
            "Asia/Dhaka",
          language:
            settings.organization.settings?.language ??
            "en",
          currency:
            settings.organization.settings?.currency ??
            "BDT",
        }}
        profile={{
          firstName: settings.user.firstName,
          lastName:
            settings.user.lastName ?? "",
          phone:
            settings.user.phone ?? "",
        }}
        branch={settings.branch}
        security={{
          email: settings.user.email,
          role: String(settings.user.role),
          status: String(settings.user.status),
          emailVerified:
            settings.user.emailVerified,
          lastLoginAt:
            settings.user.lastLoginAt,
        }}
      />
    </div>
  );
}
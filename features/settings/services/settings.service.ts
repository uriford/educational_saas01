import { SettingsRepository } from "../repository/settings.repository";

export class SettingsService {
  static async getSettings(
    organizationId: string,
    userId: string,
    branchId?: string,
  ) {
    const [organization, user, branch] =
      await Promise.all([
        SettingsRepository.getOrganization(
          organizationId,
        ),
        SettingsRepository.getUser(userId),
        branchId
          ? SettingsRepository.getBranch(branchId)
          : null,
      ]);

    return {
      organization,
      user,
      branch,
    };
  }

  static async updateOrganization(
    organizationId: string,
    data: {
      name: string;
      email?: string;
      phone?: string;
      domain?: string;
    },
  ) {
    const result =
      await SettingsRepository.updateOrganization(
        organizationId,
        data,
      );

    return {
      success: result.count > 0,
      message:
        result.count > 0
          ? "Organization settings updated successfully."
          : "Organization not found.",
    };
  }

  static async updateOrganizationSettings(
    organizationId: string,
    data: {
      timezone: string;
      language: string;
      currency: string;
    },
  ) {
    await SettingsRepository.updateOrganizationSettings(
      organizationId,
      data,
    );

    return {
      success: true,
      message: "Preferences updated successfully.",
    };
  }

  static async updateUser(
    userId: string,
    data: {
      firstName: string;
      lastName?: string;
      phone?: string;
    },
  ) {
    const result =
      await SettingsRepository.updateUser(
        userId,
        data,
      );

    return {
      success: result.count > 0,
      message:
        result.count > 0
          ? "Profile updated successfully."
          : "User not found.",
    };
  }
}
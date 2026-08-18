import "server-only";

import { SettingsRepository } from "../repository/settings.repository";
import {
  organizationSettingsSchema,
  organizationPreferencesSchema,
  profileSettingsSchema,
  type OrganizationSettingsInput,
  type OrganizationPreferencesInput,
  type ProfileSettingsInput,
} from "../schemas/settings.schema";

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
    userId: string,
    data: OrganizationSettingsInput,
  ) {
    const parsed =
      organizationSettingsSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ??
          "Invalid organization settings.",
      };
    }

    const user =
      await SettingsRepository.getUser(userId);

    if (
      !user ||
      user.organizationId !== organizationId
    ) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    if (user.role !== "ORGANIZATION_ADMIN") {
      return {
        success: false,
        message:
          "Only organization admins can update organization settings.",
      };
    }

    const result =
      await SettingsRepository.updateOrganization(
        organizationId,
        {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          domain: parsed.data.domain,
        },
      );

    return {
      success: result.count > 0,
      message:
        result.count > 0
          ? "Organization information updated successfully."
          : "Organization not found.",
    };
  }

  static async updateOrganizationSettings(
    organizationId: string,
    userId: string,
    data: OrganizationPreferencesInput,
  ) {
    const parsed =
      organizationPreferencesSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ??
          "Invalid preferences.",
      };
    }

    const user =
      await SettingsRepository.getUser(userId);

    if (
      !user ||
      user.organizationId !== organizationId
    ) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    if (user.role !== "ORGANIZATION_ADMIN") {
      return {
        success: false,
        message:
          "Only organization admins can update organization preferences.",
      };
    }

    await SettingsRepository.updateOrganizationSettings(
      organizationId,
      {
        timezone: parsed.data.timezone,
        language: parsed.data.language,
        currency: parsed.data.currency,
        attendanceEnabled:
          parsed.data.attendanceEnabled,
      },
    );

    return {
      success: true,
      message: "Preferences updated successfully.",
    };
  }

  static async updateUserAvatar(
    userId: string,
    avatar: string,
  ) {
    try {
      const result =
        await SettingsRepository.updateUserAvatar(
          userId,
          avatar,
        );

      return {
        success: result.count > 0,
        message:
          result.count > 0
            ? "Profile photo updated successfully."
            : "User not found.",
      };
    } catch (error) {
      console.error(
        "UPDATE USER AVATAR SERVICE ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to update profile photo.",
      };
    }
  }

  static async removeUserAvatar(
    userId: string,
  ) {
    try {
      const result =
        await SettingsRepository.removeUserAvatar(
          userId,
        );

      return {
        success: result.count > 0,
        message:
          result.count > 0
            ? "Profile photo removed successfully."
            : "User not found.",
      };
    } catch (error) {
      console.error(
        "REMOVE USER AVATAR SERVICE ERROR:",
        error,
      );

      return {
        success: false,
        message: "Failed to remove profile photo.",
      };
    }
  }

  static async updateUser(
    userId: string,
    data: ProfileSettingsInput,
  ) {
    const parsed =
      profileSettingsSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ??
          "Invalid profile information.",
      };
    }

    const result =
      await SettingsRepository.updateUser(
        userId,
        {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
        },
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

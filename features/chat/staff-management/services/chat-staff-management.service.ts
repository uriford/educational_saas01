import "server-only";

import {
  createChatStaffMember,
  getAvailableChatStaffUsers,
  getChatStaffMembers,
  getOrganizationUser,
  removeChatStaffMember,
  updateChatStaffMember,
} from "../repository/chat-staff-management.repository";

export class ChatStaffManagementService {
  static async getAvailableUsers(
    organizationId: string,
  ) {
    return getAvailableChatStaffUsers(
      organizationId,
    );
  }

  static async getStaff(
    organizationId: string,
  ) {
    return getChatStaffMembers(
      organizationId,
    );
  }

  static async addStaff(data: {
    organizationId: string;
    userId: string;
    position?: string | null;
    canReply?: boolean;
    canViewAllChats?: boolean;
  }) {
    const user = await getOrganizationUser(
      data.organizationId,
      data.userId,
    );

    if (!user) {
      return {
        success: false,
        message:
          "User not found, inactive, or outside this organization.",
      };
    }

    if (user.role === "STUDENT") {
      return {
        success: false,
        message:
          "Students cannot be added as chat staff.",
      };
    }

    const existing = await getChatStaffMembers(
      data.organizationId,
    );

    if (
      existing.some(
        (staff) => staff.userId === data.userId,
      )
    ) {
      return {
        success: false,
        message:
          "This user is already a chat staff member.",
      };
    }

    const staff = await createChatStaffMember(
      data,
    );

    return {
      success: true,
      message: "Chat staff added successfully.",
      data: staff,
    };
  }

  static async updateStaff(data: {
    organizationId: string;
    staffId: string;
    position?: string | null;
    canReply?: boolean;
    canViewAllChats?: boolean;
    status?: "ONLINE" | "OFFLINE" | "BUSY";
  }) {
    const result =
      await updateChatStaffMember(
        data.organizationId,
        data.staffId,
        {
          position: data.position,
          canReply: data.canReply,
          canViewAllChats:
            data.canViewAllChats,
          status: data.status,
        },
      );

    if (result.count === 0) {
      return {
        success: false,
        message: "Chat staff member not found.",
      };
    }

    return {
      success: true,
      message:
        "Chat staff member updated successfully.",
    };
  }

  static async removeStaff(
    organizationId: string,
    staffId: string,
  ) {
    const result =
      await removeChatStaffMember(
        organizationId,
        staffId,
      );

    if (result.count === 0) {
      return {
        success: false,
        message: "Chat staff member not found.",
      };
    }

    return {
      success: true,
      message:
        "Chat staff member removed successfully.",
    };
  }
}

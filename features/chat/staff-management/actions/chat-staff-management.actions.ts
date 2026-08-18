"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

import { ChatStaffManagementService } from "../services/chat-staff-management.service";

function canManageChatStaff(
  role?: string | null,
) {
  return (
    role === "ORGANIZATION_ADMIN" ||
    role === "SUPER_ADMIN"
  );
}

export async function getAvailableChatStaffUsersAction() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !canManageChatStaff(session.user.role)
  ) {
    return {
      success: false,
      message: "Unauthorized.",
      data: [],
    };
  }

  const data =
    await ChatStaffManagementService.getAvailableUsers(
      session.user.organizationId,
    );

  return {
    success: true,
    data,
  };
}

export async function getChatStaffMembersAction() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !canManageChatStaff(session.user.role)
  ) {
    return {
      success: false,
      message: "Unauthorized.",
      data: [],
    };
  }

  const data =
    await ChatStaffManagementService.getStaff(
      session.user.organizationId,
    );

  return {
    success: true,
    data,
  };
}

export async function addChatStaffAction(data: {
  userId: string;
  position?: string | null;
  canReply?: boolean;
  canViewAllChats?: boolean;
}) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !canManageChatStaff(session.user.role)
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const result =
    await ChatStaffManagementService.addStaff({
      organizationId:
        session.user.organizationId,
      userId: data.userId,
      position: data.position,
      canReply: data.canReply,
      canViewAllChats:
        data.canViewAllChats,
    });

  if (result.success) {
    revalidatePath("/chat/staff");
    revalidatePath("/chat");
  }

  return result;
}

export async function updateChatStaffAction(data: {
  staffId: string;
  position?: string | null;
  canReply?: boolean;
  canViewAllChats?: boolean;
  status?: "ONLINE" | "OFFLINE" | "BUSY";
}) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !canManageChatStaff(session.user.role)
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const result =
    await ChatStaffManagementService.updateStaff({
      organizationId:
        session.user.organizationId,
      staffId: data.staffId,
      position: data.position,
      canReply: data.canReply,
      canViewAllChats:
        data.canViewAllChats,
      status: data.status,
    });

  if (result.success) {
    revalidatePath("/chat/staff");
    revalidatePath("/chat");
  }

  return result;
}

export async function removeChatStaffAction(
  staffId: string,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    !canManageChatStaff(session.user.role)
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const result =
    await ChatStaffManagementService.removeStaff(
      session.user.organizationId,
      staffId,
    );

  if (result.success) {
    revalidatePath("/chat/staff");
    revalidatePath("/chat");
  }

  return result;
}

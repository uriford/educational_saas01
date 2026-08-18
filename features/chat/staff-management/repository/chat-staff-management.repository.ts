import "server-only";

import { db } from "@/lib/db";

/**
 * Returns organization users who can potentially be added
 * to ChatStaff.
 *
 * Students are excluded because student accounts are chat
 * participants, not organization staff.
 *
 * Existing ChatStaff members are excluded as well.
 */
export async function getAvailableChatStaffUsers(
  organizationId: string,
) {
  return db.user.findMany({
    where: {
      organizationId,
      role: {
        not: "STUDENT",
      },
      status: "ACTIVE",
      chatStaff: {
        none: {},
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
    },
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],
  });
}

/**
 * Returns all ChatStaff members belonging to the organization.
 */
export async function getChatStaffMembers(
  organizationId: string,
) {
  return db.chatStaff.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      organizationId: true,
      userId: true,
      position: true,
      status: true,
      lastSeenAt: true,
      lastActiveAt: true,
      canReply: true,
      canViewAllChats: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Finds a user inside the supplied organization.
 */
export async function getOrganizationUser(
  organizationId: string,
  userId: string,
) {
  return db.user.findFirst({
    where: {
      id: userId,
      organizationId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      organizationId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
    },
  });
}

/**
 * Creates the ChatStaff record for an existing organization user.
 *
 * No User schema changes are required.
 */
export async function createChatStaffMember(data: {
  organizationId: string;
  userId: string;
  position?: string | null;
  canReply?: boolean;
  canViewAllChats?: boolean;
}) {
  return db.chatStaff.create({
    data: {
      organizationId: data.organizationId,
      userId: data.userId,
      position: data.position ?? null,
      canReply: data.canReply ?? true,
      canViewAllChats: data.canViewAllChats ?? false,
      status: "OFFLINE",
    },
    select: {
      id: true,
      organizationId: true,
      userId: true,
      position: true,
      status: true,
      canReply: true,
      canViewAllChats: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

/**
 * Updates ChatStaff permissions/profile information.
 */
export async function updateChatStaffMember(
  organizationId: string,
  staffId: string,
  data: {
    position?: string | null;
    canReply?: boolean;
    canViewAllChats?: boolean;
    status?: "ONLINE" | "OFFLINE" | "BUSY";
  },
) {
  return db.chatStaff.updateMany({
    where: {
      id: staffId,
      organizationId,
    },
    data,
  });
}

/**
 * Removes a user from ChatStaff.
 *
 * The User itself is NOT deleted.
 * Existing conversations are intentionally left untouched;
 * assignedStaffId will become null because the existing
 * ChatStaff relation uses onDelete: SetNull.
 */
export async function removeChatStaffMember(
  organizationId: string,
  staffId: string,
) {
  return db.chatStaff.deleteMany({
    where: {
      id: staffId,
      organizationId,
    },
  });
}

import "server-only";

import { db } from "@/lib/db";

export async function getOrganizationUsersForChatStaff(
  organizationId: string,
) {
  return db.user.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      role: {
        in: [
          "ORGANIZATION_ADMIN",
          "BRANCH_ADMIN",
        ],
      },
      chatStaff: {
        none: {
          organizationId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
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

export async function getChatStaffManagementList(
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
          role: true,
          status: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getOrganizationUserById(
  organizationId: string,
  userId: string,
) {
  return db.user.findFirst({
    where: {
      id: userId,
      organizationId,
      status: "ACTIVE",
      role: {
        in: [
          "ORGANIZATION_ADMIN",
          "BRANCH_ADMIN",
        ],
      },
    },
    select: {
      id: true,
      organizationId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
    },
  });
}

export async function getChatStaffById(
  organizationId: string,
  staffId: string,
) {
  return db.chatStaff.findFirst({
    where: {
      id: staffId,
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
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          avatar: true,
        },
      },
    },
  });
}

export async function createChatStaff(
  organizationId: string,
  userId: string,
  data: {
    position?: string | null;
    canReply?: boolean;
    canViewAllChats?: boolean;
  },
) {
  return db.chatStaff.create({
    data: {
      organizationId,
      userId,
      position: data.position ?? null,
      canReply: data.canReply ?? true,
      canViewAllChats:
        data.canViewAllChats ?? false,
      status: "OFFLINE",
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
          role: true,
          status: true,
          avatar: true,
        },
      },
    },
  });
}

export async function updateChatStaff(
  organizationId: string,
  staffId: string,
  data: {
    position?: string | null;
    canReply?: boolean;
    canViewAllChats?: boolean;
  },
) {
  return db.chatStaff.update({
    where: {
      id: staffId,
    },
    data,
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
          role: true,
          status: true,
          avatar: true,
        },
      },
    },
  });
}

export async function deleteChatStaff(
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

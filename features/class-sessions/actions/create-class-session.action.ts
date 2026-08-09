"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { ClassSessionService } from "../services/class-session.service";

export async function createClassSessionAction(data: {
  courseId: string;
  teacherId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  room?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.BRANCH_ADMIN,
  ];

  if (!allowedRoles.includes(session.user.role)) {
    return {
      success: false,
      message: "You are not allowed to create class sessions.",
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization information is missing.",
    };
  }

  if (!session.user.branchId) {
    return {
      success: false,
      message: "Branch information is missing.",
    };
  }

  if (!data.title.trim()) {
    return {
      success: false,
      message: "Class title is required.",
    };
  }

  if (!data.startTime || !data.endTime) {
    return {
      success: false,
      message: "Start time and end time are required.",
    };
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (
    Number.isNaN(startTime.getTime()) ||
    Number.isNaN(endTime.getTime())
  ) {
    return {
      success: false,
      message: "Invalid date or time.",
    };
  }

  return ClassSessionService.create({
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
    courseId: data.courseId,
    teacherId: data.teacherId,
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    startTime,
    endTime,
    room: data.room?.trim() || undefined,
    createdById: session.user.id,
  });
}

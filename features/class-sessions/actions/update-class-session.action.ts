"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { ClassSessionService } from "../services/class-session.service";

export async function updateClassSessionAction(data: {
  id: string;
  title: string;
  teacherId: string;
  description?: string;
  startTime: string;
  endTime: string;
  room?: string;
  status:
    | "SCHEDULED"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED";
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
      message: "You are not allowed to update class sessions.",
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

  if (!data.id) {
    return {
      success: false,
      message: "Class session ID is required.",
    };
  }

  if (!data.title.trim()) {
    return {
      success: false,
      message: "Class title is required.",
    };
  }

  if (!data.teacherId) {
    return {
      success: false,
      message: "Please select a teacher.",
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

  return ClassSessionService.update({
    id: data.id,
    organizationId: session.user.organizationId,
    branchId: session.user.branchId,
    title: data.title.trim(),
    teacherId: data.teacherId,
    description: data.description?.trim() || null,
    startTime,
    endTime,
    room: data.room?.trim() || null,
    status: data.status,
    updatedById: session.user.id,
  });
}


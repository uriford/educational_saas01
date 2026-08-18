"use server";

import { requireStudent } from "@/features/auth/authorization";
import { StudentService } from "../services/student.service";
import {
  updateOwnStudentProfileSchema,
  type UpdateOwnStudentProfileData,
} from "../schemas/update-own-student-profile.schema";

export async function updateOwnStudentProfileAction(
  data: UpdateOwnStudentProfileData,
) {
  try {
    const session = await requireStudent();

    if (
      !session.user.organizationId ||
      !session.user.branchId
    ) {
      return {
        success: false,
        message: "Organization or Branch not found.",
      };
    }

    const parsed =
      updateOwnStudentProfileSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid profile data.",
      };
    }

    const student =
      await StudentService.getByUserId(
        session.user.id,
        session.user.organizationId,
        session.user.branchId,
      );

    if (!student) {
      return {
        success: false,
        message: "Student profile not found.",
      };
    }

    return StudentService.updateOwnProfile(
      student.id,
      session.user.id,
      session.user.organizationId,
      session.user.branchId,
      parsed.data,
    );
  } catch (error) {
    console.error(
      "UPDATE OWN STUDENT PROFILE ERROR:",
      error,
    );

    if (
      error instanceof Error &&
      error.message === "Forbidden"
    ) {
      return {
        success: false,
        message:
          "You do not have permission to update this profile.",
      };
    }

    return {
      success: false,
      message: "Unauthorized.",
    };
  }
}

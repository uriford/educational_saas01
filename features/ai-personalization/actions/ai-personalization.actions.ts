"use server";

import { requireStudent } from "@/features/auth/authorization";
import { StudentService } from "@/features/students/services/student.service";

import {
  AIPersonalizationService,
} from "../services/ai-personalization.service";

export async function generateAIPersonalizationAction(
  courseId: string,
) {
  try {
    const session = await requireStudent();

    if (
      !session.user.organizationId ||
      !session.user.branchId
    ) {
      throw new Error("Organization and branch access required.");
    }

    const student =
      await StudentService.getByUserId(
        session.user.id,
        session.user.organizationId,
        session.user.branchId,
      );

    if (!student) {
      throw new Error("Student profile not found.");
    }

    return await AIPersonalizationService.generate(
      student.id,
      courseId,
      session.user.organizationId,
      session.user.branchId,
    );
  } catch (error) {
    console.error(
      "GENERATE AI PERSONALIZATION ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate AI personalization.",
    };
  }
}

export async function getAIPersonalizationAction(
  courseId: string,
) {
  try {
    const session = await requireStudent();

    if (
      !session.user.organizationId ||
      !session.user.branchId
    ) {
      throw new Error("Organization and branch access required.");
    }

    const student =
      await StudentService.getByUserId(
        session.user.id,
        session.user.organizationId,
        session.user.branchId,
      );

    if (!student) {
      throw new Error("Student profile not found.");
    }

    return await AIPersonalizationService.get(
      student.id,
      courseId,
      session.user.organizationId,
      session.user.branchId,
    );
  } catch (error) {
    console.error(
      "GET AI PERSONALIZATION ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to load AI personalization.",
    };
  }
}

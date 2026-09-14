"use server";

import { requireAdmin } from "@/features/auth/authorization";

import { ReviewRepository } from "../repository/review.repository";

export async function approveReviewAction(id: string) {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization not found.",
    };
  }

  const result = await ReviewRepository.setApproved(
    id,
    session.user.organizationId,
    true,
  );

  if (result.count === 0) {
    return {
      success: false,
      message: "Review not found.",
    };
  }

  return {
    success: true,
    message: "Review approved.",
  };
}

export async function deleteReviewAction(id: string) {
  const session = await requireAdmin();

  if (!session.user.organizationId) {
    return {
      success: false,
      message: "Organization not found.",
    };
  }

  const result = await ReviewRepository.deleteReview(
    id,
    session.user.organizationId,
  );

  if (result.count === 0) {
    return {
      success: false,
      message: "Review not found.",
    };
  }

  return {
    success: true,
    message: "Review deleted.",
  };
}

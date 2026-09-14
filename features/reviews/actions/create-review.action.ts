"use server";

import { auth } from "@/auth";
import { ReviewRepository } from "../repository/review.repository";

export async function createReviewAction(data: {
  type: "TEXT" | "VIDEO";
  rating: number;
  content?: string;
  videoUrl?: string;
}) {
  const session = await auth();

  if (!session?.user?.id || !session.user.organizationId) {
    return {
      success: false,
      message: "You must be logged in to submit a review.",
    };
  }

  if (data.rating < 1 || data.rating > 5) {
    return {
      success: false,
      message: "Rating must be between 1 and 5.",
    };
  }

  if (data.type === "TEXT" && !data.content?.trim()) {
    return {
      success: false,
      message: "Please write your review.",
    };
  }

  if (data.type === "VIDEO" && !data.videoUrl?.trim()) {
    return {
      success: false,
      message: "Please provide your video URL.",
    };
  }

  const eligibility =
    await ReviewRepository.getReviewEligibility(
      session.user.id,
      session.user.organizationId,
    );

  if (!eligibility.eligible || !eligibility.authorType) {
    return {
      success: false,
      message:
        "Only eligible students and guardians can submit reviews.",
    };
  }

  try {
    await ReviewRepository.createReview({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      authorType: eligibility.authorType,
      type: data.type,
      rating: data.rating,
      content:
        data.type === "TEXT"
          ? data.content?.trim()
          : undefined,
      videoUrl:
        data.type === "VIDEO"
          ? data.videoUrl?.trim()
          : undefined,
    });

    return {
      success: true,
      message:
        "Your review has been submitted and is awaiting approval.",
    };
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    return {
      success: false,
      message: "Unable to submit your review.",
    };
  }
}

"use server";

import { auth } from "@/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ReviewRepository } from "../repository/review.repository";

const REVIEW_VIDEO_BUCKET = "review-videos";
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
]);

export async function createReviewAction(data: {
  type: "TEXT" | "VIDEO";
  rating: number;
  content?: string;
  video?: File | null;
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

  if (data.type === "VIDEO") {
    if (!data.video) {
      return {
        success: false,
        message: "Please choose a video.",
      };
    }

    if (data.video.size === 0) {
      return {
        success: false,
        message: "The selected video is empty.",
      };
    }

    if (data.video.size > MAX_VIDEO_SIZE) {
      return {
        success: false,
        message: "Video must be 50 MB or smaller.",
      };
    }

    if (!ALLOWED_VIDEO_TYPES.has(data.video.type)) {
      return {
        success: false,
        message:
          "Unsupported video format. Please choose an MP4, WebM, MOV, AVI, or MKV video.",
      };
    }
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

  let videoUrl: string | undefined;

  try {
    if (data.type === "VIDEO" && data.video) {
      const supabase = getSupabaseServerClient();

      const extension =
        data.video.name.split(".").pop()?.toLowerCase() || "mp4";

      const filePath =
        `${session.user.organizationId}/` +
        `${session.user.id}/` +
        `${crypto.randomUUID()}.${extension}`;

      const buffer = Buffer.from(
        await data.video.arrayBuffer(),
      );

      const uploadResult = await supabase.storage
        .from(REVIEW_VIDEO_BUCKET)
        .upload(filePath, buffer, {
          contentType: data.video.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadResult.error) {
        console.error(
          "SUPABASE REVIEW VIDEO UPLOAD ERROR:",
          uploadResult.error,
        );

        return {
          success: false,
          message: "Failed to upload your video.",
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from(REVIEW_VIDEO_BUCKET)
        .getPublicUrl(filePath);

      videoUrl = publicUrl;
    }

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
      videoUrl,
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

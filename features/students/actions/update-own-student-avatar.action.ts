"use server";

import { requireStudent } from "@/features/auth/authorization";
import { StudentService } from "../services/student.service";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "student-avatars";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function updateOwnStudentAvatarAction(formData: FormData) {
  try {
    const session = await requireStudent();

    if (!session.user.organizationId || !session.user.branchId) {
      return {
        success: false,
        message: "Organization or Branch not found.",
      };
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return {
        success: false,
        message: "Please select an image.",
      };
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return {
        success: false,
        message: "Only JPG, PNG, and WebP images are allowed.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: "Image must be smaller than 5MB.",
      };
    }

    if (file.size === 0) {
      return {
        success: false,
        message: "The selected image is empty.",
      };
    }

    const student = await StudentService.getByUserId(
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

    const supabase = getSupabaseServerClient();

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const filePath =
      `${session.user.organizationId}/` +
      `${student.id}/` +
      `${crypto.randomUUID()}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadResult.error) {
      console.error("SUPABASE AVATAR UPLOAD ERROR:", uploadResult.error);

      return {
        success: false,
        message: "Failed to upload profile photo.",
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const updateResult = await StudentService.updateOwnAvatar(
      student.id,
      session.user.id,
      session.user.organizationId,
      session.user.branchId,
      publicUrl,
    );

    if (!updateResult.success) {
      await supabase.storage
        .from(BUCKET)
        .remove([filePath]);

      return updateResult;
    }

    if (student.avatar) {
      try {
        const oldUrl = new URL(student.avatar);
        const marker = `/storage/v1/object/public/${BUCKET}/`;

        const index = oldUrl.pathname.indexOf(marker);

        if (index !== -1) {
          const oldPath = decodeURIComponent(
            oldUrl.pathname.slice(index + marker.length),
          );

          if (oldPath) {
            await supabase.storage
              .from(BUCKET)
              .remove([oldPath]);
          }
        }
      } catch (error) {
        console.error("OLD AVATAR CLEANUP ERROR:", error);
      }
    }

    return {
      success: true,
      message: "Profile photo updated successfully.",
      avatar: publicUrl,
    };
  } catch (error) {
    console.error("UPDATE OWN STUDENT AVATAR ERROR:", error);

    return {
      success: false,
      message: "Failed to update profile photo.",
    };
  }
}

export async function removeOwnStudentAvatarAction() {
  try {
    const session = await requireStudent();

    if (!session.user.organizationId || !session.user.branchId) {
      return {
        success: false,
        message: "Organization or Branch not found.",
      };
    }

    const student = await StudentService.getByUserId(
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

    const supabase = getSupabaseServerClient();

    if (student.avatar) {
      try {
        const oldUrl = new URL(student.avatar);
        const marker = `/storage/v1/object/public/${BUCKET}/`;

        const index = oldUrl.pathname.indexOf(marker);

        if (index !== -1) {
          const oldPath = decodeURIComponent(
            oldUrl.pathname.slice(index + marker.length),
          );

          if (oldPath) {
            await supabase.storage
              .from(BUCKET)
              .remove([oldPath]);
          }
        }
      } catch (error) {
        console.error("AVATAR DELETE ERROR:", error);
      }
    }

    const result = await StudentService.removeOwnAvatar(
      student.id,
      session.user.id,
      session.user.organizationId,
      session.user.branchId,
    );

    return result;
  } catch (error) {
    console.error("REMOVE OWN STUDENT AVATAR ERROR:", error);

    return {
      success: false,
      message: "Failed to remove profile photo.",
    };
  }
}

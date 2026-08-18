"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsRepository } from "../repository/settings.repository";

const BUCKET = "user-avatars";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getStoragePathFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${BUCKET}/`;

    const index = parsed.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(
      parsed.pathname.slice(index + marker.length),
    );
  } catch {
    return null;
  }
}

export async function updateProfileAvatarAction(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      message: "Please select an image.",
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      message: "Only JPG, PNG, and WebP images are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: "Image must be smaller than 5 MB.",
    };
  }

  try {
    const currentUser =
      await SettingsRepository.getUser(
        session.user.id,
      );

    if (!currentUser) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const supabase =
      getSupabaseServerClient();

    // Create the bucket automatically if it does not exist.
    const { error: bucketError } =
      await supabase.storage.createBucket(
        BUCKET,
        {
          public: true,
          fileSizeLimit: "5MB",
          allowedMimeTypes: ALLOWED_TYPES,
        },
      );

    if (
      bucketError &&
      !bucketError.message
        .toLowerCase()
        .includes("already exists")
    ) {
      console.error(
        "CREATE USER AVATAR BUCKET ERROR:",
        bucketError,
      );

      return {
        success: false,
        message: "Unable to initialize profile photo storage.",
      };
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const filePath =
      `${session.user.id}/${crypto.randomUUID()}.${extension}`;

    const buffer =
      Buffer.from(
        await file.arrayBuffer(),
      );

    const { error: uploadError } =
      await supabase.storage
        .from(BUCKET)
        .upload(
          filePath,
          buffer,
          {
            contentType: file.type,
            upsert: false,
            cacheControl: "3600",
          },
        );

    if (uploadError) {
      console.error(
        "USER AVATAR UPLOAD ERROR:",
        uploadError,
      );

      return {
        success: false,
        message: "Failed to upload profile photo.",
      };
    }

    const {
      data: publicUrlData,
    } =
      supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

    const publicUrl =
      publicUrlData.publicUrl;

    const updateResult =
      await SettingsRepository.updateUserAvatar(
        session.user.id,
        publicUrl,
      );

    if (updateResult.count === 0) {
      await supabase.storage
        .from(BUCKET)
        .remove([filePath]);

      return {
        success: false,
        message: "Unable to update user profile.",
      };
    }

    // Remove the previous avatar after the database update succeeds.
    if (currentUser.avatar) {
      const oldPath =
        getStoragePathFromUrl(
          currentUser.avatar,
        );

      if (oldPath) {
        const { error } =
          await supabase.storage
            .from(BUCKET)
            .remove([oldPath]);

        if (error) {
          console.error(
            "OLD USER AVATAR CLEANUP ERROR:",
            error,
          );
        }
      }
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

    return {
      success: true,
      message:
        "Profile photo updated successfully.",
      avatar: publicUrl,
    };
  } catch (error) {
    console.error(
      "UPDATE PROFILE AVATAR ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to update profile photo.",
    };
  }
}

export async function removeProfileAvatarAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  try {
    const currentUser =
      await SettingsRepository.getUser(
        session.user.id,
      );

    if (!currentUser) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const supabase =
      getSupabaseServerClient();

    if (currentUser.avatar) {
      const oldPath =
        getStoragePathFromUrl(
          currentUser.avatar,
        );

      if (oldPath) {
        const { error } =
          await supabase.storage
            .from(BUCKET)
            .remove([oldPath]);

        if (error) {
          console.error(
            "USER AVATAR DELETE ERROR:",
            error,
          );
        }
      }
    }

    const result =
      await SettingsRepository.removeUserAvatar(
        session.user.id,
      );

    if (result.count === 0) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

    return {
      success: true,
      message:
        "Profile photo removed successfully.",
    };
  } catch (error) {
    console.error(
      "REMOVE PROFILE AVATAR ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to remove profile photo.",
    };
  }
}

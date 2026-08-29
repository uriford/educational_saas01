"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsRepository } from "../repository/settings.repository";

const BUCKET = "organization-logos";

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

async function getAuthorizedOrganization(
  organizationId: string,
  userId: string,
) {
  const user = await SettingsRepository.getUser(userId);

  if (
    !user ||
    user.organizationId !== organizationId ||
    user.role !== "ORGANIZATION_ADMIN"
  ) {
    return null;
  }

  return SettingsRepository.getOrganization(organizationId);
}

export async function updateOrganizationLogoAction(
  formData: FormData,
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const organizationId =
    session.user.organizationId;

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
      message: "Logo must be smaller than 5 MB.",
    };
  }

  try {
    const organization =
      await getAuthorizedOrganization(
        organizationId,
        session.user.id,
      );

    if (!organization) {
      return {
        success: false,
        message:
          "Only organization administrators can update the organization logo.",
      };
    }

    const supabase =
      getSupabaseServerClient();

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
        "CREATE ORGANIZATION LOGO BUCKET ERROR:",
        bucketError,
      );

      return {
        success: false,
        message:
          "Unable to initialize organization logo storage.",
      };
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const filePath =
      `${organizationId}/${crypto.randomUUID()}.${extension}`;

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
        "ORGANIZATION LOGO UPLOAD ERROR:",
        uploadError,
      );

      return {
        success: false,
        message: "Failed to upload organization logo.",
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
      await SettingsRepository.updateOrganizationLogo(
        organizationId,
        publicUrl,
      );

    if (updateResult.count === 0) {
      await supabase.storage
        .from(BUCKET)
        .remove([filePath]);

      return {
        success: false,
        message:
          "Unable to update organization logo.",
      };
    }

    if (organization.logo) {
      const oldPath =
        getStoragePathFromUrl(
          organization.logo,
        );

      if (oldPath) {
        const { error } =
          await supabase.storage
            .from(BUCKET)
            .remove([oldPath]);

        if (error) {
          console.error(
            "OLD ORGANIZATION LOGO CLEANUP ERROR:",
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
        "Organization logo updated successfully.",
      logo: publicUrl,
    };
  } catch (error) {
    console.error(
      "UPDATE ORGANIZATION LOGO ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to update organization logo.",
    };
  }
}

export async function removeOrganizationLogoAction() {
  const session = await auth();

  if (
    !session?.user?.id ||
    !session.user.organizationId
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const organizationId =
    session.user.organizationId;

  try {
    const organization =
      await getAuthorizedOrganization(
        organizationId,
        session.user.id,
      );

    if (!organization) {
      return {
        success: false,
        message:
          "Only organization administrators can remove the organization logo.",
      };
    }

    const supabase =
      getSupabaseServerClient();

    if (organization.logo) {
      const oldPath =
        getStoragePathFromUrl(
          organization.logo,
        );

      if (oldPath) {
        const { error } =
          await supabase.storage
            .from(BUCKET)
            .remove([oldPath]);

        if (error) {
          console.error(
            "ORGANIZATION LOGO DELETE ERROR:",
            error,
          );
        }
      }
    }

    const result =
      await SettingsRepository.removeOrganizationLogo(
        organizationId,
      );

    if (result.count === 0) {
      return {
        success: false,
        message: "Organization not found.",
      };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/", "layout");

    return {
      success: true,
      message:
        "Organization logo removed successfully.",
    };
  } catch (error) {
    console.error(
      "REMOVE ORGANIZATION LOGO ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to remove organization logo.",
    };
  }
}

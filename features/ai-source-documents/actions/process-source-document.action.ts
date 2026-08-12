"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { AISourceDocumentService } from "../services/ai-source-document.service";

const ALLOWED_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ORGANIZATION_ADMIN,
  ROLES.BRANCH_ADMIN,
];

function getAuthenticatedContext() {
  return auth().then((session) => {
    if (!session?.user?.id) {
      return {
        success: false as const,
        message: "Unauthorized.",
      };
    }

    if (!ALLOWED_ROLES.includes(session.user.role)) {
      return {
        success: false as const,
        message:
          "You are not allowed to manage AI source documents.",
      };
    }

    if (!session.user.organizationId) {
      return {
        success: false as const,
        message: "Organization information is missing.",
      };
    }

    if (!session.user.branchId) {
      return {
        success: false as const,
        message: "Branch information is missing.",
      };
    }

    return {
      success: true as const,
      userId: session.user.id,
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
    };
  });
}

export async function processAISourceDocument(input: {
  name: string;
  description?: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  fileBuffer: Buffer;
}) {
  const context = await getAuthenticatedContext();

  if (!context.success) {
    return context;
  }

  if (!input.name?.trim()) {
    return {
      success: false,
      message: "Source document name is required.",
    };
  }

  if (!input.fileName?.trim()) {
    return {
      success: false,
      message: "Source document file name is required.",
    };
  }

  if (!input.fileUrl?.trim()) {
    return {
      success: false,
      message: "Source document file URL is required.",
    };
  }

  if (!input.fileType?.trim()) {
    return {
      success: false,
      message: "Source document file type is required.",
    };
  }

  if (!Buffer.isBuffer(input.fileBuffer)) {
    return {
      success: false,
      message: "Source document file data is invalid.",
    };
  }

  if (input.fileBuffer.length === 0) {
    return {
      success: false,
      message: "Source document file is empty.",
    };
  }

  return AISourceDocumentService.createAndProcess({
    organizationId: context.organizationId,
    branchId: context.branchId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    fileName: input.fileName.trim(),
    fileUrl: input.fileUrl.trim(),
    fileType: input.fileType.trim().toLowerCase(),
    fileSize: input.fileSize ?? input.fileBuffer.length,
    fileBuffer: input.fileBuffer,
    createdById: context.userId,
  });
}

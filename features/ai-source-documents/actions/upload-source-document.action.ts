"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";

import { AISourceDocumentService } from "../services/ai-source-document.service";

const ALLOWED_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ORGANIZATION_ADMIN,
  ROLES.BRANCH_ADMIN,
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadAISourceDocumentAction(input: {
  name: string;
  description?: string | null;
  file: File;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false as const,
      message: "Unauthorized.",
    };
  }

  if (!ALLOWED_ROLES.includes(session.user.role)) {
    return {
      success: false as const,
      message: "You are not allowed to upload AI source documents.",
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

  if (!input.name?.trim()) {
    return {
      success: false as const,
      message: "Source document name is required.",
    };
  }

  if (!(input.file instanceof File)) {
    return {
      success: false as const,
      message: "Please select a PDF file.",
    };
  }

  if (input.file.size === 0) {
    return {
      success: false as const,
      message: "The selected PDF is empty.",
    };
  }

  if (input.file.size > MAX_FILE_SIZE) {
    return {
      success: false as const,
      message: "PDF files must be 10 MB or smaller.",
    };
  }

  const fileName = input.file.name.trim();

  const isPdf =
    input.file.type === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return {
      success: false as const,
      message: "Only PDF source documents are supported.",
    };
  }

  try {
    const arrayBuffer = await input.file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const fileUrl =
      `source://${session.user.organizationId}/` +
      `${session.user.branchId}/` +
      `${crypto.randomUUID()}/${encodeURIComponent(fileName)}`;

    return await AISourceDocumentService.createAndProcess({
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      fileName,
      fileUrl,
      fileType: input.file.type || "application/pdf",
      fileSize: input.file.size,
      fileBuffer,
      createdById: session.user.id,
    });
  } catch (error) {
    console.error("UPLOAD AI SOURCE DOCUMENT ERROR:", error);

    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to process the PDF.",
    };
  }
}

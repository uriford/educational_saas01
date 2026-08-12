"use server";

import { auth } from "@/auth";
import { ROLES } from "@/features/auth/roles";
import { AISourceDocumentService } from "@/features/ai-source-documents/services/ai-source-document.service";

const ALLOWED_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ORGANIZATION_ADMIN,
  ROLES.BRANCH_ADMIN,
];

export async function getAISourceDocumentsAction() {
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
      message: "You are not allowed to access AI source documents.",
    };
  }

  if (!session.user.organizationId || !session.user.branchId) {
    return {
      success: false as const,
      message: "Organization or branch information is missing.",
    };
  }

  try {
    const documents = await AISourceDocumentService.list({
      organizationId: session.user.organizationId,
      branchId: session.user.branchId,
    });

    return {
      success: true as const,
      documents,
    };
  } catch (error) {
    console.error("GET AI SOURCE DOCUMENTS ERROR:", error);

    return {
      success: false as const,
      message: "Failed to load source documents.",
    };
  }
}

import { db } from "@/lib/db";

export type AISourceContextDocument = {
  id: string;
  name: string;
  fileName: string;
  extractedText: string;
  pageCount: number | null;
};

export type AISourceContextResult = {
  documents: AISourceContextDocument[];
  combinedText: string;
};

export class AISourceContextService {
  static async build(data: {
    organizationId: string;
    branchId: string;
    sourceDocumentIds: string[];
  }): Promise<AISourceContextResult> {
    const documentIds = [
      ...new Set(
        data.sourceDocumentIds
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ];

    if (documentIds.length === 0) {
      throw new Error(
        "At least one source document is required.",
      );
    }

    const documents = await db.aISourceDocument.findMany({
      where: {
        id: {
          in: documentIds,
        },
        organizationId: data.organizationId,
        branchId: data.branchId,
        status: "READY",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        fileName: true,
        extractedText: true,
        pageCount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (documents.length !== documentIds.length) {
      const foundIds = new Set(
        documents.map((document) => document.id),
      );

      const missingIds = documentIds.filter(
        (id) => !foundIds.has(id),
      );

      throw new Error(
        `Some source documents are unavailable, not ready, deleted, or do not belong to this organization/branch: ${missingIds.join(", ")}`,
      );
    }

    const validDocuments: AISourceContextDocument[] = documents
      .filter(
        (document) =>
          typeof document.extractedText === "string" &&
          document.extractedText.trim().length > 0,
      )
      .map((document) => ({
        id: document.id,
        name: document.name,
        fileName: document.fileName,
        extractedText: document.extractedText as string,
        pageCount: document.pageCount,
      }));

    if (validDocuments.length !== documents.length) {
      throw new Error(
        "One or more selected source documents do not contain extracted text.",
      );
    }

    const combinedText = validDocuments
      .map(
        (document, index) =>
          [
            `===== SOURCE DOCUMENT ${index + 1} =====`,
            `Document ID: ${document.id}`,
            `Document Name: ${document.name}`,
            `File Name: ${document.fileName}`,
            document.pageCount !== null
              ? `Page Count: ${document.pageCount}`
              : "",
            "",
            document.extractedText.trim(),
            "",
            `===== END SOURCE DOCUMENT ${index + 1} =====`,
          ]
            .filter(Boolean)
            .join("\n"),
      )
      .join("\n\n");

    return {
      documents: validDocuments,
      combinedText,
    };
  }
}

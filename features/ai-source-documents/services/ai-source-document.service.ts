import {
  AISourceDocumentRepository,
} from "../repository/ai-source-document.repository";

import {
  PDFExtractionService,
} from "./pdf-extraction.service";

export class AISourceDocumentService {
  static async createAndProcess(data: {
    organizationId: string;
    branchId: string;
    name: string;
    description?: string | null;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number | null;
    fileBuffer: Buffer;
    createdById?: string | null;
  }) {
    if (
      data.fileType !== "application/pdf" &&
      !data.fileName.toLowerCase().endsWith(".pdf")
    ) {
      throw new Error(
        "Only PDF source documents are supported.",
      );
    }

    const document =
      await AISourceDocumentRepository.create({
        organizationId: data.organizationId,
        branchId: data.branchId,
        name: data.name,
        description: data.description,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        createdById: data.createdById,
      });

    try {
      const extracted =
        await PDFExtractionService.extract(
          data.fileBuffer,
        );

      const ready =
        await AISourceDocumentRepository.markReady(
          document.id,
          extracted.text,
          extracted.pageCount,
        );

      return {
        success: true,
        document: ready,
        extractedText: extracted.text,
        pageCount: extracted.pageCount,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "PDF processing failed.";

      await AISourceDocumentRepository.markFailed(
        document.id,
        message,
      );

      return {
        success: false,
        documentId: document.id,
        message,
      };
    }
  }

  static async getById(data: {
    id: string;
    organizationId: string;
    branchId: string;
  }) {
    return AISourceDocumentRepository.findById(
      data.id,
      data.organizationId,
      data.branchId,
    );
  }

  static async list(data: {
    organizationId: string;
    branchId: string;
  }) {
    return AISourceDocumentRepository.findAll(
      data.organizationId,
      data.branchId,
    );
  }

  static async delete(data: {
    id: string;
    organizationId: string;
    branchId: string;
  }) {
    return AISourceDocumentRepository.softDelete(
      data.id,
      data.organizationId,
      data.branchId,
    );
  }
}

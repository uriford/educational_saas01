import { db } from "@/lib/db";

export class AISourceDocumentRepository {
  static async create(data: {
    organizationId: string;
    branchId: string;
    name: string;
    description?: string | null;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number | null;
    createdById?: string | null;
  }) {
    return db.aISourceDocument.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        name: data.name,
        description: data.description ?? null,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize ?? null,
        createdById: data.createdById ?? null,
        status: "PROCESSING",
      },
    });
  }

  static async markReady(
    id: string,
    extractedText: string,
    pageCount: number,
  ) {
    return db.aISourceDocument.update({
      where: { id },
      data: {
        status: "READY",
        extractedText,
        pageCount,
        processingError: null,
      },
    });
  }

  static async markFailed(
    id: string,
    processingError: string,
  ) {
    return db.aISourceDocument.update({
      where: { id },
      data: {
        status: "FAILED",
        processingError,
      },
    });
  }

  static async findById(
    id: string,
    organizationId: string,
    branchId: string,
  ) {
    return db.aISourceDocument.findFirst({
      where: {
        id,
        organizationId,
        branchId,
        deletedAt: null,
      },
      include: {
        questionGenerations: true,
      },
    });
  }

  static async findAll(
    organizationId: string,
    branchId: string,
  ) {
    return db.aISourceDocument.findMany({
      where: {
        organizationId,
        branchId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async softDelete(
    id: string,
    organizationId: string,
    branchId: string,
  ) {
    return db.aISourceDocument.updateMany({
      where: {
        id,
        organizationId,
        branchId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

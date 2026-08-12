export type AISourceDocumentStatus =
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type ExtractedPDF = {
  text: string;
  pageCount: number;
};

export type CreateAISourceDocumentInput = {
  organizationId: string;
  branchId: string;
  name: string;
  description?: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  createdById?: string | null;
};

import { PDFParse } from "pdf-parse";
import path from "node:path";

export type PDFExtractionPage = {
  pageNumber: number;
  text: string;
};

export type PDFExtractionResult = {
  text: string;
  pageCount: number;
  pages: PDFExtractionPage[];
};

const PDF_WORKER_PATH = path.join(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "legacy",
  "build",
  "pdf.worker.mjs",
);

if (PDFParse.isNodeJS) {
  PDFParse.setWorker(PDF_WORKER_PATH);
}

export class PDFExtractionService {
  static async extract(
    buffer: Buffer,
  ): Promise<PDFExtractionResult> {
    if (!buffer || buffer.length === 0) {
      throw new Error("PDF file is empty.");
    }

    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();

      const text = result.text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      if (!text) {
        throw new Error(
          "No extractable text was found in the PDF.",
        );
      }

      const pages =
        result.pages?.map((page, index) => ({
          pageNumber: index + 1,
          text: page.text
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim(),
        })) ?? [];

      return {
        text,
        pageCount: result.total,
        pages,
      };
    } finally {
      await parser.destroy();
    }
  }
}

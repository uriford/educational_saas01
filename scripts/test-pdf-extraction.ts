import { readFile } from "node:fs/promises";
import { PDFExtractionService } from "../features/ai-source-documents/services/pdf-extraction.service";

const filePath = process.argv[2];

if (!filePath) {
  console.error(
    "Usage: npx tsx scripts/test-pdf-extraction.ts <pdf-path>",
  );
  process.exit(1);
}

async function main() {
  const buffer = await readFile(filePath);

  const result =
    await PDFExtractionService.extract(buffer);

  console.log("\n========== PDF EXTRACTION RESULT ==========\n");
  console.log(`Pages: ${result.pageCount}`);
  console.log(`Characters: ${result.text.length}`);

  console.log("\n========== FIRST 3000 CHARACTERS ==========\n");
  console.log(result.text.slice(0, 3000));

  console.log("\n========== EXTRACTION SUCCESS ==========\n");
}

main().catch((error) => {
  console.error("\n========== EXTRACTION FAILED ==========\n");
  console.error(
    error instanceof Error
      ? error.message
      : error,
  );
  process.exit(1);
});

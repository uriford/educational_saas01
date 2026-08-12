-- CreateTable
CREATE TABLE "AISourceDocumentPage" (
    "id" TEXT NOT NULL,
    "sourceDocumentId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AISourceDocumentPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AISourceDocumentPage_sourceDocumentId_idx" ON "AISourceDocumentPage"("sourceDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "AISourceDocumentPage_sourceDocumentId_pageNumber_key" ON "AISourceDocumentPage"("sourceDocumentId", "pageNumber");

-- AddForeignKey
ALTER TABLE "AISourceDocumentPage" ADD CONSTRAINT "AISourceDocumentPage_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "AISourceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "BranchCreationCredential" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchCreationCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BranchCreationCredential_organizationId_key" ON "BranchCreationCredential"("organizationId");

-- CreateIndex
CREATE INDEX "BranchCreationCredential_organizationId_idx" ON "BranchCreationCredential"("organizationId");

-- AddForeignKey
ALTER TABLE "BranchCreationCredential" ADD CONSTRAINT "BranchCreationCredential_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

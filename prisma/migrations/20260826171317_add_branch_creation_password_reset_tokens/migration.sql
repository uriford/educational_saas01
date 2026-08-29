-- CreateTable
CREATE TABLE "BranchCreationPasswordResetToken" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BranchCreationPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BranchCreationPasswordResetToken_tokenHash_key" ON "BranchCreationPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "BranchCreationPasswordResetToken_organizationId_idx" ON "BranchCreationPasswordResetToken"("organizationId");

-- CreateIndex
CREATE INDEX "BranchCreationPasswordResetToken_userId_idx" ON "BranchCreationPasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "BranchCreationPasswordResetToken_expiresAt_idx" ON "BranchCreationPasswordResetToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "BranchCreationPasswordResetToken" ADD CONSTRAINT "BranchCreationPasswordResetToken_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchCreationPasswordResetToken" ADD CONSTRAINT "BranchCreationPasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "AdmissionRateLimit" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdmissionRateLimit_ipAddress_idx" ON "AdmissionRateLimit"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionRateLimit_ipAddress_action_key" ON "AdmissionRateLimit"("ipAddress", "action");

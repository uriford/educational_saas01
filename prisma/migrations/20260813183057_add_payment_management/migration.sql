-- CreateEnum
CREATE TYPE "PaymentPlanStatus" AS ENUM ('ACTIVE', 'PAID', 'FINALIZED');

-- CreateEnum
CREATE TYPE "PaymentInstallmentStatus" AS ENUM ('UPCOMING', 'DUE', 'OVERDUE', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_BANKING', 'OTHER');

-- CreateTable
CREATE TABLE "PaymentPlan" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "finalizedAt" TIMESTAMP(3),
    "finalizedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInstallment" (
    "id" TEXT NOT NULL,
    "paymentPlanId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "PaymentInstallmentStatus" NOT NULL DEFAULT 'UPCOMING',
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "installmentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "reference" TEXT,
    "notes" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentPlan_enrollmentId_key" ON "PaymentPlan"("enrollmentId");

-- CreateIndex
CREATE INDEX "PaymentPlan_organizationId_idx" ON "PaymentPlan"("organizationId");

-- CreateIndex
CREATE INDEX "PaymentPlan_branchId_idx" ON "PaymentPlan"("branchId");

-- CreateIndex
CREATE INDEX "PaymentPlan_status_idx" ON "PaymentPlan"("status");

-- CreateIndex
CREATE INDEX "PaymentPlan_finalizedAt_idx" ON "PaymentPlan"("finalizedAt");

-- CreateIndex
CREATE INDEX "PaymentInstallment_paymentPlanId_idx" ON "PaymentInstallment"("paymentPlanId");

-- CreateIndex
CREATE INDEX "PaymentInstallment_dueDate_idx" ON "PaymentInstallment"("dueDate");

-- CreateIndex
CREATE INDEX "PaymentInstallment_status_idx" ON "PaymentInstallment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentInstallment_paymentPlanId_installmentNumber_key" ON "PaymentInstallment"("paymentPlanId", "installmentNumber");

-- CreateIndex
CREATE INDEX "PaymentTransaction_installmentId_idx" ON "PaymentTransaction"("installmentId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_paymentDate_idx" ON "PaymentTransaction"("paymentDate");

-- CreateIndex
CREATE INDEX "PaymentTransaction_recordedById_idx" ON "PaymentTransaction"("recordedById");

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentInstallment" ADD CONSTRAINT "PaymentInstallment_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "PaymentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "PaymentInstallment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

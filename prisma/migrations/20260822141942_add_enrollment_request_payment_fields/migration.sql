-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CARD';

-- AlterTable
ALTER TABLE "EnrollmentRequest" ADD COLUMN     "cardHolderName" TEXT,
ADD COLUMN     "cardLastFour" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentNote" TEXT,
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "requestedAmount" DECIMAL(10,2);

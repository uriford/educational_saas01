-- CreateEnum
CREATE TYPE "ChatMessageStatus" AS ENUM ('SENT', 'DELIVERED', 'SEEN');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "seenAt" TIMESTAMP(3),
ADD COLUMN     "status" "ChatMessageStatus" NOT NULL DEFAULT 'SENT';

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "ChatMessage_status_idx" ON "ChatMessage"("status");

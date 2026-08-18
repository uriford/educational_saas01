-- AlterTable
ALTER TABLE "AIEarlyIntervention" ADD COLUMN     "lastNotificationAt" TIMESTAMP(3),
ADD COLUMN     "notificationCount" INTEGER NOT NULL DEFAULT 0;

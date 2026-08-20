/*
  ChatMessage CRUD support.

  Existing messages initialize updatedAt from createdAt.
*/

-- Add the new fields without requiring a value for existing rows.
ALTER TABLE "ChatMessage"
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "editedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Existing messages were never edited, so their last-update
-- timestamp should initially equal their creation timestamp.
UPDATE "ChatMessage"
SET "updatedAt" = "createdAt";

-- From this point forward every message must have updatedAt.
ALTER TABLE "ChatMessage"
ALTER COLUMN "updatedAt" SET NOT NULL;

-- Prisma-managed default for newly inserted messages.
ALTER TABLE "ChatMessage"
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Support efficient filtering of soft-deleted messages.
CREATE INDEX "ChatMessage_deletedAt_idx"
ON "ChatMessage"("deletedAt");

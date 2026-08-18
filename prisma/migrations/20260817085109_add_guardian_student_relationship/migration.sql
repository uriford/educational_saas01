-- Drop the old ChatConversation -> User foreign key
ALTER TABLE "ChatConversation"
DROP CONSTRAINT "ChatConversation_studentId_fkey";

-- Migrate existing conversation references:
-- ChatConversation.studentId previously stored User.id.
-- It now correctly stores Student.id.
UPDATE "ChatConversation" cc
SET "studentId" = s.id
FROM "Student" s
WHERE s."userId" = cc."studentId";

-- Add guardian relationship metadata
ALTER TABLE "GuardianStudent"
ADD COLUMN "relationship" TEXT;

-- Add the corrected ChatConversation -> Student foreign key
ALTER TABLE "ChatConversation"
ADD CONSTRAINT "ChatConversation_studentId_fkey"
FOREIGN KEY ("studentId")
REFERENCES "Student"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

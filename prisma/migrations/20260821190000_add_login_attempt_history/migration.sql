-- Recovered migration for existing LoginAttempt table

CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoginAttempt_identifier_key"
ON "LoginAttempt"("identifier");

CREATE INDEX "LoginAttempt_blockedUntil_idx"
ON "LoginAttempt"("blockedUntil");

-- CreateTable
CREATE TABLE "TeacherIdCounter" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherIdCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherIdCounter_organizationId_key" ON "TeacherIdCounter"("organizationId");

-- AddForeignKey
ALTER TABLE "TeacherIdCounter" ADD CONSTRAINT "TeacherIdCounter_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

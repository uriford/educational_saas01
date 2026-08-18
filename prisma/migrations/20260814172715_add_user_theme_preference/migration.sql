-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "themePreference" "ThemePreference" NOT NULL DEFAULT 'SYSTEM';

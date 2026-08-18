-- Add GUARDIAN role to the existing Role enum.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GUARDIAN';

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ==========================
  // Super Admin
  // ==========================
  const superAdminPassword = await bcrypt.hash("Admin@123", 12);

  await prisma.user.upsert({
    where: {
      email: "superadmin@americancouncil.com",
    },
    update: {},
    create: {
      code: "SUPER-001",
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@americancouncil.com",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  // ==========================
  // Organization
  // ==========================
  const organization = await prisma.organization.upsert({
    where: {
      slug: "american-council",
    },
    update: {},
    create: {
      code: "ORG-001",
      name: "American Council",
      slug: "american-council",
      email: "info@americancouncil.com",
    },
  });

  // ==========================
  // Organization Settings
  // ==========================
  await prisma.organizationSettings.upsert({
    where: {
      organizationId: organization.id,
    },
    update: {},
    create: {
      organizationId: organization.id,
    },
  });

  // ==========================
  // Head Branch
  // ==========================
  const branch = await prisma.branch.upsert({
    where: {
      slug: "head-office",
    },
    update: {},
    create: {
      code: "BR-001",
      name: "Head Office",
      slug: "head-office",
      organizationId: organization.id,
      isHeadquarters: true,
    },
  });

  // ==========================
  // Organization Admin
  // ==========================
  const orgAdminPassword = await bcrypt.hash("Admin@123", 12);

  await prisma.user.upsert({
    where: {
      email: "admin@americancouncil.com",
    },
    update: {},
    create: {
      code: "ADMIN-001",
      firstName: "Organization",
      lastName: "Admin",
      email: "admin@americancouncil.com",
      password: orgAdminPassword,
      role: "ORGANIZATION_ADMIN",
      status: "ACTIVE",
      organizationId: organization.id,
      branchId: branch.id,
      emailVerified: true,
      isBranchManager: true,
    },
  });

  console.log("✅ Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
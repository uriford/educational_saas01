import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const existing = await db.organization.findUnique({
    where: {
      slug: "american-council",
    },
  });

  if (existing) {
    console.log("Organization already exists:", existing.id);
    return;
  }

  const organization = await db.organization.create({
    data: {
      code: "AC-001",
      name: "American Council",
      slug: "american-council",
      status: "ACTIVE",
      hasBranches: false,
    },
  });

  await db.organizationSettings.create({
    data: {
      organizationId: organization.id,
    },
  });

  console.log(
    "Created organization:",
    organization.id
  );
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());

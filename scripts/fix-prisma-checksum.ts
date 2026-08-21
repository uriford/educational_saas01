import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    UPDATE _prisma_migrations
    SET checksum='5602bf8b3521c00d2e423e5dbe9c88a32004441de1481100cad03a748cf02fa0'
    WHERE migration_name='20260820184648_add_service_mode';
  `);

  console.log("CHECKSUM UPDATED");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

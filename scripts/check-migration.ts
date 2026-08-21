import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT migration_name, checksum, finished_at
    FROM _prisma_migrations
    WHERE migration_name='20260820184648_add_service_mode';
  `);

  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

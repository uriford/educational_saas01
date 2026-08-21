import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_name = 'EnrollmentRequest';
  `);

  console.log(result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

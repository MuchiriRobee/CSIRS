import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@tvetsafety.ac.ke" },
    update: {},
    create: {
      email: "admin@tvetsafety.ac.ke",
      password: "$2b$12$placeholderHashForDevOnly1234567890abcdef", // will be properly hashed in Phase 3
      name: "System Administrator",
      role: "ADMIN",
    },
  });

  console.log("✅ Database seeded successfully with admin user");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

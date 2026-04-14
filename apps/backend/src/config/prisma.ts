// PrismaClient with adapter (re-usable)
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import env, { isProd } from "./index.js";

// Single pool for the entire application (best practice)
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Production connection pool tuning
  max: isProd ? 20 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);

// Reusable PrismaClient instance
const prisma = new PrismaClient({
  adapter,
  log:
    env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// Graceful shutdown for production
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  await pool.end();
});

export default prisma;
export { pool }; // for advanced use if needed

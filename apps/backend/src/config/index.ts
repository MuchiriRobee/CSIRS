import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters (add in Phase 3)"),
  MAILERSEND_API_KEY: z.string().optional(), // for Phase 4 notifications
});

const env = envSchema.parse(process.env);

export default env;

export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";

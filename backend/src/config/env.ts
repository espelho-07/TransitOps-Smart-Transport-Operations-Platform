import dotenv from "dotenv";
import { z } from "zod";
import path from "path";

// Load dotenv
dotenv.config({ path: path.join(__dirname, "../../.env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().default("mongodb://127.0.0.1:27017/TransitOps"),
  JWT_SECRET: z.string().default("transitops_super_secret_jwt_key"),
  JWT_REFRESH_SECRET: z.string().default("transitops_super_secret_refresh_key"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

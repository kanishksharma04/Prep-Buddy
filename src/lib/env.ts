import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (pooled Neon connection string)"),
  DATABASE_URL_UNPOOLED: z
    .string()
    .min(1, "DATABASE_URL_UNPOOLED is required (direct Neon connection string, for migrations)"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required (generate with: npx auth secret)"),
});

// Coerce missing vars to "" first — otherwise Zod's base type check fails on
// `undefined` before the .min(1, "...") message ever gets a chance to run,
// so a genuinely unset var reports "expected string, received undefined"
// instead of our actual message.
const rawEnv = Object.fromEntries(
  Object.keys(envSchema.shape).map((key) => [key, process.env[key] ?? ""]),
);

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `  - ${issue.message}`).join("\n");
  throw new Error(
    `Invalid environment configuration:\n${problems}\n\nCheck .env.local against .env.example, or run \`vercel env pull .env.local\`.`,
  );
}

export const env = parsed.data;

import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Match Next.js's env file precedence: .env first, then .env.local
// overriding it, so a single .env.local (see .env.example) is all
// both `next dev` and the Prisma CLI need.
config({ path: ".env" });
config({ path: ".env.local", override: true });

// Migrate/introspect/studio need a direct (unpooled) connection — Neon's
// pooled connection string doesn't support the session features Prisma
// Migrate relies on. Runtime queries use DATABASE_URL via the Neon driver
// adapter instead, see src/lib/db.ts. DATABASE_URL_UNPOOLED is the name
// the Vercel Neon integration provisions this as (`vercel env pull`).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL_UNPOOLED"],
  },
});

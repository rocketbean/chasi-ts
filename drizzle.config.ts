import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/container/drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.PG_URL!,
  },
});

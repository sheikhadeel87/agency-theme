/**
 * One-time seed: creates default admin if collection is empty.
 * Set ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD in .env or rely on dev defaults below.
 * Run: npm run seed:admin
 */

import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { AdminUser } from "../src/models/AdminUser";

loadEnvConfig(process.cwd());

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri?.trim()) {
    console.error("Missing MONGODB_URI. Set it in .env.local or .env.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const existing = await AdminUser.countDocuments();
  if (existing > 0) {
    console.log("Admin user(s) already exist — seed skipped.");
    await mongoose.disconnect();
    return;
  }

  const name = process.env.ADMIN_SEED_NAME?.trim() || "Admin";
  const email = process.env.ADMIN_SEED_EMAIL?.trim() || "admin@test.com";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "admin123";

  if (!name || !email || !password) {
    console.error("ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, and ADMIN_SEED_PASSWORD must be non-empty.");
    process.exit(1);
  }

  // Plain password is hashed by AdminUser pre-save middleware before insert.
  await AdminUser.create({
    name,
    email,
    password,
    isActive: true,
  });

  console.log(`Created admin: ${email} (name: ${name}; password stored hashed)`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

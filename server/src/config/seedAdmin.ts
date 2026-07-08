// Ensures an initial admin account exists. Runs once at startup: if no admin
// is present, one is created from ADMIN_EMAIL / ADMIN_PASSWORD. There is no
// public registration, so this is how the very first account gets in.
import { config } from "./index.js";
import { User } from "../models/User.js";

export async function seedAdmin(): Promise<void> {
  if (await User.exists({ role: "admin" })) return;

  await User.create({
    email: config.adminEmail.toLowerCase().trim(),
    passwordHash: await User.hashPassword(config.adminPassword),
    role: "admin",
    // The seeded admin should change the default password on first login.
    mustChangePassword: true,
  });

  console.log(`✅ İlk admin oluşturuldu: ${config.adminEmail}`);
}

import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";

/** Result of a successful DB login check (no session — use only when wiring auth later). */
export type AdminDbUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

/**
 * Validates credentials against `admins` collection.
 * Does not replace env-based login; call from login flow only when you integrate it.
 */
export async function validateAdminDbLogin(
  email: string,
  password: string
): Promise<AdminDbUser | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;

  await dbConnect();
  const doc = await AdminUser.findOne({ email: normalized }).lean();
  if (!doc) return null;
  if (doc.isActive === false) return null;

  const match = await bcrypt.compare(password, doc.password);
  if (!match) return null;

  const raw = doc as {
    _id: unknown;
    email: string;
    name?: string;
    role?: unknown;
  };

  const out: AdminDbUser = {
    id: String(raw._id),
    email: raw.email,
    name: raw.name?.trim() ?? "",
  };
  if (typeof raw.role === "string" && raw.role.trim() !== "") {
    out.role = raw.role.trim();
  }
  return out;
}

"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import { AdminUser } from "@/models/AdminUser";

export type CreateAdminUserState = { success?: boolean; error?: string };

const MIN_PASSWORD_LEN = 8;

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

export async function createAdminUser(formData: FormData): Promise<CreateAdminUserState> {
  try {
    await requireAdminSession();
  } catch {
    return { error: "Unauthorized." };
  }

  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const password = formData.get("password")?.toString() ?? "";

  if (!name) return { error: "Name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Valid email is required." };
  }
  if (password.length < MIN_PASSWORD_LEN) {
    return { error: `Password must be at least ${MIN_PASSWORD_LEN} characters.` };
  }

  try {
    await dbConnect();
    await AdminUser.create({
      name,
      email,
      password,
      isActive: true,
    });
  } catch (e: unknown) {
    const code =
      e && typeof e === "object" && "code" in e ? (e as { code?: number }).code : undefined;
    if (code === 11000) {
      return { error: "An admin with this email already exists." };
    }
    console.error("createAdminUser:", e);
    return { error: "Could not create admin." };
  }

  try {
    revalidatePath("/admin/admins");
  } catch {
    /* ignore */
  }

  await recordAdminAudit({
    action: "CREATE_ADMIN",
    resource: "admin-user",
    metadata: { email, name },
  });

  return { success: true };
}

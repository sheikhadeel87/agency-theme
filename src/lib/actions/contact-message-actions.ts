"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin";
import {
  ContactMessage,
  type ContactMessageStatus,
  CONTACT_MESSAGE_STATUSES,
} from "@/models/ContactMessage";

export type ContactMessageActionState = { success?: boolean; error?: string };

/** Sidebar badge (status `new`); 0 if not logged in. */
export async function getNewContactMessageCountAction(): Promise<number> {
  try {
    await requireAdminSession();
    await dbConnect();
    return ContactMessage.countDocuments({ status: "new" });
  } catch {
    return 0;
  }
}

function isValidId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function deleteContactMessage(id: string): Promise<ContactMessageActionState> {
  try {
    await requireAdminSession();
    if (!isValidId(id)) return { error: "Invalid message id." };
    await dbConnect();
    const res = await ContactMessage.findByIdAndDelete(id);
    if (!res) return { error: "Message not found." };
    revalidatePath("/admin/contact-messages");
    revalidatePath("/admin", "layout");
    await recordAdminAudit({
      action: "DELETE_CONTACT_MESSAGE",
      resource: "contact-message",
      resourceId: id,
    });
    return { success: true };
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return { error: "Unauthorized." };
    }
    console.error("deleteContactMessage:", e);
    return { error: "Failed to delete message." };
  }
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessageStatus
): Promise<ContactMessageActionState> {
  try {
    await requireAdminSession();
    if (!isValidId(id)) return { error: "Invalid message id." };
    if (!CONTACT_MESSAGE_STATUSES.includes(status)) {
      return { error: "Invalid status." };
    }
    await dbConnect();
    const res = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!res) return { error: "Message not found." };
    revalidatePath("/admin/contact-messages");
    revalidatePath("/admin", "layout");
    await recordAdminAudit({
      action: "UPDATE_CONTACT_MESSAGE_STATUS",
      resource: "contact-message",
      resourceId: id,
      metadata: { status },
    });
    return { success: true };
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return { error: "Unauthorized." };
    }
    console.error("updateContactMessageStatus:", e);
    return { error: "Failed to update status." };
  }
}

export async function markContactMessageRead(id: string): Promise<ContactMessageActionState> {
  return updateContactMessageStatus(id, "read");
}

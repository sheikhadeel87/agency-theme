"use server";

import { dbConnect } from "@/lib/db";
import { Service } from "@/models/Service";
import type { ServiceStatus } from "@/models/Service";

export type CreateServiceState = {
  success?: boolean;
  error?: string;
};

export async function createService(formData: FormData): Promise<CreateServiceState> {
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() ?? "";
  const status = (formData.get("status")?.toString() ?? "Draft") as ServiceStatus;

  if (!title) {
    return { error: "Title is required." };
  }

  const validStatuses: ServiceStatus[] = ["Draft", "Published"];
  if (!validStatuses.includes(status)) {
    return { error: "Invalid status." };
  }

  try {
    await dbConnect();
    await Service.create({ title, description, status });
    return { success: true };
  } catch (e) {
    console.error("createService error:", e);
    return { error: e instanceof Error ? e.message : "Failed to create service." };
  }
}

import { dbConnect } from "@/lib/db";
import { ContactMessage, type ContactMessageStatus } from "@/models/ContactMessage";

export type ContactMessageListItem = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(opts: {
  q?: string;
  status?: string;
}): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  const st = opts.status?.trim();
  if (st && st !== "all" && (st === "new" || st === "read" || st === "replied")) {
    filter.status = st;
  }
  const q = opts.q?.trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ fullName: rx }, { email: rx }, { subject: rx }];
  }
  return filter;
}

function mapDoc(d: Record<string, unknown>): ContactMessageListItem {
  const created = d.createdAt;
  const createdAt =
    created instanceof Date
      ? created.toISOString()
      : typeof created === "string"
        ? created
        : new Date().toISOString();
  return {
    _id: String(d._id),
    fullName: String(d.fullName ?? ""),
    email: String(d.email ?? ""),
    phone: String(d.phone ?? ""),
    subject: String(d.subject ?? ""),
    message: String(d.message ?? ""),
    status: (d.status as ContactMessageStatus) || "new",
    createdAt,
  };
}

export async function getContactMessagesPaginated(opts: {
  page: number;
  limit: number;
  q?: string;
  status?: string;
}): Promise<{
  items: ContactMessageListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  await dbConnect();
  const { page, limit } = opts;
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const filter = buildFilter(opts);

  const [total, docs] = await Promise.all([
    ContactMessage.countDocuments(filter),
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
  ]);

  const items = (docs as Record<string, unknown>[]).map(mapDoc);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}

export async function getContactMessageById(
  id: string
): Promise<ContactMessageListItem | null> {
  await dbConnect();
  if (!id || !/^[a-f\d]{24}$/i.test(id)) return null;
  const d = await ContactMessage.findById(id).lean();
  if (!d) return null;
  return mapDoc(d as Record<string, unknown>);
}

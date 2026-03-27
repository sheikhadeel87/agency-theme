import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let event = "";
  try {
    const body = (await request.json()) as { event?: unknown };
    if (typeof body?.event === "string") event = body.event.trim().slice(0, 64);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!event) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    await dbConnect();
    await AnalyticsEvent.create({ name: event });
  } catch (e) {
    console.error("track-event:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

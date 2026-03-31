import { NextResponse } from "next/server";
import { checkNewsletterSubscription } from "@/controllers/newsletter-controller";

export const dynamic = "force-dynamic";

/** GET /api/newsletter/check?email=user@example.com */
export async function GET(request: Request) {
  const result = await checkNewsletterSubscription(request);
  return NextResponse.json(result.body, { status: result.status });
}

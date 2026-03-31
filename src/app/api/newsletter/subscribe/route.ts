import { NextResponse } from "next/server";
import { subscribeNewsletter } from "@/controllers/newsletter-controller";

export const dynamic = "force-dynamic";

/**
 * POST /api/newsletter/subscribe
 * Body: { "email": "user@example.com" }
 *
 * Example:
 * curl -X POST http://localhost:3000/api/newsletter/subscribe \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"user@example.com"}'
 */
export async function POST(request: Request) {
  const result = await subscribeNewsletter(request);
  return NextResponse.json(result.body, { status: result.status });
}

import { NextRequest } from "next/server";
import type { AuditResult } from "@/lib/audit";
import { generateFullRoast } from "@/lib/roast-providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let audit: AuditResult;
  let countToday = 1;
  try {
    const body = await req.json();
    audit = body?.audit || body;
    if (typeof body?.countToday === "number") countToday = body.countToday;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!audit?.url || !Array.isArray(audit.checks)) {
    return new Response("Missing audit payload", { status: 400 });
  }

  const imageB64 = audit.screenshots?.desktop || undefined;

  const result = await generateFullRoast(audit, imageB64, countToday);

  return new Response(result.text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Source": result.source,
      "Cache-Control": "no-store",
    },
  });
}

import { NextRequest } from "next/server";
import { generatePdf } from "@/lib/pdf";
import type { AuditResult } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let payload: { audit: AuditResult; roast: string };
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!payload?.audit?.url) {
    return new Response("Missing audit", { status: 400 });
  }

  try {
    const buf = await generatePdf(payload.audit, payload.roast || "");
    const host = new URL(payload.audit.url).host.replace(/[^a-z0-9.-]/gi, "_");
    return new Response(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="roastmysite-${host}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "pdf failed";
    return new Response("PDF generation failed: " + msg, { status: 500 });
  }
}

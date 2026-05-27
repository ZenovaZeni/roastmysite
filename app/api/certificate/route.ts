import { NextRequest } from "next/server";
import type { AuditResult } from "@/lib/audit";
import { generateCertificate } from "@/lib/certificate-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let audit: AuditResult;
  try {
    const body = await req.json();
    audit = body?.audit || body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!audit?.url) {
    return new Response("Missing audit", { status: 400 });
  }

  // Certificate is reserved for sites with a real A grade
  if (audit.score < 80 || audit.grade !== "A") {
    return new Response(
      "Certificates are reserved for sites scoring A (80+). Yours scored " +
        audit.score +
        ". Fix things first.",
      { status: 403 }
    );
  }

  try {
    const buf = await generateCertificate(audit);
    const host = new URL(audit.url).hostname.replace(/[^a-z0-9.-]/gi, "_");
    return new Response(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rms-certificate-${host}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Certificate failed";
    return new Response(msg, { status: 500 });
  }
}

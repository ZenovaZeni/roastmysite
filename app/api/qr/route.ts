import { NextRequest } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");
  const size = Math.min(800, Math.max(64, Number(searchParams.get("size") || "200")));
  const dark = searchParams.get("dark") !== "0";

  if (!data) {
    return new Response("Missing ?data= parameter", { status: 400 });
  }

  try {
    const svg = await QRCode.toString(data, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      width: size,
      color: dark
        ? { dark: "#F5F1EC", light: "#0a0908" }
        : { dark: "#0a0908", light: "#FFFFFF" },
    });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "QR failed";
    return new Response(`QR generation failed: ${msg}`, { status: 500 });
  }
}

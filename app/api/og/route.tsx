import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// 1200x630 = the standard og:image canvas (X large card, FB, LinkedIn, iMessage)
const WIDTH = 1200;
const HEIGHT = 630;

function gradeColor(grade: string): string {
  switch (grade?.toUpperCase()) {
    case "A":
      return "#22c55e";
    case "B":
      return "#84cc16";
    case "C":
      return "#eab308";
    case "D":
      return "#f97316";
    case "F":
      return "#ef4444";
    default:
      return "#a1a1aa";
  }
}

function vibeFor(score: number, grade: string): string {
  if (score >= 80) return "Top-tier. This is what good looks like.";
  if (score >= 65) return "Solid foundation, a few polish jobs from premium.";
  if (score >= 50) return "Functional but forgettable. Leaking revenue daily.";
  if (score >= 35) return "Hemorrhaging customers. Visible from space.";
  if (score >= 20) return "Yikes. Driving people to your competitors.";
  return "Burn it down. Start over. Today.";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const url = searchParams.get("url") || "";
  const scoreParam = searchParams.get("score");
  const gradeParam = searchParams.get("grade") || "";

  const hasResult = !!url && scoreParam !== null;
  const score = Math.max(0, Math.min(100, Number(scoreParam) || 0));
  const grade = gradeParam || (score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "D" : "F");
  const accent = gradeColor(grade);

  let hostname = url;
  try {
    if (url) hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    // fall through
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          background: "#0A0908",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          color: "#F5F1EC",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif',
          position: "relative",
        }}
      >
        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: WIDTH / 2 - 400,
            width: 800,
            height: 600,
            background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #F97316, #DC2626)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 900,
              color: "#0A0908",
            }}
          >
            R
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -0.4,
              display: "flex",
            }}
          >
            Roast<span style={{ color: "#FB923C" }}>My</span>Site
          </div>
        </div>

        {hasResult ? (
          // SCORE CARD
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: "#A1A1AA",
                marginBottom: 12,
                display: "flex",
              }}
            >
              {hostname} scored
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontSize: 220,
                  fontWeight: 900,
                  color: accent,
                  lineHeight: 1,
                  letterSpacing: -8,
                  display: "flex",
                }}
              >
                {score}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  paddingBottom: 28,
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    color: "#A1A1AA",
                    fontWeight: 600,
                    display: "flex",
                  }}
                >
                  / 100
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: accent,
                    fontWeight: 700,
                    background: `${accent}22`,
                    border: `2px solid ${accent}55`,
                    padding: "6px 14px",
                    borderRadius: 8,
                    letterSpacing: 2,
                    display: "flex",
                  }}
                >
                  GRADE {grade.toUpperCase()}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: "#F5F1EC",
                maxWidth: 900,
                lineHeight: 1.25,
                display: "flex",
              }}
            >
              {vibeFor(score, grade)}
            </div>
          </div>
        ) : (
          // DEFAULT CARD (no audit data)
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -3,
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ display: "flex" }}>Your website is</span>
              <span
                style={{
                  background: "linear-gradient(135deg, #FDBA74, #F97316, #DC2626)",
                  backgroundClip: "text",
                  color: "transparent",
                  display: "flex",
                }}
              >
                costing you customers.
              </span>
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#A1A1AA",
                maxWidth: 900,
                display: "flex",
              }}
            >
              Brutally honest website audits, free. Real Lighthouse +
              vision-AI roast + premium PDF.
            </div>
          </div>
        )}

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            color: "#71717A",
            fontSize: 18,
          }}
        >
          <div style={{ display: "flex" }}>
            {hasResult ? "Run your own audit · free" : "Drop a URL. 30 seconds. Free."}
          </div>
          <div style={{ display: "flex", color: "#FB923C", fontWeight: 600 }}>
            roastmysite.dev
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}

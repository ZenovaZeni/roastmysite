/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { AuditResult } from "./audit";
import { buildActionChecklist, estimateCarbon } from "./extras-derived";
import { BRAND } from "./brand";

const colors = {
  bg: "#0A0908",
  card: "#16110E",
  border: "#3F2C1F",
  text: "#F5F1EC",
  textDim: "#A8A29E",
  textMute: "#78716C",
  ember: "#F97316",
  emberDim: "#EA580C",
  green: "#22C55E",
  amber: "#EAB308",
  red: "#EF4444",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    color: colors.text,
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 16,
    marginBottom: 22,
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.ember,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 9,
    color: colors.textMute,
    marginTop: 2,
  },
  hostname: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.text,
  },
  date: {
    fontSize: 8,
    color: colors.textMute,
    marginTop: 2,
    textAlign: "right",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 22,
  },
  scoreBox: {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 16,
    width: 130,
    alignItems: "center",
  },
  scoreNum: {
    fontSize: 36,
    fontWeight: 700,
    color: colors.ember,
    fontFamily: "Helvetica-Bold",
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.textMute,
    marginTop: 2,
    letterSpacing: 1,
  },
  gradeBadge: {
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 9,
    fontWeight: 700,
    fontFamily: "Helvetica-Bold",
  },
  verdictBox: {
    flex: 1,
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
  },
  verdictLabel: {
    fontSize: 8,
    color: colors.textMute,
    letterSpacing: 1,
    marginBottom: 4,
  },
  verdict: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1.35,
  },
  statsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 7,
    color: colors.textMute,
    letterSpacing: 1,
  },
  statVal: {
    fontSize: 11,
    color: colors.text,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.text,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    marginTop: 14,
  },
  screenshot: {
    width: "100%",
    height: 240,
    objectFit: "cover",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
  },
  shotCaption: {
    fontSize: 8,
    color: colors.textMute,
    textAlign: "center",
    marginTop: 4,
  },
  evidenceNote: {
    backgroundColor: "#231A12",
    border: `1px solid ${colors.amber}`,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  evidenceNoteText: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.45,
  },
  roastBox: {
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  roastLabel: {
    fontSize: 9,
    color: colors.ember,
    letterSpacing: 1.2,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  roastPara: {
    fontSize: 10,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  checkRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottom: `1px solid ${colors.border}`,
    gap: 8,
    alignItems: "flex-start",
  },
  checkStatus: {
    width: 38,
    fontSize: 7,
    letterSpacing: 1,
    fontFamily: "Helvetica-Bold",
    paddingTop: 1,
  },
  checkLabel: {
    width: 130,
    fontSize: 9,
    color: colors.text,
    fontFamily: "Helvetica-Bold",
    paddingTop: 1,
  },
  checkDetail: {
    fontSize: 9,
    color: colors.textDim,
    lineHeight: 1.4,
  },
  fixBox: {
    backgroundColor: "#1A1410",
    borderLeft: `2px solid ${colors.ember}`,
    padding: 8,
    marginTop: 6,
    fontSize: 8,
    color: colors.text,
    lineHeight: 1.45,
  },
  metaRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottom: `1px solid ${colors.border}`,
  },
  metaKey: {
    width: 130,
    fontSize: 8,
    color: colors.textMute,
  },
  metaVal: {
    flex: 1,
    fontSize: 8,
    color: colors.text,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: colors.textMute,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 6,
  },
  ctaBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: colors.card,
    borderLeft: `3px solid ${colors.ember}`,
    borderRadius: 4,
  },
  ctaHead: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
  },
  ctaBody: {
    fontSize: 9,
    color: colors.textDim,
    marginTop: 3,
  },
});

function gradeColor(g: string): string {
  if (g === "A") return colors.green;
  if (g === "B") return "#84CC16";
  if (g === "C") return colors.amber;
  if (g === "D") return "#F97316";
  return colors.red;
}

function statusColor(s: string): string {
  if (s === "pass") return colors.green;
  if (s === "warn") return colors.amber;
  return colors.red;
}

export function buildReport(audit: AuditResult, roast: string) {
  const host = (() => {
    try {
      return new URL(audit.url).host;
    } catch {
      return audit.url;
    }
  })();
  const fetched = new Date(audit.fetchedAt).toLocaleString();
  const gColor = gradeColor(audit.grade);
  const hasScreenshots = !!audit.screenshots?.desktop;
  const hasLighthouse = !!audit.lighthouse;
  const htmlOnly = !hasScreenshots && !hasLighthouse;
  const missingEvidence =
    !hasScreenshots && !hasLighthouse
      ? "screenshots, visual evidence, and Lighthouse/Core Web Vitals were"
      : !hasScreenshots
      ? "screenshots and visual evidence were"
      : !hasLighthouse
      ? "Lighthouse/Core Web Vitals was"
      : "";
  const paragraphs = roast
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Document
      title={`RoastMySite Audit — ${host}`}
      author="RoastMySite"
      subject={`Audit report for ${host}`}
    >
      {/* PAGE 1 — Cover + Score + Verdict + Screenshot */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>RoastMySite</Text>
            <Text style={styles.brandSub}>Brutally honest website audit</Text>
          </View>
          <View>
            <Text style={styles.hostname}>{host}</Text>
            <Text style={styles.date}>{fetched}</Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={{ ...styles.scoreNum, color: gColor }}>{audit.score}</Text>
            <Text style={styles.scoreLabel}>OUT OF 100</Text>
            <Text
              style={{
                ...styles.gradeBadge,
                backgroundColor: gColor + "22",
                color: gColor,
                borderRadius: 8,
              }}
            >
              GRADE {audit.grade}
            </Text>
          </View>
          <View style={styles.verdictBox}>
            <Text style={styles.verdictLabel}>THE VERDICT</Text>
            <Text style={styles.verdict}>{audit.vibe}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>LOAD TIME</Text>
                <Text style={styles.statVal}>{audit.loadMs} ms</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>HTML SIZE</Text>
                <Text style={styles.statVal}>
                  {(audit.bytes / 1024).toFixed(0)} KB
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>WORDS</Text>
                <Text style={styles.statVal}>{audit.meta.wordCount}</Text>
              </View>
            </View>
          </View>
        </View>

        {audit.lighthouse && (
          <View>
            <Text style={styles.sectionHeading}>Google Lighthouse — desktop</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {[
                { label: "Performance", value: audit.lighthouse.scores.performance },
                { label: "Accessibility", value: audit.lighthouse.scores.accessibility },
                { label: "Best Practices", value: audit.lighthouse.scores.bestPractices },
                { label: "SEO", value: audit.lighthouse.scores.seo },
              ].map((c) => {
                const v = c.value ?? 0;
                const col = v >= 90 ? colors.green : v >= 50 ? colors.amber : colors.red;
                return (
                  <View
                    key={c.label}
                    style={{
                      flex: 1,
                      backgroundColor: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                      padding: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontFamily: "Helvetica-Bold",
                        color: col,
                      }}
                    >
                      {c.value ?? "—"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 7,
                        color: colors.textMute,
                        letterSpacing: 1,
                        marginTop: 2,
                      }}
                    >
                      {c.label.toUpperCase()}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
              {[
                {
                  label: "LCP",
                  value:
                    audit.lighthouse.vitals.lcp !== null
                      ? `${(audit.lighthouse.vitals.lcp / 1000).toFixed(2)}s`
                      : "—",
                },
                {
                  label: "CLS",
                  value:
                    audit.lighthouse.vitals.cls !== null
                      ? audit.lighthouse.vitals.cls.toFixed(3)
                      : "—",
                },
                {
                  label: "TBT",
                  value:
                    audit.lighthouse.vitals.tbt !== null
                      ? `${audit.lighthouse.vitals.tbt}ms`
                      : "—",
                },
              ].map((v) => (
                <View
                  key={v.label}
                  style={{
                    flex: 1,
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  <Text style={{ fontSize: 7, color: colors.textMute, letterSpacing: 1 }}>
                    {v.label}
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: colors.text }}>
                    {v.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {audit.screenshots?.desktop && (
          <View>
            <Text style={styles.sectionHeading}>What we actually saw</Text>
            <Image
              style={styles.screenshot}
              src={`data:image/jpeg;base64,${audit.screenshots.desktop}`}
            />
            <Text style={styles.shotCaption}>
              Desktop above-the-fold · {audit.screenshots.desktopWidth} × {audit.screenshots.desktopHeight} · captured live
            </Text>
          </View>
        )}

        {missingEvidence && (
          <View style={styles.evidenceNote}>
            <Text style={styles.evidenceNoteText}>
              Partial scan: the HTML loaded and was analyzed, but {missingEvidence} unavailable.
              {htmlOnly
                ? " This HTML-only score is capped at 64."
                : !hasLighthouse
                ? " The score is capped below A until Lighthouse data is available."
                : " The score is capped while visual evidence is unavailable."}
            </Text>
          </View>
        )}

        {paragraphs.length > 0 && (
          <View style={styles.roastBox} wrap={false}>
            <Text style={styles.roastLabel}>
              {hasScreenshots ? "THE ROAST · VISUAL + DATA" : "THE ROAST · DATA ONLY"}
            </Text>
            {paragraphs.slice(0, 1).map((p, i) => (
              <Text key={i} style={styles.roastPara}>
                {p}
              </Text>
            ))}
          </View>
        )}

        <Footer />
      </Page>

      {/* PAGE — Visual evidence (homepage hero + per-page strip) */}
      {audit.screenshots?.desktopFull && (() => {
        const extraPages = (audit.pages || []).filter((p) => p.ok && p.screenshot);
        const stripPages = extraPages.slice(0, 4); // up to 4 extras inline
        const overflowPages = extraPages.slice(4); // any more get a follow-up page

        return (
          <>
            <Page size="LETTER" style={styles.page}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.brand}>Visual evidence</Text>
                  <Text style={styles.brandSub}>
                    {stripPages.length > 0
                      ? `Homepage + ${stripPages.length} more page${stripPages.length !== 1 ? "s" : ""}, all captured live`
                      : "Homepage, full scroll, captured live"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.hostname}>{host}</Text>
                  <Text style={styles.date}>{fetched}</Text>
                </View>
              </View>

              {/* Homepage hero — desktop + mobile, side by side */}
              <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start", marginTop: 4 }}>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: colors.ember,
                        letterSpacing: 1.5,
                        fontFamily: "Helvetica-Bold",
                      }}
                    >
                      HOMEPAGE · DESKTOP
                    </Text>
                    <Text style={{ fontSize: 7, color: colors.textMute }}>
                      {audit.screenshots.desktopWidth}×{audit.screenshots.desktopFullHeight}
                    </Text>
                  </View>
                  <Image
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      objectFit: "cover",
                      maxHeight: stripPages.length > 0 ? 380 : 580,
                    }}
                    src={`data:image/jpeg;base64,${audit.screenshots.desktopFull}`}
                  />
                </View>
                <View style={{ width: 150 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: colors.ember,
                        letterSpacing: 1.5,
                        fontFamily: "Helvetica-Bold",
                      }}
                    >
                      MOBILE
                    </Text>
                    <Text style={{ fontSize: 7, color: colors.textMute }}>
                      {audit.screenshots.mobileWidth}
                    </Text>
                  </View>
                  <Image
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: `1px solid ${colors.border}`,
                      objectFit: "cover",
                      maxHeight: stripPages.length > 0 ? 380 : 580,
                    }}
                    src={`data:image/jpeg;base64,${audit.screenshots.mobileFull}`}
                  />
                </View>
              </View>

              {/* Per-page strip — only if we have extras */}
              {stripPages.length > 0 && (
                <View style={{ marginTop: 18 }}>
                  <Text
                    style={{
                      fontSize: 9,
                      color: colors.ember,
                      letterSpacing: 1.5,
                      fontFamily: "Helvetica-Bold",
                      marginBottom: 8,
                    }}
                  >
                    OTHER PAGES WE SCANNED
                  </Text>
                  <PageStrip pages={stripPages} />
                </View>
              )}

              <Text
                style={{
                  fontSize: 8,
                  color: colors.textMute,
                  textAlign: "center",
                  marginTop: 14,
                  fontStyle: "italic",
                }}
              >
                Captured by a real headless Chromium at {new Date(audit.screenshots.capturedAt).toLocaleTimeString()}.
              </Text>

              <Footer />
            </Page>

            {/* Overflow page only when 5+ extras */}
            {overflowPages.length > 0 && (
              <Page size="LETTER" style={styles.page}>
                <View style={styles.header}>
                  <View>
                    <Text style={styles.brand}>More pages</Text>
                    <Text style={styles.brandSub}>
                      Continued from the previous page
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.hostname}>{host}</Text>
                    <Text style={styles.date}>{fetched}</Text>
                  </View>
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingVertical: 8,
                  }}
                >
                  <PageGrid pages={overflowPages} />
                </View>

                <Footer />
              </Page>
            )}
          </>
        );
      })()}

      {/* PAGE 2 — Full Roast + Tech Stack */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>The full roast</Text>
            <Text style={styles.brandSub}>
              {hasScreenshots
                ? "Written from the live screenshot and audit data"
                : "Written from HTML audit data; screenshot unavailable"}
            </Text>
          </View>
          <View>
            <Text style={styles.hostname}>{host}</Text>
            <Text style={styles.date}>{fetched}</Text>
          </View>
        </View>

        <View style={styles.roastBox}>
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.roastPara}>
              {p}
            </Text>
          ))}
        </View>

        {audit.techStack && (
          <View>
            <Text style={styles.sectionHeading}>Tech stack detected</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>CMS</Text>
              <Text style={styles.metaVal}>{audit.techStack.cms || "—"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Builder</Text>
              <Text style={styles.metaVal}>{audit.techStack.builder || "—"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Platform</Text>
              <Text style={styles.metaVal}>{audit.techStack.platform || "—"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>E-commerce</Text>
              <Text style={styles.metaVal}>{audit.techStack.ecommerce || "—"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Analytics</Text>
              <Text style={styles.metaVal}>
                {audit.techStack.analytics.join(", ") || "none detected"}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Fonts</Text>
              <Text style={styles.metaVal}>
                {audit.techStack.fonts.join(", ") || "—"}
              </Text>
            </View>
          </View>
        )}

        {audit.wayback?.firstSnapshot && (
          <View>
            <Text style={styles.sectionHeading}>Wayback Machine</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>First snapshot</Text>
              <Text style={styles.metaVal}>
                {audit.wayback.firstSnapshot?.slice(0, 10) || "—"}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Last snapshot</Text>
              <Text style={styles.metaVal}>
                {audit.wayback.lastSnapshot?.slice(0, 10) || "—"}
                {audit.wayback.daysSinceLastSnapshot !== null &&
                  ` (${audit.wayback.daysSinceLastSnapshot} days ago)`}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.ctaBox}>
          <Text style={styles.ctaHead}>Want this fixed by a pro?</Text>
          <Text style={styles.ctaBody}>
            Lead Flow handles exactly what this audit just exposed for local
            service businesses in Brevard County, FL. Flat-rate, no monthly
            contracts, done in 7 days or your money back. Email
            officialzenovaai@gmail.com with your score to book a free
            walk-through.
          </Text>
        </View>

        <Footer />
      </Page>

      {/* PAGE — Action Checklist (the takeaway) */}
      <ActionChecklistPage audit={audit} host={host} fetched={fetched} />

      {/* PAGE — Full check breakdown */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>The breakdown</Text>
            <Text style={styles.brandSub}>
              Every check, every result, every fix.
            </Text>
          </View>
          <View>
            <Text style={styles.hostname}>{host}</Text>
            <Text style={styles.date}>{fetched}</Text>
          </View>
        </View>

        {audit.checks.map((c) => (
          <View key={c.id} style={styles.checkRow} wrap={true}>
            <Text style={{ ...styles.checkStatus, color: statusColor(c.status) }}>
              {c.status.toUpperCase()}
            </Text>
            <Text style={styles.checkLabel}>{c.label}</Text>
            <View style={{ flex: 1, flexShrink: 1, minWidth: 0 }}>
              <Text style={styles.checkDetail}>{c.detail}</Text>
              {c.fixHint && (
                <Text style={styles.fixBox}>
                  <Text style={{ color: colors.ember, fontFamily: "Helvetica-Bold" }}>FIX:</Text>{" "}
                  {c.fixHint}
                </Text>
              )}
            </View>
          </View>
        ))}

        <Footer />
      </Page>
    </Document>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>Generated by RoastMySite · Local AI · Nothing logged</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

type PageGridItem = {
  url: string;
  pageType: string;
  score: number;
  screenshot: string | null;
  topIssues: string[];
  loadMs: number;
  wordCount: number;
};

const PAGE_TYPE_LABEL: Record<string, string> = {
  homepage: "Home",
  pricing: "Pricing",
  about: "About",
  contact: "Contact",
  services: "Services",
  features: "Features",
  blog: "Blog",
  product: "Product",
  other: "Page",
};

function PageStrip({ pages }: { pages: PageGridItem[] }) {
  // Horizontal strip of compact cards — designed to fit 2-4 pages in one row
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
      {pages.map((p) => {
        const label = PAGE_TYPE_LABEL[p.pageType] || "Page";
        const gColor =
          p.score >= 80
            ? colors.green
            : p.score >= 65
            ? "#84CC16"
            : p.score >= 50
            ? colors.amber
            : p.score >= 35
            ? "#F97316"
            : colors.red;
        return (
          <View
            key={p.url}
            style={{
              flex: 1,
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              overflow: "hidden",
            }}
            wrap={false}
          >
            {p.screenshot && (
              <Image
                style={{
                  width: "100%",
                  height: 90,
                  objectFit: "cover",
                }}
                src={`data:image/jpeg;base64,${p.screenshot}`}
              />
            )}
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderTop: `1px solid ${colors.border}`,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 8,
                    color: colors.text,
                    fontFamily: "Helvetica-Bold",
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    fontSize: 7,
                    color: colors.textMute,
                    fontFamily: "Helvetica-Oblique",
                    marginTop: 1,
                  }}
                >
                  {p.loadMs}ms · {p.wordCount.toLocaleString()}w
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: gColor + "22",
                  border: `1px solid ${gColor}55`,
                  borderRadius: 3,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Helvetica-Bold",
                    color: gColor,
                  }}
                >
                  {p.score}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function PageGrid({ pages }: { pages: PageGridItem[] }) {
  const count = pages.length;
  // Card width strategy:
  //   1 card  → centered, half-width (looks like a feature card, not a sparse stripe)
  //   2 cards → side by side, half-width each
  //   3+      → 2-column wrapping grid
  const isWide = count <= 2;

  if (count === 1) {
    // Single card — center it, keep it medium-sized to avoid empty page bottom
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <View style={{ width: "60%" }}>
          <PageCard page={pages[0]} large />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: count === 2 ? "center" : "flex-start",
      }}
    >
      {pages.map((p) => (
        <View
          key={p.url}
          style={{
            width: count === 2 ? "48%" : "48.5%",
            padding: 0,
          }}
        >
          <PageCard page={p} large={isWide} />
        </View>
      ))}
    </View>
  );
}

function PageCard({ page, large }: { page: PageGridItem; large: boolean }) {
  const label = PAGE_TYPE_LABEL[page.pageType] || "Page";
  const pathname = (() => {
    try {
      return new URL(page.url).pathname || "/";
    } catch {
      return page.url;
    }
  })();
  const gColor =
    page.score >= 80
      ? colors.green
      : page.score >= 65
      ? "#84CC16"
      : page.score >= 50
      ? colors.amber
      : page.score >= 35
      ? "#F97316"
      : colors.red;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
      wrap={false}
    >
      {/* Header strip with label + score chip */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 9,
              color: colors.ember,
              letterSpacing: 1.2,
              fontFamily: "Helvetica-Bold",
            }}
          >
            {label.toUpperCase()}
          </Text>
          <Text
            style={{
              fontSize: 7,
              color: colors.textMute,
              fontFamily: "Helvetica-Oblique",
              marginTop: 1,
            }}
          >
            {pathname}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: gColor + "22",
            border: `1px solid ${gColor}55`,
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Helvetica-Bold",
              color: gColor,
            }}
          >
            {page.score}
          </Text>
        </View>
      </View>

      {/* Screenshot */}
      {page.screenshot && (
        <Image
          style={{
            width: "100%",
            maxHeight: large ? 320 : 200,
            objectFit: "cover",
          }}
          src={`data:image/jpeg;base64,${page.screenshot}`}
        />
      )}

      {/* Stats + issues */}
      <View style={{ padding: 8 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 7, color: colors.textMute }}>
            <Text style={{ color: colors.text, fontFamily: "Helvetica-Bold" }}>
              {page.loadMs}
            </Text>
            <Text> ms · </Text>
            <Text style={{ color: colors.text, fontFamily: "Helvetica-Bold" }}>
              {page.wordCount.toLocaleString()}
            </Text>
            <Text> words</Text>
          </Text>
        </View>
        {page.topIssues.length > 0 ? (
          <View>
            {page.topIssues.slice(0, 3).map((issue, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 7,
                  color: colors.textDim,
                  marginTop: 2,
                }}
              >
                • {issue}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 7, color: colors.green }}>
            No issues found on this page
          </Text>
        )}
      </View>
    </View>
  );
}

function ActionChecklistPage({
  audit,
  host,
  fetched,
}: {
  audit: AuditResult;
  host: string;
  fetched: string;
}) {
  const items = buildActionChecklist(audit, 5);
  if (items.length === 0) return null;

  const carbon = estimateCarbon(audit);

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Your action plan</Text>
          <Text style={styles.brandSub}>
            Top {items.length} things to fix this week, ranked by impact-to-effort
          </Text>
        </View>
        <View>
          <Text style={styles.hostname}>{host}</Text>
          <Text style={styles.date}>{fetched}</Text>
        </View>
      </View>

      <View style={{ marginTop: 6 }}>
        {items.map((item, i) => {
          const impactColor =
            item.impact === "high"
              ? "#EF4444"
              : item.impact === "medium"
              ? "#EAB308"
              : "#A1A1AA";

          return (
            <View
              key={item.id}
              wrap={false}
              style={{
                flexDirection: "row",
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 4,
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              {/* Rank number */}
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.ember,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Helvetica-Bold",
                    color: "#0A0908",
                  }}
                >
                  {item.rank}
                </Text>
              </View>

              {/* Body */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Helvetica-Bold",
                    color: colors.text,
                    marginBottom: 3,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: colors.textDim,
                    lineHeight: 1.45,
                    marginBottom: 4,
                  }}
                >
                  {item.why}
                </Text>
                {item.tool && (
                  <Text
                    style={{
                      fontSize: 8,
                      color: colors.ember,
                      fontFamily: "Helvetica-Oblique",
                    }}
                  >
                    Tool: {item.tool}
                  </Text>
                )}
              </View>

              {/* Impact + effort */}
              <View style={{ alignItems: "flex-end", flexShrink: 0, width: 80 }}>
                <View
                  style={{
                    backgroundColor: impactColor + "22",
                    border: `1px solid ${impactColor}55`,
                    borderRadius: 3,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7,
                      fontFamily: "Helvetica-Bold",
                      color: impactColor,
                      letterSpacing: 1,
                    }}
                  >
                    {item.impact.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontSize: 7, color: colors.textMute }}>
                  ~{item.effort}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Carbon footnote */}
      <View
        style={{
          marginTop: 18,
          padding: 12,
          backgroundColor: colors.card,
          borderLeft: `3px solid ${colors.green}`,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            fontSize: 8,
            color: colors.green,
            letterSpacing: 1.2,
            fontFamily: "Helvetica-Bold",
            marginBottom: 4,
          }}
        >
          BONUS — CARBON FOOTPRINT
        </Text>
        <Text style={{ fontSize: 9, color: colors.text, lineHeight: 1.45 }}>
          This site emits roughly {carbon.gramsPerVisit}g CO₂ per visit ({carbon.ranking}).
          {" "}{carbon.comparison} At 10k visits/mo, that&apos;s {carbon.annualKgAt10kVisits} kg/year.
        </Text>
      </View>

      {/* CTA */}
      <View
        style={{
          marginTop: 14,
          padding: 12,
          backgroundColor: colors.card,
          borderLeft: `3px solid ${colors.ember}`,
          borderRadius: 4,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontFamily: "Helvetica-Bold",
            color: colors.text,
          }}
        >
          Want a pro to do all this for you?
        </Text>
        <Text style={{ fontSize: 9, color: colors.textDim, marginTop: 3, lineHeight: 1.45 }}>
          {BRAND.parent} fixes exactly what this audit just exposed. Flat rate. No
          contracts. Book a free 15-min walk-through:{" "}
          <Text style={{ color: colors.ember }}>{BRAND.bookingUrl}</Text>
        </Text>
      </View>

      <Footer />
    </Page>
  );
}

export async function generatePdf(audit: AuditResult, roast: string): Promise<Buffer> {
  const buf = await renderToBuffer(buildReport(audit, roast));
  return buf as Buffer;
}

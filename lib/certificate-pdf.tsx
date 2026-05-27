/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { AuditResult } from "./audit";
import { BRAND } from "./brand";

const colors = {
  bg: "#FAF7F2",
  ink: "#1F1810",
  muted: "#6B5E50",
  gold: "#B7791F",
  goldLight: "#D69E2E",
  border: "#E0D6C9",
  ember: "#C2410C",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    color: colors.ink,
    padding: 56,
    fontFamily: "Helvetica",
  },
  outerFrame: {
    flex: 1,
    border: `3px double ${colors.gold}`,
    padding: 28,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  innerFrame: {
    width: "100%",
    border: `1px solid ${colors.border}`,
    padding: 36,
    borderRadius: 2,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 6,
  },
  eyebrow: {
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 4,
    fontFamily: "Helvetica-Bold",
    marginBottom: 18,
    textAlign: "center",
  },
  title: {
    fontSize: 38,
    color: colors.ink,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 36,
    fontFamily: "Helvetica-Oblique",
  },
  hostBlock: {
    backgroundColor: "#FFFFFF",
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 18,
    marginBottom: 28,
    alignItems: "center",
  },
  hostnameLabel: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 6,
  },
  hostname: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
  },
  body: {
    fontSize: 12,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 22,
    maxWidth: 440,
  },
  scoresRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },
  scoreCell: {
    width: 90,
    height: 90,
    borderRadius: 8,
    border: `1px solid ${colors.gold}`,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.gold,
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  meta: {
    fontSize: 9,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 1.5,
  },
  signature: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 12,
  },
  sigBlock: {
    alignItems: "center",
    width: 200,
  },
  sigLine: {
    width: 160,
    height: 1,
    backgroundColor: colors.ink,
    marginBottom: 6,
  },
  sigLabel: {
    fontSize: 9,
    color: colors.muted,
    fontFamily: "Helvetica-Oblique",
  },
  sigName: {
    fontSize: 11,
    color: colors.ink,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  seal: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 80,
    height: 80,
    borderRadius: 40,
    border: `2px solid ${colors.gold}`,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  sealTop: {
    fontSize: 8,
    color: colors.gold,
    letterSpacing: 2,
    fontFamily: "Helvetica-Bold",
  },
  sealBig: {
    fontSize: 24,
    color: colors.gold,
    fontFamily: "Helvetica-Bold",
    marginVertical: 2,
  },
});

export function buildCertificate(audit: AuditResult) {
  let host = audit.url;
  try {
    host = new URL(audit.url).hostname.replace(/^www\./, "");
  } catch {
    // fall through
  }
  const issued = new Date(audit.fetchedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = `RMS-${audit.fetchedAt.slice(0, 10).replace(/-/g, "")}-${Math.abs(
    hashCode(audit.url)
  )
    .toString(36)
    .slice(0, 6)
    .toUpperCase()}`;

  return (
    <Document
      title={`RoastMySite Certificate — ${host}`}
      author="RoastMySite"
      subject={`Web Excellence Certificate for ${host}`}
    >
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.seal}>
            <Text style={styles.sealTop}>GRADE</Text>
            <Text style={styles.sealBig}>{audit.grade}</Text>
            <Text style={styles.sealTop}>{audit.score}/100</Text>
          </View>

          <View style={styles.innerFrame}>
            <Text style={styles.eyebrow}>CERTIFICATE OF WEB EXCELLENCE</Text>
            <Text style={styles.title}>Web Audit Pass</Text>
            <Text style={styles.subtitle}>
              Lighthouse · WCAG 2 AA · Real Core Web Vitals — independently verified
            </Text>

            <View style={styles.hostBlock}>
              <Text style={styles.hostnameLabel}>AWARDED TO</Text>
              <Text style={styles.hostname}>{host}</Text>
            </View>

            <Text style={styles.body}>
              This site has passed a live audit against Google&apos;s Lighthouse
              scoring, the axe-core WCAG 2 AA accessibility ruleset, and the
              Mozilla Observatory security headers analysis — with a composite
              score of {audit.score}/100, grade {audit.grade}.
            </Text>

            {audit.lighthouse && (
              <View style={styles.scoresRow}>
                {[
                  { label: "Performance", value: audit.lighthouse.scores.performance },
                  { label: "Accessibility", value: audit.lighthouse.scores.accessibility },
                  { label: "Best Practices", value: audit.lighthouse.scores.bestPractices },
                  { label: "SEO", value: audit.lighthouse.scores.seo },
                ].map((c) => (
                  <View key={c.label} style={styles.scoreCell}>
                    <Text style={styles.scoreNum}>{c.value ?? "—"}</Text>
                    <Text style={styles.scoreLabel}>{c.label.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.signature}>
              <View style={styles.sigBlock}>
                <Text style={styles.sigName}>RoastMySite</Text>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>Issued by</Text>
              </View>
              <View style={styles.sigBlock}>
                <Text style={styles.sigName}>{issued}</Text>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>Date of audit</Text>
              </View>
            </View>

            <Text style={[styles.meta, { marginTop: 20 }]}>
              Certificate ID: {certId} · Audit re-verifiable at{" "}
              {BRAND.domain}/?url={host}
              {"\n"}
              A {BRAND.parent} product · {BRAND.parentUrl}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export async function generateCertificate(audit: AuditResult): Promise<Buffer> {
  const buf = await renderToBuffer(buildCertificate(audit));
  return buf as Buffer;
}

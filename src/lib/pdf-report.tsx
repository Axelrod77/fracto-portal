import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ScoreResult } from "./scoring";
import type { RoadmapResult } from "./roadmap";
import { maturityLevels } from "@/data/questionnaire";

const colors = {
  plum: "#3D1F3E",
  plumLight: "#5E3560",
  periwinkle: "#8B8FCF",
  periwinkleLight: "#B8BBE4",
  periwinkleLighter: "#E8E9F5",
  muted: "#6B5A6C",
  bg: "#FAFAFE",
  white: "#FFFFFF",
  border: "#D4D5E8",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.plum,
    backgroundColor: colors.bg,
  },
  // Cover
  coverPage: {
    padding: 60,
    fontFamily: "Helvetica",
    backgroundColor: colors.plum,
    color: colors.white,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  coverLogo: {
    width: 48,
    height: 48,
    backgroundColor: colors.periwinkle,
    borderRadius: 10,
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: colors.white,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.periwinkleLight,
    marginBottom: 40,
  },
  coverMeta: {
    fontSize: 11,
    color: colors.periwinkleLight,
  },
  // Headers
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    color: colors.plum,
  },
  subTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: colors.plum,
  },
  // Scores
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 4,
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  scoreName: {
    fontSize: 10,
    color: colors.plum,
    flex: 1,
  },
  scoreValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.plum,
    width: 30,
    textAlign: "right",
  },
  scoreBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.periwinkleLighter,
    width: 120,
    marginHorizontal: 10,
  },
  scoreBarFill: {
    height: 6,
    borderRadius: 3,
  },
  scoreLabel: {
    fontSize: 8,
    width: 60,
  },
  // Summary box
  summaryBox: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overallScore: {
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
    color: colors.plum,
    textAlign: "center",
  },
  overallLabel: {
    fontSize: 10,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 4,
  },
  // Roadmap
  horizonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 16,
  },
  horizonBadge: {
    backgroundColor: colors.periwinkle,
    color: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginRight: 8,
  },
  horizonLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.plum,
  },
  horizonTimeframe: {
    fontSize: 9,
    color: colors.muted,
    marginLeft: 6,
  },
  initiativeCard: {
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  initiativeTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.plum,
    marginBottom: 2,
  },
  initiativeDesc: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.4,
  },
  priorityBadge: {
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  // Radar image
  radarImage: {
    width: "100%",
    maxHeight: 320,
    objectFit: "contain",
    marginBottom: 16,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: colors.muted,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function getMaturityLevel(score: number) {
  return (
    maturityLevels.find((l) => score >= l.min && score <= l.max) ||
    maturityLevels[0]
  );
}

const priorityStyles: Record<string, { bg: string; text: string }> = {
  critical: { bg: "#FEE2E2", text: "#991B1B" },
  high: { bg: "#FEF3C7", text: "#92400E" },
  medium: { bg: "#DBEAFE", text: "#1E40AF" },
};

interface PDFReportProps {
  results: ScoreResult;
  roadmap: RoadmapResult;
  radarImageUrl?: string;
  title?: string;
  orgName?: string;
}

export default function PDFReport({
  results,
  roadmap,
  radarImageUrl,
  title = "Digital Maturity Assessment",
  orgName,
}: PDFReportProps) {
  const overallLevel = getMaturityLevel(results.overall);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ alignItems: "center", marginTop: 200 }}>
          <View style={styles.coverLogo}>
            <Text
              style={{
                color: colors.white,
                fontFamily: "Helvetica-Bold",
                fontSize: 24,
              }}
            >
              F
            </Text>
          </View>
          <Text style={styles.coverTitle}>FraCTO</Text>
          <Text style={styles.coverSubtitle}>{title}</Text>
          {orgName && (
            <Text style={[styles.coverMeta, { marginBottom: 8 }]}>
              {orgName}
            </Text>
          )}
          <Text style={styles.coverMeta}>{date}</Text>
        </View>
      </Page>

      {/* Executive Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.overallLabel}>
            Overall Digital Maturity Score
          </Text>
          <Text style={styles.overallScore}>
            {results.overall.toFixed(1)}
          </Text>
          <Text
            style={[
              styles.overallLabel,
              { fontFamily: "Helvetica-Bold", color: overallLevel.color },
            ]}
          >
            {overallLevel.label}
          </Text>
          <Text
            style={{
              fontSize: 9,
              color: colors.muted,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {overallLevel.description}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={[styles.summaryBox, { flex: 1 }]}>
            <Text style={styles.subTitle}>Key Strengths</Text>
            {roadmap.strengths.length > 0 ? (
              roadmap.strengths.map((s) => (
                <Text key={s} style={{ fontSize: 9, color: "#15803D", marginBottom: 2 }}>
                  + {s}
                </Text>
              ))
            ) : (
              <Text style={{ fontSize: 9, color: colors.muted }}>
                Building foundations
              </Text>
            )}
          </View>
          <View style={[styles.summaryBox, { flex: 1 }]}>
            <Text style={styles.subTitle}>Critical Gaps</Text>
            {roadmap.gaps.length > 0 ? (
              roadmap.gaps.map((g) => (
                <Text key={g} style={{ fontSize: 9, color: "#DC2626", marginBottom: 2 }}>
                  - {g}
                </Text>
              ))
            ) : (
              <Text style={{ fontSize: 9, color: colors.muted }}>
                No critical gaps
              </Text>
            )}
          </View>
        </View>

        {/* Radar Chart Image */}
        {radarImageUrl && (
          <View style={styles.summaryBox}>
            <Text style={[styles.subTitle, { textAlign: "center" }]}>
              Maturity Radar
            </Text>
            <Image src={radarImageUrl} style={styles.radarImage} />
          </View>
        )}

        <View style={styles.footer}>
          <Text>FraCTO — Digital Maturity Assessment</Text>
          <Text>{date}</Text>
        </View>
      </Page>

      {/* Dimension Breakdown */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Dimension Breakdown</Text>

        {results.dimensions.map((dim) => {
          const level = getMaturityLevel(dim.score);
          const pct = (dim.score / 5) * 100;
          return (
            <View key={dim.name} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{dim.name}</Text>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreBarFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: level.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreLabel}>{level.label}</Text>
              <Text style={styles.scoreValue}>{dim.score.toFixed(1)}</Text>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text>FraCTO — Digital Maturity Assessment</Text>
          <Text>{date}</Text>
        </View>
      </Page>

      {/* Roadmap */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Transformation Roadmap</Text>

        {roadmap.horizons.map((horizon) => (
          <View key={horizon.id} wrap={false}>
            <View style={styles.horizonHeader}>
              <Text style={styles.horizonBadge}>{horizon.label}</Text>
              <Text style={styles.horizonLabel}>{horizon.subtitle}</Text>
              <Text style={styles.horizonTimeframe}>{horizon.timeframe}</Text>
            </View>

            {horizon.initiatives.slice(0, 6).map((init, idx) => {
              const pStyle = priorityStyles[init.priority] || priorityStyles.medium;
              return (
                <View key={idx} style={styles.initiativeCard} wrap={false}>
                  <Text style={styles.initiativeTitle}>{init.title}</Text>
                  <Text style={styles.initiativeDesc}>
                    {init.description}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                    <Text
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: pStyle.bg, color: pStyle.text },
                      ]}
                    >
                      {init.priority}
                    </Text>
                    <Text
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor: colors.periwinkleLighter,
                          color: colors.muted,
                        },
                      ]}
                    >
                      {init.effort} effort
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        <View style={styles.footer}>
          <Text>FraCTO — Digital Maturity Assessment</Text>
          <Text>{date}</Text>
        </View>
      </Page>
    </Document>
  );
}

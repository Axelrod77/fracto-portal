"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { modules, mockResults, maturityLevels } from "@/data/questionnaire";
import { computeScores, type ScoreResult } from "@/lib/scoring";
import { generateRoadmap, type RoadmapResult, type Initiative } from "@/lib/roadmap";
import { useAuth } from "@/hooks/use-auth";
import { getStore } from "@/lib/store";
import AppHeader from "@/components/app-header";

function getMaturityLevel(score: number) {
  return (
    maturityLevels.find((l) => score >= l.min && score <= l.max) ||
    maturityLevels[0]
  );
}

const TOTAL_MONTHS = 48;
const HORIZON_RANGES = [
  { start: 0, end: 18, label: "H1", color: "#8B8FCF" },    // periwinkle
  { start: 18, end: 36, label: "H2", color: "#5E3560" },    // plum-light
  { start: 36, end: 48, label: "H3", color: "#3D1F3E" },    // plum
];

const priorityOrder = { critical: 0, high: 1, medium: 2 };

const priorityColors: Record<string, { bg: string; border: string; text: string }> = {
  critical: { bg: "#FEE2E2", border: "#FCA5A5", text: "#991B1B" },
  high: { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E" },
  medium: { bg: "#DBEAFE", border: "#93C5FD", text: "#1E40AF" },
};

const effortLabels: Record<string, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
};

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" /></div>}>
      <RoadmapPageInner />
    </Suspense>
  );
}

function RoadmapPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id") ?? undefined;
  const { authenticated, loading: authLoading } = useAuth();
  const store = getStore(authenticated);

  const [results, setResults] = useState<ScoreResult>(mockResults);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);
  const [hoveredInit, setHoveredInit] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    async function load() {
      let scoreResult = mockResults;

      const cached = await store.loadScores(assessmentId);
      if (cached && cached.dimensions.length > 0) {
        scoreResult = cached;
      } else {
        const answers = await store.loadAnswers(assessmentId);
        if (Object.keys(answers).length > 0) {
          const computed = computeScores(answers, modules);
          if (computed.dimensions.length > 0) {
            scoreResult = computed;
          }
        } else {
          try {
            const stored = localStorage.getItem("fracto-answers");
            if (stored) {
              const answers = JSON.parse(stored);
              const computed = computeScores(answers, modules);
              if (computed.dimensions.length > 0) {
                scoreResult = computed;
              }
            }
          } catch {
            // Fall back to mockResults
          }
        }
      }

      setResults(scoreResult);
      setRoadmap(generateRoadmap(scoreResult.dimensions));
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const overallLevel = getMaturityLevel(results.overall);

  if (authLoading || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Build flat list of all initiatives with horizon info
  type TimelineItem = Initiative & { horizonIdx: number; horizonLabel: string };
  const allItems: TimelineItem[] = [];
  roadmap.horizons.forEach((h, hIdx) => {
    h.initiatives.forEach((init) => {
      allItems.push({ ...init, horizonIdx: hIdx, horizonLabel: h.label });
    });
  });

  // Group by dimension, sort initiatives by priority within each
  const dimensions = [...new Set(allItems.map((i) => i.dimension))];
  const byDimension: Record<string, TimelineItem[]> = {};
  for (const dim of dimensions) {
    byDimension[dim] = allItems
      .filter((i) => i.dimension === dim)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  // Sort dimensions by lowest-scoring first (most work needed = top)
  const dimScoreMap: Record<string, number> = {};
  results.dimensions.forEach((d) => { dimScoreMap[d.name] = d.score; });
  const sortedDimensions = dimensions.sort(
    (a, b) => (dimScoreMap[a] ?? 3) - (dimScoreMap[b] ?? 3)
  );

  // Month tick positions
  const monthTicks = [0, 6, 12, 18, 24, 30, 36, 42, 48];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const query = assessmentId ? `?id=${assessmentId}` : "";
              router.push(`/results${query}`);
            }}
            className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
          >
            Back to Results
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-plum)] mb-2">
            Transformation Roadmap
          </h1>
          <p className="text-[var(--color-muted-foreground)] mb-8">
            Initiatives plotted across three horizons — sorted by urgency. Lowest-scoring dimensions appear first.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <Card className="border-border/50 bg-white">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">
                  Overall Score
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[var(--color-plum)]">
                    {results.overall.toFixed(1)}
                  </span>
                  <span className="text-sm text-[var(--color-muted-foreground)]">/ 5.0</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-white">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">
                  Maturity Level
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: overallLevel.color }}
                  />
                  <span className="text-lg font-semibold text-[var(--color-plum)]">
                    {overallLevel.label}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-white">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">
                  Key Strengths
                </p>
                {roadmap.strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {roadmap.strengths.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] border-green-300 text-green-700 bg-green-50">
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-muted-foreground)]">Building foundations</span>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-white">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">
                  Critical Gaps
                </p>
                {roadmap.gaps.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {roadmap.gaps.map((g) => (
                      <Badge key={g} variant="outline" className="text-[10px] border-red-300 text-red-700 bg-red-50">
                        {g}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-muted-foreground)]">No critical gaps</span>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gantt Timeline */}
        <Card className="border-border/50 bg-white mb-10 overflow-hidden">
          <CardContent className="p-0">
            {/* Mobile scroll hint */}
            <div className="sm:hidden flex items-center gap-1.5 px-4 py-2 bg-[var(--color-periwinkle-lighter)]/30 text-[10px] text-[var(--color-muted-foreground)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
              Scroll horizontally to see full timeline
            </div>
            <div ref={timelineRef} className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Horizon bands header */}
                <div className="flex border-b border-border/50">
                  <div className="w-[200px] flex-shrink-0 px-4 py-3 bg-[var(--color-periwinkle-lighter)]/30">
                    <span className="text-xs font-semibold text-[var(--color-plum)] uppercase tracking-wider">
                      Dimension
                    </span>
                  </div>
                  <div className="flex-1 flex">
                    {HORIZON_RANGES.map((h) => {
                      const widthPct = ((h.end - h.start) / TOTAL_MONTHS) * 100;
                      return (
                        <div
                          key={h.label}
                          className="flex items-center justify-center py-3 border-l border-border/30"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: `${h.color}10`,
                          }}
                        >
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: h.color }}
                          >
                            {h.label}
                          </span>
                          <span className="text-[10px] text-[var(--color-muted-foreground)] ml-2">
                            {h.start}-{h.end}mo
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Month ticks */}
                <div className="flex border-b border-border/30">
                  <div className="w-[200px] flex-shrink-0" />
                  <div className="flex-1 relative h-6">
                    {monthTicks.map((m) => (
                      <div
                        key={m}
                        className="absolute top-0 h-full flex items-center"
                        style={{ left: `${(m / TOTAL_MONTHS) * 100}%` }}
                      >
                        <div className="w-px h-full bg-border/40" />
                        <span className="text-[9px] text-[var(--color-muted-foreground)] ml-1">
                          {m}mo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Swim lanes */}
                {sortedDimensions.map((dim) => {
                  const items = byDimension[dim] || [];
                  const dimScore = dimScoreMap[dim] ?? 0;
                  const dimLevel = getMaturityLevel(dimScore);
                  const rowHeight = Math.max(items.length * 36 + 16, 52);

                  return (
                    <div
                      key={dim}
                      className="flex border-b border-border/20 hover:bg-[var(--color-periwinkle-lighter)]/10 transition-colors"
                      style={{ minHeight: rowHeight }}
                    >
                      {/* Dimension label */}
                      <div className="w-[200px] flex-shrink-0 px-4 py-3 border-r border-border/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[var(--color-plum)] leading-tight">
                            {dim}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: dimLevel.color }}
                          />
                          <span className="text-[10px] text-[var(--color-muted-foreground)]">
                            {dimScore.toFixed(1)} — {dimLevel.label}
                          </span>
                        </div>
                      </div>

                      {/* Timeline bars */}
                      <div className="flex-1 relative py-2 px-1">
                        {/* Vertical grid lines */}
                        {[18, 36].map((m) => (
                          <div
                            key={m}
                            className="absolute top-0 bottom-0 w-px"
                            style={{
                              left: `${(m / TOTAL_MONTHS) * 100}%`,
                              backgroundColor: "var(--color-periwinkle-lighter)",
                            }}
                          />
                        ))}

                        {/* Initiative bars */}
                        {items.map((item, idx) => {
                          const range = HORIZON_RANGES[item.horizonIdx];
                          const leftPct = (range.start / TOTAL_MONTHS) * 100;
                          const widthPct = ((range.end - range.start) / TOTAL_MONTHS) * 100;
                          const pColor = priorityColors[item.priority];
                          const key = `${dim}-${idx}`;
                          const isHovered = hoveredInit === key;

                          return (
                            <div
                              key={idx}
                              className="relative transition-all duration-150"
                              style={{
                                marginLeft: `${leftPct}%`,
                                width: `${widthPct}%`,
                                marginBottom: 4,
                              }}
                              onMouseEnter={() => setHoveredInit(key)}
                              onMouseLeave={() => setHoveredInit(null)}
                            >
                              <div
                                className="rounded-md px-2.5 py-1 cursor-default transition-shadow"
                                style={{
                                  backgroundColor: pColor.bg,
                                  borderLeft: `3px solid ${pColor.border}`,
                                  boxShadow: isHovered ? `0 2px 8px ${pColor.border}40` : "none",
                                }}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className="text-[10px] font-semibold flex-shrink-0 px-1 rounded"
                                    style={{ color: pColor.text }}
                                  >
                                    {item.priority[0].toUpperCase()}
                                  </span>
                                  <span className="text-[11px] font-medium text-[var(--color-plum)] truncate">
                                    {item.title}
                                  </span>
                                  <span className="text-[9px] text-[var(--color-muted-foreground)] flex-shrink-0 ml-auto">
                                    {effortLabels[item.effort]}
                                  </span>
                                </div>
                              </div>

                              {/* Tooltip on hover */}
                              {isHovered && (
                                <div className="absolute z-30 top-full left-0 mt-1 w-72 p-3 rounded-lg bg-white border border-border/50 shadow-lg">
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <span className="text-xs font-semibold text-[var(--color-plum)]">
                                      {item.title}
                                    </span>
                                    <span
                                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor: pColor.bg,
                                        color: pColor.text,
                                      }}
                                    >
                                      {item.priority}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[var(--color-muted-foreground)] leading-relaxed">
                                    {item.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--color-muted-foreground)]">
                                    <span>{item.horizonLabel} ({range.start}-{range.end} months)</span>
                                    <span>|</span>
                                    <span>{effortLabels[item.effort]} effort</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mb-12 px-1">
          <span className="text-xs font-semibold text-[var(--color-plum)] uppercase tracking-wider">
            Priority:
          </span>
          {Object.entries(priorityColors).map(([priority, colors]) => (
            <div key={priority} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors.bg, borderLeft: `2px solid ${colors.border}` }}
              />
              <span className="text-xs text-[var(--color-muted-foreground)] capitalize">
                {priority}
              </span>
            </div>
          ))}
          <span className="text-xs text-[var(--color-muted-foreground)]">|</span>
          <span className="text-xs font-semibold text-[var(--color-plum)] uppercase tracking-wider">
            Effort:
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)]">Low / Med / High shown on each bar</span>
        </div>

        {/* Initiative Detail Cards (below timeline) */}
        <h3 className="text-lg font-semibold text-[var(--color-plum)] mb-6">
          Initiative Details
        </h3>
        <div className="space-y-8 mb-16">
          {sortedDimensions.map((dim) => {
            const items = byDimension[dim] || [];
            if (items.length === 0) return null;
            return (
              <div key={dim}>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-semibold text-[var(--color-plum)]">
                    {dim}
                  </h4>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    ({dimScoreMap[dim]?.toFixed(1) ?? "—"})
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item, idx) => {
                    const pColor = priorityColors[item.priority];
                    const range = HORIZON_RANGES[item.horizonIdx];
                    return (
                      <Card key={idx} className="border-border/50 bg-white">
                        <CardContent className="pt-4 pb-3">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h5 className="text-sm font-semibold text-[var(--color-plum)] leading-tight">
                              {item.title}
                            </h5>
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: pColor.bg, color: pColor.text }}
                            >
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed mb-2.5">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className="text-[10px] px-1.5 py-0 text-white"
                              style={{ backgroundColor: range.color }}
                            >
                              {item.horizonLabel} · {range.start}-{range.end}mo
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-[var(--color-periwinkle-lighter)] text-[var(--color-muted-foreground)]"
                            >
                              {effortLabels[item.effort]} effort
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Card className="border-[var(--color-periwinkle)] bg-gradient-to-br from-[var(--color-plum)]/5 to-[var(--color-periwinkle-lighter)]/50 mb-16">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold text-[var(--color-plum)] mb-3">
              Ready to execute this roadmap?
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] max-w-lg mx-auto mb-6">
              This roadmap is generated from your assessment data. A FraCTO advisory engagement
              will refine priorities, navigate stakeholder dynamics, and provide hands-on
              execution support for each horizon.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white px-8"
              >
                Request Advisory Engagement
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const query = assessmentId ? `?id=${assessmentId}` : "";
                  router.push(`/results${query}`);
                }}
                className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
              >
                Back to Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">F</span>
            </div>
            <span className="font-medium text-[var(--color-plum)]">
              FraCTO
            </span>
          </div>
          <span>Fractional CTO for Enterprise AI Transformation</span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { modules, mockResults, maturityLevels } from "@/data/questionnaire";
import { computeScores, type ScoreResult } from "@/lib/scoring";
import { generateRoadmap, type RoadmapResult, type Initiative } from "@/lib/roadmap";

function getMaturityLevel(score: number) {
  return (
    maturityLevels.find((l) => score >= l.min && score <= l.max) ||
    maturityLevels[0]
  );
}

const horizonStyles = [
  {
    accent: "var(--color-periwinkle)",
    accentLight: "var(--color-periwinkle-lighter)",
    bg: "bg-[var(--color-periwinkle-lighter)]/30",
    border: "border-[var(--color-periwinkle)]",
    badge: "bg-[var(--color-periwinkle)] text-white",
    dot: "bg-[var(--color-periwinkle)]",
  },
  {
    accent: "var(--color-plum-light)",
    accentLight: "var(--color-plum-light)",
    bg: "bg-[var(--color-plum)]/5",
    border: "border-[var(--color-plum-light)]",
    badge: "bg-[var(--color-plum)] text-white",
    dot: "bg-[var(--color-plum)]",
  },
  {
    accent: "var(--color-plum)",
    accentLight: "var(--color-plum)",
    bg: "bg-gradient-to-br from-[var(--color-plum)]/5 to-[var(--color-periwinkle)]/10",
    border: "border-[var(--color-plum)]",
    badge: "bg-gradient-to-r from-[var(--color-plum)] to-[var(--color-periwinkle)] text-white",
    dot: "bg-gradient-to-r from-[var(--color-plum)] to-[var(--color-periwinkle)]",
  },
];

const priorityColors: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700" },
  high: { bg: "bg-amber-100", text: "text-amber-700" },
  medium: { bg: "bg-blue-100", text: "text-blue-700" },
};

const effortLabels: Record<string, string> = {
  low: "Low Effort",
  medium: "Medium Effort",
  high: "High Effort",
};

export default function RoadmapPage() {
  const router = useRouter();
  const [results, setResults] = useState<ScoreResult>(mockResults);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);

  useEffect(() => {
    let scoreResult = mockResults;
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
    setResults(scoreResult);
    setRoadmap(generateRoadmap(scoreResult.dimensions));
  }, []);

  const overallLevel = getMaturityLevel(results.overall);

  if (!roadmap) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-[var(--color-plum)]">
              FraCTO
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/results")}
            className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
          >
            Back to Results
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Summary Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[var(--color-plum)] mb-2">
            Your Transformation Roadmap
          </h1>
          <p className="text-[var(--color-muted-foreground)] mb-8">
            A phased approach based on your assessment results — prioritized by impact and readiness.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Overall Score */}
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

            {/* Maturity Level */}
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

            {/* Key Strengths */}
            <Card className="border-border/50 bg-white">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">
                  Key Strengths
                </p>
                {roadmap.strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {roadmap.strengths.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="text-[10px] border-green-300 text-green-700 bg-green-50"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-muted-foreground)]">
                    Building foundations
                  </span>
                )}
              </CardContent>
            </Card>

            {/* Critical Gaps */}
            <Card className="border-border/50 bg-white">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">
                  Critical Gaps
                </p>
                {roadmap.gaps.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {roadmap.gaps.map((g) => (
                      <Badge
                        key={g}
                        variant="outline"
                        className="text-[10px] border-red-300 text-red-700 bg-red-50"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-muted-foreground)]">
                    No critical gaps
                  </span>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline Visual */}
        <div className="relative mb-4">
          <div className="flex items-center gap-0 mb-8">
            {roadmap.horizons.map((horizon, idx) => (
              <div key={horizon.id} className="flex-1 flex items-center">
                <div
                  className={`w-4 h-4 rounded-full ${horizonStyles[idx].dot} flex-shrink-0 ring-4 ring-white z-10`}
                />
                {idx < 2 && (
                  <div className="flex-1 h-0.5 bg-[var(--color-periwinkle-lighter)]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Horizons */}
        <div className="space-y-12">
          {roadmap.horizons.map((horizon, hIdx) => {
            const style = horizonStyles[hIdx];
            // Group initiatives by dimension
            const byDimension: Record<string, Initiative[]> = {};
            for (const init of horizon.initiatives) {
              if (!byDimension[init.dimension]) byDimension[init.dimension] = [];
              byDimension[init.dimension].push(init);
            }

            return (
              <div key={horizon.id}>
                {/* Horizon Header */}
                <div className="flex items-center gap-3 mb-6">
                  <Badge className={`${style.badge} text-sm px-3 py-1`}>
                    {horizon.label}
                  </Badge>
                  <div>
                    <span className="text-sm font-semibold text-[var(--color-plum)]">
                      {horizon.subtitle}
                    </span>
                    <span className="text-sm text-[var(--color-muted-foreground)] ml-2">
                      {horizon.timeframe}
                    </span>
                  </div>
                </div>

                {/* Initiative Cards grouped by dimension */}
                <div className="space-y-6">
                  {Object.entries(byDimension).map(([dimension, initiatives]) => (
                    <div key={dimension}>
                      <h4 className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-3 ml-1">
                        {dimension}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {initiatives.map((init, iIdx) => {
                          const pColor = priorityColors[init.priority];
                          return (
                            <Card
                              key={iIdx}
                              className={`border-border/50 bg-white hover:${style.border} transition-colors`}
                            >
                              <CardContent className="pt-4 pb-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h5 className="text-sm font-semibold text-[var(--color-plum)] leading-tight">
                                    {init.title}
                                  </h5>
                                  <Badge
                                    className={`${pColor.bg} ${pColor.text} text-[10px] px-1.5 py-0 flex-shrink-0`}
                                  >
                                    {init.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed mb-3">
                                  {init.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-[var(--color-periwinkle-lighter)] text-[var(--color-muted-foreground)]"
                                  >
                                    {effortLabels[init.effort]}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {hIdx < roadmap.horizons.length - 1 && (
                  <Separator className="mt-12" />
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 mb-16">
          <Card className="border-[var(--color-periwinkle)] bg-gradient-to-br from-[var(--color-plum)]/5 to-[var(--color-periwinkle-lighter)]/50">
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
                  onClick={() => router.push("/results")}
                  className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
                >
                  Back to Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
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

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { maturityLevels } from "@/data/questionnaire";
import type { ScoreResult } from "@/lib/scoring";
import { generateRoadmap, type RoadmapResult, type Initiative } from "@/lib/roadmap";
import ReportActions from "@/components/report-actions";
import { getSupabase } from "@/lib/supabase";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

function getMaturityLevel(score: number) {
  return (
    maturityLevels.find((l) => score >= l.min && score <= l.max) ||
    maturityLevels[0]
  );
}

const horizonStyles = [
  {
    badge: "bg-[var(--color-periwinkle)] text-white",
    dot: "bg-[var(--color-periwinkle)]",
    border: "border-[var(--color-periwinkle)]",
  },
  {
    badge: "bg-[var(--color-plum)] text-white",
    dot: "bg-[var(--color-plum)]",
    border: "border-[var(--color-plum-light)]",
  },
  {
    badge: "bg-gradient-to-r from-[var(--color-plum)] to-[var(--color-periwinkle)] text-white",
    dot: "bg-gradient-to-r from-[var(--color-plum)] to-[var(--color-periwinkle)]",
    border: "border-[var(--color-plum)]",
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

export default function SharedReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" /></div>}>
      <SharedReportPageInner />
    </Suspense>
  );
}

function SharedReportPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [results, setResults] = useState<ScoreResult | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);
  const [title, setTitle] = useState("Assessment Report");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) {
        setError(true);
        setLoading(false);
        return;
      }

      const sb = getSupabase();
      if (!sb) {
        setError(true);
        setLoading(false);
        return;
      }

      const { data, error: rpcError } = await sb.rpc("get_shared_report", {
        share_token: token,
      });

      if (rpcError || !data) {
        setError(true);
        setLoading(false);
        return;
      }

      const reportData = data as {
        title: string;
        scores: { overall: number; dimensions: ScoreResult["dimensions"] };
      };

      if (!reportData.scores) {
        setError(true);
        setLoading(false);
        return;
      }

      const scoreResult: ScoreResult = {
        overall: Number(reportData.scores.overall),
        dimensions: reportData.scores.dimensions,
      };

      setTitle(reportData.title || "Assessment Report");
      setResults(scoreResult);
      setRoadmap(generateRoadmap(scoreResult.dimensions));
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !results || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="border-border/50 max-w-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-lg font-bold text-[var(--color-plum)] mb-2">
              Report Not Found
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              This link may have expired or is invalid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallLevel = getMaturityLevel(results.overall);

  const radarData = results.dimensions.map((d) => ({
    dimension: d.name.replace("& ", "&\n"),
    score: d.score,
    fullMark: 5,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-[var(--color-plum)]">
              FraCTO
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ReportActions
              results={results}
              authenticated={false}
            />
            <Badge
              variant="outline"
              className="border-[var(--color-periwinkle)] text-[var(--color-periwinkle)]"
            >
              {title}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Overall Score */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-3 uppercase tracking-wider">
            Overall Digital Maturity Score
          </p>
          <div className="inline-flex items-baseline gap-2 mb-3">
            <span className="text-7xl font-bold text-[var(--color-plum)]">
              {results.overall.toFixed(1)}
            </span>
            <span className="text-2xl text-[var(--color-muted-foreground)]">/ 5.0</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: overallLevel.color }}
            />
            <span className="text-lg font-semibold text-[var(--color-plum)]">
              {overallLevel.label}
            </span>
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
            {overallLevel.description}
          </p>
        </div>

        {/* Radar */}
        <Card className="border-border/50 bg-white mb-12">
          <CardContent className="pt-8 pb-4">
            <h3 className="text-lg font-semibold text-[var(--color-plum)] text-center mb-6">
              Maturity Radar
            </h3>
            <div id="radar-chart" className="w-full h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#D4D5E8" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: "#3D1F3E", fontSize: 11, fontWeight: 500 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    tick={{ fill: "#6B5A6C", fontSize: 10 }}
                    tickCount={6}
                    axisLine={false}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3D1F3E"
                    fill="#8B8FCF"
                    fillOpacity={0.35}
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3D1F3E", stroke: "#fff", strokeWidth: 2 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dimensions */}
        <h3 className="text-lg font-semibold text-[var(--color-plum)] mb-6">
          Dimension Breakdown
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {results.dimensions.map((dim) => {
            const level = getMaturityLevel(dim.score);
            const pct = (dim.score / 5) * 100;
            return (
              <Card key={dim.name} className="border-border/50 bg-white">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[var(--color-plum)]">
                      {dim.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                        style={{ borderColor: level.color, color: level.color }}
                      >
                        {level.label}
                      </Badge>
                      <span className="text-lg font-bold text-[var(--color-plum)]">
                        {dim.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-periwinkle-lighter)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: level.color }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="mb-12" />

        {/* Roadmap Summary */}
        <h3 className="text-lg font-semibold text-[var(--color-plum)] mb-6">
          Transformation Roadmap
        </h3>
        <div className="space-y-10 mb-16">
          {roadmap.horizons.map((horizon, hIdx) => {
            const style = horizonStyles[hIdx];
            const byDimension: Record<string, Initiative[]> = {};
            for (const init of horizon.initiatives) {
              if (!byDimension[init.dimension]) byDimension[init.dimension] = [];
              byDimension[init.dimension].push(init);
            }

            return (
              <div key={horizon.id}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${style.badge} text-sm px-3 py-1`}>
                    {horizon.label}
                  </Badge>
                  <span className="text-sm font-semibold text-[var(--color-plum)]">
                    {horizon.subtitle}
                  </span>
                  <span className="text-sm text-[var(--color-muted-foreground)]">
                    {horizon.timeframe}
                  </span>
                </div>
                <div className="space-y-4">
                  {Object.entries(byDimension).map(([dimension, initiatives]) => (
                    <div key={dimension}>
                      <h4 className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2 ml-1">
                        {dimension}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {initiatives.map((init, iIdx) => {
                          const pColor = priorityColors[init.priority];
                          return (
                            <Card
                              key={iIdx}
                              className="border-border/50 bg-white"
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
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-[var(--color-periwinkle-lighter)] text-[var(--color-muted-foreground)]"
                                >
                                  {effortLabels[init.effort]}
                                </Badge>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">F</span>
            </div>
            <span className="font-medium text-[var(--color-plum)]">FraCTO</span>
          </div>
          <span>Fractional CTO for Enterprise AI Transformation</span>
        </div>
      </footer>
    </div>
  );
}

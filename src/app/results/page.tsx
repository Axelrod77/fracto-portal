"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { modules, mockResults, maturityLevels } from "@/data/questionnaire";
import { computeScores, enrichScores, type ScoreResult, type EnterpriseData } from "@/lib/scoring";
import { useAuth } from "@/hooks/use-auth";
import { getStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import ReportActions from "@/components/report-actions";
import AppHeader from "@/components/app-header";
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

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" /></div>}>
      <ResultsPageInner />
    </Suspense>
  );
}

function ResultsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id") ?? undefined;
  const { authenticated, loading: authLoading } = useAuth();
  const store = getStore(authenticated);

  const [results, setResults] = useState<ScoreResult>(mockResults);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    async function load() {
      let scoreResult: ScoreResult | null = null;

      // Try loading cached scores first (Supabase)
      const cached = await store.loadScores(assessmentId);
      if (cached && cached.dimensions.length > 0) {
        scoreResult = cached;
      }

      if (!scoreResult) {
        // Compute from answers
        const answers = await store.loadAnswers(assessmentId);
        if (Object.keys(answers).length > 0) {
          const computed = computeScores(answers, modules);
          if (computed.dimensions.length > 0) {
            scoreResult = computed;
            store.saveScores(computed, assessmentId);
          }
        }
      }

      if (!scoreResult) {
        // Fallback: try localStorage directly (anonymous path)
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

      if (!scoreResult) {
        scoreResult = mockResults;
      }

      // Try to enrich with enterprise data
      const enterpriseData = await loadEnterpriseData(assessmentId, authenticated);
      if (enterpriseData) {
        scoreResult = enrichScores(scoreResult, enterpriseData);
      }

      setResults(scoreResult);
      setDataLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  async function loadEnterpriseData(
    aId?: string,
    authed?: boolean
  ): Promise<EnterpriseData | null> {
    // Try Supabase first
    if (authed && aId) {
      const sb = getSupabase();
      if (sb) {
        const { data } = await sb
          .from("enterprise_uploads")
          .select("upload_type, parsed_data")
          .eq("assessment_id", aId);

        if (data && data.length > 0) {
          const result: EnterpriseData = {};
          for (const row of data) {
            if (row.upload_type === "architecture")
              result.architecture = row.parsed_data;
            if (row.upload_type === "cmdb") result.cmdb = row.parsed_data;
            if (row.upload_type === "process_logs")
              result.process_logs = row.parsed_data;
          }
          return result;
        }
      }
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem("fracto-enterprise-data");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }

    return null;
  }

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" />
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
      <AppHeader
        actions={
          <>
            <ReportActions
              results={results}
              assessmentId={assessmentId}
              authenticated={authenticated}
            />
            <Badge
              variant="outline"
              className="border-[var(--color-periwinkle)] text-[var(--color-periwinkle)]"
            >
              Assessment Results
            </Badge>
          </>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Overall Score Hero */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-[var(--color-muted-foreground)] mb-3 uppercase tracking-wider">
            Overall Digital Maturity Score
          </p>
          <div className="inline-flex items-baseline gap-2 mb-3">
            <span className="text-7xl font-bold text-[var(--color-plum)]">
              {results.overall.toFixed(1)}
            </span>
            <span className="text-2xl text-[var(--color-muted-foreground)]">
              / 5.0
            </span>
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

        {/* Radar Chart */}
        <Card className="border-border/50 bg-white mb-12">
          <CardContent className="pt-8 pb-4">
            <h3 className="text-lg font-semibold text-[var(--color-plum)] text-center mb-6">
              Maturity Radar
            </h3>
            <div id="radar-chart" className="w-full h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid
                    stroke="#D4D5E8"
                    strokeDasharray="3 3"
                  />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{
                      fill: "#3D1F3E",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
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
                    dot={{
                      r: 4,
                      fill: "#3D1F3E",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Breakdown */}
        <h3 className="text-lg font-semibold text-[var(--color-plum)] mb-6">
          Dimension Breakdown
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {results.dimensions.map((dim) => {
            const level = getMaturityLevel(dim.score);
            const pct = (dim.score / 5) * 100;
            return (
              <Card
                key={dim.name}
                className="border-border/50 bg-white hover:border-[var(--color-periwinkle)] transition-colors"
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-[var(--color-plum)]">
                        {dim.name}
                      </span>
                      {dim.enriched && (
                        <Badge className="bg-[var(--color-periwinkle)] text-white text-[8px] px-1 py-0 leading-tight">
                          Enriched
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                        style={{
                          borderColor: level.color,
                          color: level.color,
                        }}
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
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: level.color,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Maturity Scale */}
        <h3 className="text-lg font-semibold text-[var(--color-plum)] mb-6">
          Maturity Scale
        </h3>
        <Card className="border-border/50 bg-white mb-12">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {maturityLevels.map((level) => {
                const isCurrentLevel = overallLevel.level === level.level;
                return (
                  <div
                    key={level.level}
                    className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                      isCurrentLevel
                        ? "bg-[var(--color-periwinkle-lighter)]/50 ring-1 ring-[var(--color-periwinkle)]"
                        : ""
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.level}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--color-plum)]">
                          {level.label}
                        </span>
                        <span className="text-xs text-[var(--color-muted-foreground)]">
                          ({level.min} - {level.max})
                        </span>
                        {isCurrentLevel && (
                          <Badge className="bg-[var(--color-plum)] text-white text-[10px] px-1.5 py-0">
                            You are here
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        {level.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Separator className="mb-12" />

        {/* CTA */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-[var(--color-plum)] mb-3">
            Ready for your transformation roadmap?
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-lg mx-auto mb-6">
            The free assessment shows you where you stand. The paid advisory
            engagement tells you exactly what to do about it — including how to
            navigate internal stakeholders and IT partner dynamics.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white px-8"
              onClick={() => {
                const query = assessmentId ? `?id=${assessmentId}` : "";
                router.push(`/roadmap${query}`);
              }}
            >
              View Roadmap
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/")}
              className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
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

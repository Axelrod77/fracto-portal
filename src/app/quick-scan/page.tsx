"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { quickScanModules, maturityLevels } from "@/data/questionnaire";
import { computeScores, type ScoreResult } from "@/lib/scoring";

function QuickScanInner() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<ScoreResult | null>(null);

  // Flatten all questions from the quick scan modules
  const questions = quickScanModules.flatMap((mod) =>
    mod.sections.flatMap((sec) => sec.questions)
  );

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const allAnswered = answeredCount === totalCount;

  function handleAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleGetScore() {
    const scoreResult = computeScores(answers, quickScanModules);
    setResults(scoreResult);
    // Scroll to results
    setTimeout(() => {
      document.getElementById("quick-scan-results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function getMaturityLevel(score: number) {
    return maturityLevels.find((l) => score >= l.min && score <= l.max) ?? maturityLevels[0];
  }

  function getBarColor(score: number) {
    if (score >= 4.3) return "bg-[var(--color-plum)]";
    if (score >= 3.5) return "bg-[var(--color-periwinkle)]";
    if (score >= 2.7) return "bg-yellow-500";
    if (score >= 1.9) return "bg-orange-500";
    return "bg-red-500";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[var(--color-plum)]">
              FraCTO
            </span>
          </button>
          <div className="text-sm text-[var(--color-muted-foreground)]">
            {answeredCount}/{totalCount} answered
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-periwinkle-lighter)] text-[var(--color-plum)] text-sm font-medium mb-6">
            5-Minute Quick Scan
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-plum)] mb-4 leading-tight">
            How digitally mature is your organization?
          </h1>
          <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto leading-relaxed">
            Answer 10 questions to get an instant maturity score across 8 dimensions.
            No sign-up required. Takes under 5 minutes.
          </p>
        </div>
      </section>

      {/* Questions */}
      {!results && (
        <section className="px-6 pb-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {questions.map((question, idx) => {
              // Find which dimension this question feeds into
              const mod = quickScanModules.find((m) =>
                m.sections.some((s) => s.questions.some((q) => q.id === question.id))
              );
              const dimension = mod?.feedsInto[0] ?? "";

              return (
                <Card
                  key={question.id}
                  className={`border transition-colors ${
                    answers[question.id]
                      ? "border-[var(--color-periwinkle)]"
                      : "border-border/50"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-periwinkle-lighter)] text-[var(--color-plum)] font-bold flex items-center justify-center text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-[var(--color-periwinkle)] mb-2 uppercase tracking-wide">
                          {dimension}
                        </div>
                        <p className="text-[var(--color-plum)] font-medium mb-4 leading-relaxed">
                          {question.text}
                        </p>
                        <RadioGroup
                          value={answers[question.id] ?? ""}
                          onValueChange={(val) => handleAnswer(question.id, val)}
                          className="space-y-2"
                        >
                          {question.options?.map((opt) => (
                            <div
                              key={opt.label}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--color-periwinkle-lighter)]/50 transition-colors cursor-pointer"
                            >
                              <RadioGroupItem
                                value={opt.label}
                                id={`${question.id}-${opt.label}`}
                                className="mt-0.5 border-[var(--color-periwinkle)] text-[var(--color-plum)]"
                              />
                              <Label
                                htmlFor={`${question.id}-${opt.label}`}
                                className="text-sm text-[var(--color-plum)] leading-relaxed cursor-pointer flex-1"
                              >
                                {opt.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Get Score Button */}
            <div className="pt-4 text-center">
              <Button
                size="lg"
                onClick={handleGetScore}
                disabled={!allAnswered}
                className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white px-12 py-6 text-base disabled:opacity-40"
              >
                {allAnswered
                  ? "Get Your Score"
                  : `Answer all ${totalCount} questions to continue (${totalCount - answeredCount} remaining)`}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {results && (
        <section id="quick-scan-results" className="px-6 pb-20">
          <div className="max-w-3xl mx-auto">
            {/* Overall Score */}
            <Card className="border-[var(--color-plum)] mb-8">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="text-6xl font-bold text-[var(--color-plum)] mb-2">
                  {results.overall}
                  <span className="text-2xl text-[var(--color-muted-foreground)] font-normal">
                    {" "}/ 5.0
                  </span>
                </div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white mt-3"
                  style={{ backgroundColor: getMaturityLevel(results.overall).color }}
                >
                  {getMaturityLevel(results.overall).label}
                </div>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-4 max-w-md mx-auto">
                  {getMaturityLevel(results.overall).description}
                </p>
              </CardContent>
            </Card>

            {/* Dimension Breakdown */}
            <h2 className="text-xl font-bold text-[var(--color-plum)] mb-4">
              Score by Dimension
            </h2>
            <div className="space-y-3 mb-10">
              {results.dimensions.map((dim) => (
                <div key={dim.name} className="bg-white rounded-xl border border-border/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--color-plum)]">
                      {dim.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--color-plum)]">
                        {dim.score}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: getMaturityLevel(dim.score).color }}
                      >
                        {getMaturityLevel(dim.score).label}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getBarColor(dim.score)}`}
                      style={{ width: `${(dim.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <Card className="bg-[var(--color-plum)] text-white border-none">
              <CardContent className="pt-8 pb-8 text-center">
                <h3 className="text-xl font-bold mb-3">
                  Want the full picture?
                </h3>
                <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
                  This quick scan covers one question per dimension. The full assessment
                  goes 8x deeper with 70+ questions distributed across your functional leads,
                  plus enterprise data enrichment for objective scoring.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={() => router.push("/assessment")}
                    className="bg-white text-[var(--color-plum)] hover:bg-white/90 px-8"
                  >
                    Take Full Assessment
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setResults(null);
                      setAnswers({});
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="border-white/30 text-white hover:bg-white/10 px-8"
                  >
                    Retake Quick Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
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

export default function QuickScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-[var(--color-muted-foreground)]">Loading...</div>
        </div>
      }
    >
      <QuickScanInner />
    </Suspense>
  );
}

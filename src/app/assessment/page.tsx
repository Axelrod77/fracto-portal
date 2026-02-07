"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { modules, type Question } from "@/data/questionnaire";
import { useAuth } from "@/hooks/use-auth";
import { getStore } from "@/lib/store";

const moduleIcons: Record<string, string> = {
  server: "S",
  database: "D",
  workflow: "P",
  shield: "Sc",
  users: "C",
  handshake: "V",
  brain: "AI",
  layers: "St",
};

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" /></div>}>
      <AssessmentPageInner />
    </Suspense>
  );
}

function AssessmentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id") ?? undefined;
  const { authenticated, loading: authLoading } = useAuth();
  const store = getStore(authenticated);

  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loaded, setLoaded] = useState(false);

  // Debounced save
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing answers once auth resolves
  useEffect(() => {
    if (authLoading) return;
    store.loadAnswers(assessmentId).then((a) => {
      if (Object.keys(a).length > 0) setAnswers(a);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Save answers debounced
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      store.saveAnswers(answers, assessmentId);
    }, 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, loaded]);

  const currentModule = modules[currentModuleIdx];
  const currentSection = currentModule?.sections[currentSectionIdx];

  const totalSections = modules.reduce((sum, m) => sum + m.sections.length, 0);
  const completedSections =
    modules
      .slice(0, currentModuleIdx)
      .reduce((sum, m) => sum + m.sections.length, 0) + currentSectionIdx;
  const progressPercent = (completedSections / totalSections) * 100;

  const setAnswer = useCallback(
    (questionId: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  const toggleMultiSelect = useCallback(
    (questionId: string, optionLabel: string) => {
      setAnswers((prev) => {
        const current = (prev[questionId] as string[]) || [];
        if (current.includes(optionLabel)) {
          return {
            ...prev,
            [questionId]: current.filter((v) => v !== optionLabel),
          };
        }
        return { ...prev, [questionId]: [...current, optionLabel] };
      });
    },
    []
  );

  const goNext = () => {
    if (currentSectionIdx < currentModule.sections.length - 1) {
      setCurrentSectionIdx(currentSectionIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentModuleIdx < modules.length - 1) {
      setCurrentModuleIdx(currentModuleIdx + 1);
      setCurrentSectionIdx(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final save (flush immediately)
      store.saveAnswers(answers, assessmentId);
      if (!authenticated) {
        localStorage.setItem("fracto-answers", JSON.stringify(answers));
      }
      const query = assessmentId ? `?id=${assessmentId}` : "";
      router.push(`/results${query}`);
    }
  };

  const goBack = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(currentSectionIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentModuleIdx > 0) {
      const prevModule = modules[currentModuleIdx - 1];
      setCurrentModuleIdx(currentModuleIdx - 1);
      setCurrentSectionIdx(prevModule.sections.length - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isLastSection =
    currentModuleIdx === modules.length - 1 &&
    currentSectionIdx === currentModule.sections.length - 1;
  const isFirstSection = currentModuleIdx === 0 && currentSectionIdx === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
                <span className="text-white font-bold text-xs">F</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-[var(--color-plum)]">
                FraCTO
              </span>
            </div>
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-1.5 bg-[var(--color-periwinkle-lighter)]"
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Module navigation pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {modules.map((mod, idx) => (
            <button
              key={mod.id}
              onClick={() => {
                setCurrentModuleIdx(idx);
                setCurrentSectionIdx(0);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                idx === currentModuleIdx
                  ? "bg-[var(--color-plum)] text-white"
                  : idx < currentModuleIdx
                    ? "bg-[var(--color-periwinkle-lighter)] text-[var(--color-plum)]"
                    : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {moduleIcons[mod.icon] || (idx + 1).toString()}
              </span>
              {mod.shortTitle}
            </button>
          ))}
        </div>

        {/* Module + Section header */}
        <div className="mb-8">
          <Badge
            variant="outline"
            className="mb-3 border-[var(--color-periwinkle)] text-[var(--color-periwinkle)]"
          >
            Module {currentModuleIdx + 1} of {modules.length} &middot; Sent to:{" "}
            {currentModule.sentTo}
          </Badge>
          <h1 className="text-2xl font-bold text-[var(--color-plum)] mb-1">
            {currentModule.title}
          </h1>
          <h2 className="text-lg text-[var(--color-muted-foreground)]">
            {currentSection.title}
          </h2>
          {currentModule.sections.length > 1 && (
            <div className="flex gap-1.5 mt-3">
              {currentModule.sections.map((_, sIdx) => (
                <div
                  key={sIdx}
                  className={`h-1 rounded-full flex-1 transition-colors ${
                    sIdx <= currentSectionIdx
                      ? "bg-[var(--color-periwinkle)]"
                      : "bg-[var(--color-periwinkle-lighter)]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {currentSection.questions.map((question, qIdx) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={qIdx}
              answer={answers[question.id]}
              onAnswer={setAnswer}
              onToggleMulti={toggleMultiSelect}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 mb-16">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={isFirstSection}
            className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
          >
            Back
          </Button>
          <Button
            onClick={goNext}
            className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white px-8"
          >
            {isLastSection ? "View Results" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  answer,
  onAnswer,
  onToggleMulti,
}: {
  question: Question;
  index: number;
  answer: string | string[] | undefined;
  onAnswer: (id: string, value: string | string[]) => void;
  onToggleMulti: (id: string, option: string) => void;
}) {
  return (
    <Card className="border-border/50 bg-white">
      <CardContent className="pt-6">
        <div className="flex gap-3 mb-4">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-periwinkle-lighter)] text-[var(--color-plum)] text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-[var(--color-plum)] leading-relaxed">
            {question.text}
          </p>
        </div>

        <div className="ml-9">
          {question.type === "mcq" && question.options && (
            <RadioGroup
              value={(answer as string) || ""}
              onValueChange={(val) => onAnswer(question.id, val)}
              className="space-y-2.5"
            >
              {question.options.map((opt) => (
                <div
                  key={opt.label}
                  className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-[var(--color-periwinkle-lighter)] hover:bg-[var(--color-periwinkle-lighter)]/30 transition-colors cursor-pointer"
                >
                  <RadioGroupItem
                    value={opt.label}
                    id={`${question.id}-${opt.label}`}
                    className="mt-0.5 border-[var(--color-periwinkle)] text-[var(--color-plum)]"
                  />
                  <Label
                    htmlFor={`${question.id}-${opt.label}`}
                    className="text-sm text-[var(--color-plum)]/80 cursor-pointer leading-relaxed"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === "multi-select" && question.options && (
            <div className="space-y-2.5">
              {question.options.map((opt) => {
                const selected = ((answer as string[]) || []).includes(
                  opt.label
                );
                return (
                  <div
                    key={opt.label}
                    className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-[var(--color-periwinkle-lighter)] hover:bg-[var(--color-periwinkle-lighter)]/30 transition-colors cursor-pointer"
                    onClick={() => onToggleMulti(question.id, opt.label)}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() =>
                        onToggleMulti(question.id, opt.label)
                      }
                      className="mt-0.5 border-[var(--color-periwinkle)] data-[state=checked]:bg-[var(--color-plum)] data-[state=checked]:border-[var(--color-plum)]"
                    />
                    <span className="text-sm text-[var(--color-plum)]/80 leading-relaxed">
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {question.type === "free-text" && (
            <Textarea
              value={(answer as string) || ""}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="min-h-[100px] border-[var(--color-periwinkle-lighter)] focus:border-[var(--color-periwinkle)] text-sm resize-none"
            />
          )}

          {question.type === "csv-upload" && (
            <div className="border-2 border-dashed border-[var(--color-periwinkle-lighter)] rounded-xl p-8 text-center hover:border-[var(--color-periwinkle)] transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[var(--color-periwinkle-lighter)] mx-auto mb-3 flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[var(--color-plum)]"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-plum)] mb-1">
                Drag and drop your CSV file here
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {question.placeholder}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

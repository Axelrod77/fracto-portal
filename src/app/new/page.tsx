"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { modules, type Question } from "@/data/questionnaire";
import { useAuth } from "@/hooks/use-auth";
import { getStore } from "@/lib/store";

export default function NewAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <NewAssessmentInner />
    </Suspense>
  );
}

function NewAssessmentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get("m");
  const assessmentId = searchParams.get("id") ?? undefined;

  const { authenticated, loading: authLoading } = useAuth();
  const store = getStore(authenticated);

  const [currentModuleIdx, setCurrentModuleIdx] = useState(
    moduleParam ? Math.max(0, parseInt(moduleParam) - 1) : 0
  );
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showModuleList, setShowModuleList] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Load existing answers
  useEffect(() => {
    if (authLoading) return;
    store.loadAnswers(assessmentId).then((a) => {
      if (Object.keys(a).length > 0) setAnswers(a);
      // Load notes from localStorage
      try {
        const savedNotes = localStorage.getItem("fracto-notes");
        if (savedNotes) setNotes(JSON.parse(savedNotes));
      } catch {}
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Autosave on every answer change (300ms debounce)
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      store.saveAnswers(answers, assessmentId);
      localStorage.setItem("fracto-notes", JSON.stringify(notes));
    }, 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, notes, loaded]);

  // Resume from first unanswered question on load
  useEffect(() => {
    if (!loaded || moduleParam) return;
    for (let mi = 0; mi < modules.length; mi++) {
      const mod = modules[mi];
      const allQuestions = mod.sections.flatMap((s) => s.questions);
      const hasUnanswered = allQuestions.some((q) => !answers[q.id]);
      if (hasUnanswered) {
        setCurrentModuleIdx(mi);
        return;
      }
    }
  }, [loaded, moduleParam, answers]);

  const currentModule = modules[currentModuleIdx];
  const allQuestions = currentModule.sections.flatMap((s) => s.questions);

  // Overall progress
  const totalQuestions = modules.reduce(
    (sum, m) => sum + m.sections.flatMap((s) => s.questions).length,
    0
  );
  const answeredQuestions = modules.reduce(
    (sum, m) =>
      sum +
      m.sections
        .flatMap((s) => s.questions)
        .filter((q) => answers[q.id] !== undefined).length,
    0
  );
  const progressPercent = (answeredQuestions / totalQuestions) * 100;

  // Module completion check
  const isModuleComplete = (modIdx: number) => {
    const mod = modules[modIdx];
    return mod.sections
      .flatMap((s) => s.questions)
      .filter((q) => q.type === "mcq" || q.type === "multi-select")
      .every((q) => answers[q.id] !== undefined);
  };

  const setAnswer = useCallback(
    (questionId: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));

      // Auto-advance: scroll to next unanswered question
      requestAnimationFrame(() => {
        const qIds = allQuestions.map((q) => q.id);
        const currentIdx = qIds.indexOf(questionId);
        for (let i = currentIdx + 1; i < qIds.length; i++) {
          const nextQ = allQuestions[i];
          if (!answers[nextQ.id] && answers[nextQ.id] !== questionId) {
            const el = questionRefs.current.get(nextQ.id);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            break;
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allQuestions, answers]
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

  const goToModule = (idx: number) => {
    setTransitioning(true);
    setShowModuleList(false);
    setTimeout(() => {
      setCurrentModuleIdx(idx);
      window.scrollTo({ top: 0 });
      setTimeout(() => setTransitioning(false), 50);
    }, 200);
  };

  const goNext = () => {
    if (currentModuleIdx < modules.length - 1) {
      goToModule(currentModuleIdx + 1);
    } else {
      // All done — flush save and go to review
      store.saveAnswers(answers, assessmentId);
      if (!authenticated) {
        localStorage.setItem("fracto-answers", JSON.stringify(answers));
      }
      const query = assessmentId ? `?id=${assessmentId}` : "";
      router.push(`/results${query}`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModuleList(false);
        return;
      }
      // Don't intercept when typing in textarea
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      )
        return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModuleIdx, answers]);

  const isLastModule = currentModuleIdx === modules.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal sticky header — just progress */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setShowModuleList(!showModuleList)}
            className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-plum)] transition-colors"
          >
            Module {currentModuleIdx + 1} of {modules.length} &mdash;{" "}
            {currentModule.shortTitle}
          </button>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {Math.round(progressPercent)}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] bg-[var(--color-periwinkle-lighter)]">
          <div
            className="h-full bg-[var(--color-plum)] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Module list overlay */}
      {showModuleList && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setShowModuleList(false)}
        >
          <div
            className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-xl shadow-xl border border-border/50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              {modules.map((mod, idx) => {
                const complete = isModuleComplete(idx);
                const current = idx === currentModuleIdx;
                return (
                  <button
                    key={mod.id}
                    onClick={() => goToModule(idx)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                      current
                        ? "bg-[var(--color-periwinkle-lighter)] text-[var(--color-plum)] font-medium"
                        : "hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                        complete
                          ? "bg-green-100 text-green-600"
                          : current
                            ? "bg-[var(--color-plum)] text-white"
                            : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
                      }`}
                    >
                      {complete ? "✓" : idx + 1}
                    </span>
                    {mod.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <main
        className={`max-w-2xl mx-auto px-6 py-10 transition-opacity duration-200 ${
          transitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Module title */}
        <h1 className="text-xl font-semibold text-[var(--color-plum)] mb-2">
          {currentModule.title}
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-10">
          Sent to: {currentModule.sentTo}
        </p>

        {/* Question stack */}
        <div className="space-y-10">
          {allQuestions.map((question, qIdx) => (
            <div
              key={question.id}
              ref={(el) => {
                if (el) questionRefs.current.set(question.id, el);
              }}
            >
              <MinimalQuestion
                question={question}
                index={qIdx}
                answer={answers[question.id]}
                note={notes[question.id] || ""}
                noteExpanded={expandedNotes.has(question.id)}
                onAnswer={setAnswer}
                onToggleMulti={toggleMultiSelect}
                onNoteChange={(val) =>
                  setNotes((prev) => ({ ...prev, [question.id]: val }))
                }
                onToggleNote={() =>
                  setExpandedNotes((prev) => {
                    const next = new Set(prev);
                    if (next.has(question.id)) next.delete(question.id);
                    else next.add(question.id);
                    return next;
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* Continue */}
        <div className="mt-14 mb-20 flex items-center justify-between">
          {currentModuleIdx > 0 ? (
            <button
              onClick={() => goToModule(currentModuleIdx - 1)}
              className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-plum)] transition-colors"
            >
              &larr; Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={goNext}
            className="px-8 py-3 rounded-lg bg-[var(--color-plum)] text-white text-sm font-medium hover:bg-[var(--color-plum-light)] transition-colors"
          >
            {isLastModule ? "Review answers" : "Continue →"}
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Minimal Question Component ──

function MinimalQuestion({
  question,
  index,
  answer,
  note,
  noteExpanded,
  onAnswer,
  onToggleMulti,
  onNoteChange,
  onToggleNote,
}: {
  question: Question;
  index: number;
  answer: string | string[] | undefined;
  note: string;
  noteExpanded: boolean;
  onAnswer: (id: string, value: string | string[]) => void;
  onToggleMulti: (id: string, option: string) => void;
  onNoteChange: (val: string) => void;
  onToggleNote: () => void;
}) {
  const isAnswered =
    answer !== undefined &&
    (typeof answer === "string" ? answer.length > 0 : answer.length > 0);

  return (
    <div className="group">
      {/* Question text */}
      <div className="flex gap-3 mb-4">
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
            isAnswered
              ? "bg-green-100 text-green-600"
              : "bg-[var(--color-periwinkle-lighter)] text-[var(--color-plum)]"
          }`}
        >
          {isAnswered ? "✓" : index + 1}
        </span>
        <p className="text-sm text-[var(--color-plum)] leading-relaxed pt-0.5">
          {question.text}
        </p>
      </div>

      {/* Options */}
      <div className="ml-9">
        {question.type === "mcq" && question.options && (
          <RadioGroup
            value={(answer as string) || ""}
            onValueChange={(val) => onAnswer(question.id, val)}
            className="space-y-1.5"
          >
            {question.options.map((opt) => {
              const selected = answer === opt.label;
              return (
                <div
                  key={opt.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    selected
                      ? "bg-[var(--color-periwinkle-lighter)] border border-[var(--color-periwinkle)]"
                      : "border border-transparent hover:bg-[var(--color-muted)]"
                  }`}
                >
                  <RadioGroupItem
                    value={opt.label}
                    id={`${question.id}-${opt.label}`}
                    className="border-[var(--color-periwinkle)] text-[var(--color-plum)]"
                  />
                  <Label
                    htmlFor={`${question.id}-${opt.label}`}
                    className="text-sm text-[var(--color-plum)]/80 cursor-pointer leading-relaxed flex-1"
                  >
                    {opt.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}

        {question.type === "multi-select" && question.options && (
          <div className="space-y-1.5">
            {question.options.map((opt) => {
              const selected = ((answer as string[]) || []).includes(opt.label);
              return (
                <div
                  key={opt.label}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    selected
                      ? "bg-[var(--color-periwinkle-lighter)] border border-[var(--color-periwinkle)]"
                      : "border border-transparent hover:bg-[var(--color-muted)]"
                  }`}
                  onClick={() => onToggleMulti(question.id, opt.label)}
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() =>
                      onToggleMulti(question.id, opt.label)
                    }
                    className="border-[var(--color-periwinkle)] data-[state=checked]:bg-[var(--color-plum)] data-[state=checked]:border-[var(--color-plum)]"
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
            className="min-h-[80px] border-[var(--color-periwinkle-lighter)] focus:border-[var(--color-periwinkle)] text-sm resize-none"
          />
        )}

        {question.type === "csv-upload" && (
          <CsvUpload
            questionId={question.id}
            placeholder={question.placeholder}
            answer={answer}
            onAnswer={onAnswer}
          />
        )}

        {/* Inline note toggle */}
        <div className="mt-2">
          {noteExpanded ? (
            <div className="flex items-start gap-2">
              <textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Add context..."
                rows={1}
                className="flex-1 text-xs text-[var(--color-muted-foreground)] bg-transparent border-b border-[var(--color-periwinkle-lighter)] focus:border-[var(--color-periwinkle)] outline-none resize-none py-1 placeholder:text-[var(--color-muted-foreground)]/50"
                style={{ overflow: "hidden" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 72) + "px";
                }}
              />
              <button
                onClick={onToggleNote}
                className="text-xs text-[var(--color-muted-foreground)]/50 hover:text-[var(--color-muted-foreground)] mt-1"
              >
                &times;
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleNote}
              className="text-xs text-[var(--color-muted-foreground)]/50 hover:text-[var(--color-muted-foreground)] transition-colors opacity-0 group-hover:opacity-100"
            >
              + add note
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CSV Upload (minimal) ──

function CsvUpload({
  questionId,
  placeholder,
  answer,
  onAnswer,
}: {
  questionId: string;
  placeholder?: string;
  answer: string | string[] | undefined;
  onAnswer: (id: string, value: string | string[]) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onAnswer(questionId, text);
    };
    reader.readAsText(file);
  };

  const hasFile =
    !!fileName || (typeof answer === "string" && answer.length > 0);

  return (
    <div
      className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        dragging
          ? "border-[var(--color-periwinkle)] bg-[var(--color-periwinkle-lighter)]/30"
          : hasFile
            ? "border-green-300 bg-green-50/50"
            : "border-[var(--color-periwinkle-lighter)] hover:border-[var(--color-periwinkle)]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv,.json";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      {hasFile ? (
        <p className="text-sm text-green-700">
          ✓ {fileName ?? "File uploaded"}{" "}
          <span className="text-xs text-[var(--color-muted-foreground)]">
            (click to replace)
          </span>
        </p>
      ) : (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {placeholder || "Drop a CSV or JSON file here"}
        </p>
      )}
    </div>
  );
}

import { getSupabase } from "./supabase";
import type { ScoreResult } from "./scoring";

export interface AssessmentStore {
  loadAnswers(assessmentId?: string): Promise<Record<string, string | string[]>>;
  saveAnswers(answers: Record<string, string | string[]>, assessmentId?: string): Promise<void>;
  loadScores(assessmentId?: string): Promise<ScoreResult | null>;
  saveScores(scores: ScoreResult, assessmentId?: string): Promise<void>;
}

// ── localStorage implementation (anonymous / no Supabase) ──

class LocalStorageStore implements AssessmentStore {
  async loadAnswers(): Promise<Record<string, string | string[]>> {
    try {
      const raw = localStorage.getItem("fracto-answers");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  async saveAnswers(answers: Record<string, string | string[]>): Promise<void> {
    localStorage.setItem("fracto-answers", JSON.stringify(answers));
  }

  async loadScores(): Promise<ScoreResult | null> {
    try {
      const raw = localStorage.getItem("fracto-scores");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async saveScores(scores: ScoreResult): Promise<void> {
    localStorage.setItem("fracto-scores", JSON.stringify(scores));
  }
}

// ── Supabase implementation (authenticated) ──

class SupabaseStore implements AssessmentStore {
  async loadAnswers(assessmentId?: string): Promise<Record<string, string | string[]>> {
    const sb = getSupabase();
    if (!sb || !assessmentId) return {};

    const { data, error } = await sb
      .from("answers")
      .select("question_id, value")
      .eq("assessment_id", assessmentId);

    if (error || !data) return {};

    const answers: Record<string, string | string[]> = {};
    for (const row of data) {
      answers[row.question_id] = row.value;
    }
    return answers;
  }

  async saveAnswers(answers: Record<string, string | string[]>, assessmentId?: string): Promise<void> {
    const sb = getSupabase();
    if (!sb || !assessmentId) return;

    const rows = Object.entries(answers).map(([question_id, value]) => ({
      assessment_id: assessmentId,
      question_id,
      value,
    }));

    await sb.from("answers").upsert(rows, {
      onConflict: "assessment_id,question_id",
    });
  }

  async loadScores(assessmentId?: string): Promise<ScoreResult | null> {
    const sb = getSupabase();
    if (!sb || !assessmentId) return null;

    const { data, error } = await sb
      .from("scores")
      .select("overall, dimensions")
      .eq("assessment_id", assessmentId)
      .single();

    if (error || !data) return null;

    return {
      overall: Number(data.overall),
      dimensions: data.dimensions as ScoreResult["dimensions"],
    };
  }

  async saveScores(scores: ScoreResult, assessmentId?: string): Promise<void> {
    const sb = getSupabase();
    if (!sb || !assessmentId) return;

    await sb.from("scores").upsert(
      {
        assessment_id: assessmentId,
        overall: scores.overall,
        dimensions: scores.dimensions,
      },
      { onConflict: "assessment_id" }
    );
  }
}

// ── Factory ──

const localStore = new LocalStorageStore();
const supabaseStore = new SupabaseStore();

export function getStore(authenticated: boolean): AssessmentStore {
  return authenticated ? supabaseStore : localStore;
}

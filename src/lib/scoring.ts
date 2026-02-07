import { type Module } from "@/data/questionnaire";

export interface DimensionScore {
  name: string;
  score: number;
}

export interface ScoreResult {
  overall: number;
  dimensions: DimensionScore[];
}

/**
 * Compute real scores from assessment answers.
 *
 * MCQ: look up the selected option's `score` (1-5).
 * Multi-select: score based on breadth — more selections (excluding "None"/"Other")
 *   mapped to 1-5 scale based on proportion of substantive options selected.
 * Free-text / csv-upload: skipped (not scored).
 */
export function computeScores(
  answers: Record<string, string | string[]>,
  modules: Module[]
): ScoreResult {
  // Map from dimension name → array of individual question scores
  const dimensionScores: Record<string, number[]> = {};

  for (const mod of modules) {
    const dims = mod.feedsInto;

    for (const section of mod.sections) {
      for (const question of section.questions) {
        const answer = answers[question.id];
        if (answer === undefined || answer === null) continue;

        let score: number | null = null;

        if (question.type === "mcq" && question.options) {
          const selected = question.options.find(
            (opt) => opt.label === answer
          );
          score = selected?.score ?? null;
        } else if (question.type === "multi-select" && question.options) {
          const selections = answer as string[];
          if (selections.length === 0) continue;

          // Filter out non-substantive options
          const nonSubstantive = ["None", "Other", "Unsure"];
          const substantiveSelections = selections.filter(
            (s) => !nonSubstantive.includes(s)
          );
          const substantiveOptions = question.options.filter(
            (o) => !nonSubstantive.includes(o.label)
          );

          if (substantiveOptions.length === 0) continue;

          if (
            substantiveSelections.length === 0 &&
            selections.includes("None")
          ) {
            score = 1;
          } else {
            // Map proportion of substantive options selected to 1-5 scale
            const ratio =
              substantiveSelections.length / substantiveOptions.length;
            score = Math.max(1, Math.min(5, Math.round(1 + ratio * 4)));
          }
        }
        // free-text and csv-upload: skip

        if (score !== null) {
          for (const dim of dims) {
            if (!dimensionScores[dim]) dimensionScores[dim] = [];
            dimensionScores[dim].push(score);
          }
        }
      }
    }
  }

  // Compute per-dimension averages
  const dimensions: DimensionScore[] = [];
  for (const [name, scores] of Object.entries(dimensionScores)) {
    const avg =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;
    dimensions.push({
      name,
      score: Math.round(avg * 10) / 10,
    });
  }

  // Sort to match the canonical dimension order
  const canonicalOrder = [
    "Software Robustness",
    "Data Readiness",
    "Process Standardization",
    "Automation Scale",
    "Digital Culture",
    "Security & Compliance",
    "Vendor Ecosystem",
    "AI/ML Current State",
  ];
  dimensions.sort(
    (a, b) => canonicalOrder.indexOf(a.name) - canonicalOrder.indexOf(b.name)
  );

  // Overall is the average of all dimension scores
  const overall =
    dimensions.length > 0
      ? dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
      : 0;

  return {
    overall: Math.round(overall * 10) / 10,
    dimensions,
  };
}

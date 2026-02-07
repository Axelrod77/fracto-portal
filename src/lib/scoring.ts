import { type Module } from "@/data/questionnaire";
import {
  type ArchitectureMetrics,
  computeArchitectureMetrics,
  type ArchitectureRow,
} from "./parsers/architecture";
import {
  type CMDBMetrics,
  computeCMDBMetrics,
  type CMDBRow,
} from "./parsers/cmdb";
import {
  type ProcessLogMetrics,
  computeProcessLogMetrics,
  type ProcessLogRow,
} from "./parsers/process-logs";

export interface DimensionScore {
  name: string;
  score: number;
  /** true if this dimension was adjusted by enterprise data */
  enriched?: boolean;
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

// ── Enterprise Data Enrichment ──

export interface EnterpriseData {
  architecture?: ArchitectureRow[];
  cmdb?: CMDBRow[];
  process_logs?: ProcessLogRow[];
}

/**
 * Enrich survey-based scores with signals from enterprise data uploads.
 * Weight: 60% survey, 40% enterprise data.
 * Each signal maps to a modifier in [-1.0, +1.0].
 */
export function enrichScores(
  baseScores: ScoreResult,
  enterpriseData: EnterpriseData
): ScoreResult {
  const modifiers: Record<string, number[]> = {};

  function addModifier(dim: string, value: number) {
    if (!modifiers[dim]) modifiers[dim] = [];
    modifiers[dim].push(Math.max(-1, Math.min(1, value)));
  }

  // Architecture Data → Software Robustness, Automation Scale
  if (enterpriseData.architecture && enterpriseData.architecture.length > 0) {
    const m: ArchitectureMetrics = computeArchitectureMetrics(
      enterpriseData.architecture
    );

    // % cloud-hosted: 0% → -1.0, 50% → 0, 100% → +1.0
    addModifier("Software Robustness", (m.cloudHostedPct - 50) / 50);

    // % API enabled: 0% → -0.5, 100% → +0.5
    addModifier("Software Robustness", (m.apiEnabledPct - 50) / 100);

    // Average age: <3yr → +0.5, 3-7 → 0, >7 → -0.5
    const ageMod = m.avgAge <= 3 ? 0.5 : m.avgAge <= 7 ? 0 : -0.5;
    addModifier("Software Robustness", ageMod);

    // Integration points per component: higher → more automation scale
    const integPerComp =
      m.totalComponents > 0 ? m.integrationPoints / m.totalComponents : 0;
    addModifier("Automation Scale", Math.min(integPerComp / 5, 1) - 0.3);
  }

  // CMDB Data → Software Robustness, Vendor Ecosystem
  if (enterpriseData.cmdb && enterpriseData.cmdb.length > 0) {
    const m: CMDBMetrics = computeCMDBMetrics(enterpriseData.cmdb);

    // Utilization ratio: high → good software robustness signal
    addModifier("Software Robustness", (m.utilizationRatio - 0.5) * 2);

    // HHI (vendor concentration): high HHI → bad vendor ecosystem
    // HHI ranges 0-1. >0.25 is concentrated
    addModifier("Vendor Ecosystem", -(m.vendorConcentrationHHI - 0.15) * 3);

    // SaaS %: higher → modern stack
    addModifier("Software Robustness", (m.saasPct - 50) / 100);

    // Distinct vendors: more diversity = better vendor ecosystem (diminishing)
    const vendorDiv = Math.min(m.distinctVendors / 15, 1);
    addModifier("Vendor Ecosystem", vendorDiv - 0.3);
  }

  // Process Logs → Process Standardization, Automation Scale
  if (enterpriseData.process_logs && enterpriseData.process_logs.length > 0) {
    const m: ProcessLogMetrics = computeProcessLogMetrics(
      enterpriseData.process_logs
    );

    // Avg automation rate: 0% → -1.0, 50% → 0, 100% → +1.0
    addModifier("Automation Scale", (m.avgAutomationRate - 50) / 50);

    // Avg exception rate (inverse): high exceptions → bad process standardization
    addModifier("Process Standardization", -(m.avgExceptionRate - 10) / 30);

    // Cycle time variance (CoV): lower is better
    addModifier("Process Standardization", -(m.cycleTimeVariance - 0.5) * 2);

    // % high manual steps (inverse): more manual → lower automation scale
    addModifier("Automation Scale", -(m.highManualStepsPct - 30) / 70);
  }

  // Apply modifiers to base scores
  const SURVEY_WEIGHT = 0.6;
  const ENTERPRISE_WEIGHT = 0.4;

  const enrichedDimensions = baseScores.dimensions.map((dim) => {
    const mods = modifiers[dim.name];
    if (!mods || mods.length === 0) return dim;

    const avgModifier = mods.reduce((s, m) => s + m, 0) / mods.length;
    const adjusted =
      dim.score * SURVEY_WEIGHT +
      (dim.score + avgModifier) * ENTERPRISE_WEIGHT;
    const clamped = Math.max(1.0, Math.min(5.0, adjusted));

    return {
      name: dim.name,
      score: Math.round(clamped * 10) / 10,
      enriched: true,
    };
  });

  const overall =
    enrichedDimensions.length > 0
      ? enrichedDimensions.reduce((sum, d) => sum + d.score, 0) /
        enrichedDimensions.length
      : 0;

  return {
    overall: Math.round(overall * 10) / 10,
    dimensions: enrichedDimensions,
  };
}

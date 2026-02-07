import { parseFile, normalizeHeader } from "./utils";

export interface ProcessLogRow {
  process_name: string;
  avg_cycle_time_hours: string;
  volume_per_month: string;
  automation_rate_pct: string;
  exception_rate_pct: string;
  systems_involved: string;
  manual_steps_count: string;
}

const FIELD_ALIASES: Record<string, keyof ProcessLogRow> = {
  process_name: "process_name",
  process: "process_name",
  name: "process_name",
  avg_cycle_time_hours: "avg_cycle_time_hours",
  cycle_time: "avg_cycle_time_hours",
  avg_cycle_time: "avg_cycle_time_hours",
  duration: "avg_cycle_time_hours",
  volume_per_month: "volume_per_month",
  volume: "volume_per_month",
  monthly_volume: "volume_per_month",
  count: "volume_per_month",
  automation_rate_pct: "automation_rate_pct",
  automation_rate: "automation_rate_pct",
  automated: "automation_rate_pct",
  automation: "automation_rate_pct",
  exception_rate_pct: "exception_rate_pct",
  exception_rate: "exception_rate_pct",
  error_rate: "exception_rate_pct",
  exceptions: "exception_rate_pct",
  systems_involved: "systems_involved",
  systems: "systems_involved",
  applications: "systems_involved",
  manual_steps_count: "manual_steps_count",
  manual_steps: "manual_steps_count",
  steps: "manual_steps_count",
};

export function parseProcessLogData(
  content: string,
  filename: string
): ProcessLogRow[] {
  const raw = parseFile(content, filename);
  if (raw.length === 0) return [];

  const headers = Object.keys(raw[0]);
  const mapping: Record<string, keyof ProcessLogRow> = {};

  for (const header of headers) {
    const norm = normalizeHeader(header);
    for (const [alias, field] of Object.entries(FIELD_ALIASES)) {
      if (norm === alias || norm.includes(alias) || alias.includes(norm)) {
        mapping[header] = field;
        break;
      }
    }
  }

  return raw.map((row) => {
    const mapped: ProcessLogRow = {
      process_name: "",
      avg_cycle_time_hours: "",
      volume_per_month: "",
      automation_rate_pct: "",
      exception_rate_pct: "",
      systems_involved: "",
      manual_steps_count: "",
    };
    for (const [rawKey, field] of Object.entries(mapping)) {
      mapped[field] = String(row[rawKey] ?? "");
    }
    return mapped;
  });
}

export interface ProcessLogMetrics {
  totalProcesses: number;
  avgAutomationRate: number;
  avgExceptionRate: number;
  cycleTimeVariance: number;
  highManualStepsPct: number;
}

export function computeProcessLogMetrics(
  rows: ProcessLogRow[]
): ProcessLogMetrics {
  if (rows.length === 0) {
    return { totalProcesses: 0, avgAutomationRate: 0, avgExceptionRate: 0, cycleTimeVariance: 0, highManualStepsPct: 0 };
  }

  const autoRates = rows
    .map((r) => parseFloat(r.automation_rate_pct))
    .filter((n) => !isNaN(n));
  const avgAutomationRate =
    autoRates.length > 0
      ? autoRates.reduce((s, a) => s + a, 0) / autoRates.length
      : 0;

  const exceptionRates = rows
    .map((r) => parseFloat(r.exception_rate_pct))
    .filter((n) => !isNaN(n));
  const avgExceptionRate =
    exceptionRates.length > 0
      ? exceptionRates.reduce((s, a) => s + a, 0) / exceptionRates.length
      : 0;

  // Cycle time variance (coefficient of variation)
  const cycleTimes = rows
    .map((r) => parseFloat(r.avg_cycle_time_hours))
    .filter((n) => !isNaN(n));
  let cycleTimeVariance = 0;
  if (cycleTimes.length > 1) {
    const mean = cycleTimes.reduce((s, a) => s + a, 0) / cycleTimes.length;
    const variance =
      cycleTimes.reduce((s, a) => s + (a - mean) ** 2, 0) /
      cycleTimes.length;
    cycleTimeVariance = mean > 0 ? Math.sqrt(variance) / mean : 0;
  }

  // % of processes with high manual steps (> 5 manual steps)
  const manualSteps = rows
    .map((r) => parseFloat(r.manual_steps_count))
    .filter((n) => !isNaN(n));
  const highManualCount = manualSteps.filter((s) => s > 5).length;
  const highManualStepsPct =
    manualSteps.length > 0 ? (highManualCount / manualSteps.length) * 100 : 0;

  return {
    totalProcesses: rows.length,
    avgAutomationRate,
    avgExceptionRate,
    cycleTimeVariance,
    highManualStepsPct,
  };
}

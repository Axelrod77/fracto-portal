import { parseFile, normalizeHeader } from "./utils";

export interface ArchitectureRow {
  component_name: string;
  component_type: string;
  hosted_on: string;
  integrates_with: string;
  technology: string;
  age_years: string;
  api_enabled: string;
}

const FIELD_ALIASES: Record<string, keyof ArchitectureRow> = {
  component_name: "component_name",
  name: "component_name",
  component: "component_name",
  application: "component_name",
  app_name: "component_name",
  component_type: "component_type",
  type: "component_type",
  category: "component_type",
  hosted_on: "hosted_on",
  hosting: "hosted_on",
  deployment: "hosted_on",
  infrastructure: "hosted_on",
  integrates_with: "integrates_with",
  integrations: "integrates_with",
  dependencies: "integrates_with",
  technology: "technology",
  tech: "technology",
  stack: "technology",
  language: "technology",
  age_years: "age_years",
  age: "age_years",
  years: "age_years",
  api_enabled: "api_enabled",
  api: "api_enabled",
  has_api: "api_enabled",
};

export function parseArchitectureData(
  content: string,
  filename: string
): ArchitectureRow[] {
  const raw = parseFile(content, filename);
  if (raw.length === 0) return [];

  // Map raw fields to expected fields
  const headers = Object.keys(raw[0]);
  const mapping: Record<string, keyof ArchitectureRow> = {};

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
    const mapped: ArchitectureRow = {
      component_name: "",
      component_type: "",
      hosted_on: "",
      integrates_with: "",
      technology: "",
      age_years: "",
      api_enabled: "",
    };
    for (const [rawKey, field] of Object.entries(mapping)) {
      mapped[field] = String(row[rawKey] ?? "");
    }
    return mapped;
  });
}

export interface ArchitectureMetrics {
  totalComponents: number;
  cloudHostedPct: number;
  apiEnabledPct: number;
  avgAge: number;
  integrationPoints: number;
}

export function computeArchitectureMetrics(
  rows: ArchitectureRow[]
): ArchitectureMetrics {
  if (rows.length === 0) {
    return { totalComponents: 0, cloudHostedPct: 0, apiEnabledPct: 0, avgAge: 0, integrationPoints: 0 };
  }

  const cloudKeywords = ["cloud", "saas", "paas", "iaas", "aws", "azure", "gcp"];
  const cloudCount = rows.filter((r) =>
    cloudKeywords.some((k) => r.hosted_on.toLowerCase().includes(k))
  ).length;

  const apiYes = ["yes", "true", "1", "enabled"];
  const apiCount = rows.filter((r) =>
    apiYes.some((k) => r.api_enabled.toLowerCase() === k)
  ).length;

  const ages = rows
    .map((r) => parseFloat(r.age_years))
    .filter((n) => !isNaN(n));
  const avgAge = ages.length > 0 ? ages.reduce((s, a) => s + a, 0) / ages.length : 0;

  const integrationPoints = rows.reduce((sum, r) => {
    const parts = r.integrates_with
      .split(/[,;|]/)
      .filter((s) => s.trim().length > 0);
    return sum + parts.length;
  }, 0);

  return {
    totalComponents: rows.length,
    cloudHostedPct: (cloudCount / rows.length) * 100,
    apiEnabledPct: (apiCount / rows.length) * 100,
    avgAge,
    integrationPoints,
  };
}

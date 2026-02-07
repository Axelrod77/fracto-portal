import { parseFile, normalizeHeader } from "./utils";

export interface CMDBRow {
  app_name: string;
  vendor: string;
  category: string;
  deployment_model: string;
  users_licensed: string;
  users_active: string;
  annual_cost: string;
  business_function: string;
  renewal_date: string;
}

const FIELD_ALIASES: Record<string, keyof CMDBRow> = {
  app_name: "app_name",
  application_name: "app_name",
  application: "app_name",
  name: "app_name",
  software: "app_name",
  vendor: "vendor",
  publisher: "vendor",
  provider: "vendor",
  category: "category",
  type: "category",
  deployment_model: "deployment_model",
  deployment: "deployment_model",
  hosting: "deployment_model",
  users_licensed: "users_licensed",
  licensed_users: "users_licensed",
  licenses: "users_licensed",
  users_active: "users_active",
  active_users: "users_active",
  annual_cost: "annual_cost",
  cost: "annual_cost",
  price: "annual_cost",
  spend: "annual_cost",
  business_function: "business_function",
  function: "business_function",
  department: "business_function",
  renewal_date: "renewal_date",
  renewal: "renewal_date",
  expiry: "renewal_date",
};

export function parseCMDBData(content: string, filename: string): CMDBRow[] {
  const raw = parseFile(content, filename);
  if (raw.length === 0) return [];

  const headers = Object.keys(raw[0]);
  const mapping: Record<string, keyof CMDBRow> = {};

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
    const mapped: CMDBRow = {
      app_name: "",
      vendor: "",
      category: "",
      deployment_model: "",
      users_licensed: "",
      users_active: "",
      annual_cost: "",
      business_function: "",
      renewal_date: "",
    };
    for (const [rawKey, field] of Object.entries(mapping)) {
      mapped[field] = String(row[rawKey] ?? "");
    }
    return mapped;
  });
}

export interface CMDBMetrics {
  totalApps: number;
  utilizationRatio: number;
  vendorConcentrationHHI: number;
  saasPct: number;
  distinctVendors: number;
}

export function computeCMDBMetrics(rows: CMDBRow[]): CMDBMetrics {
  if (rows.length === 0) {
    return { totalApps: 0, utilizationRatio: 0, vendorConcentrationHHI: 0, saasPct: 0, distinctVendors: 0 };
  }

  // Utilization: average of (active / licensed) per app
  let utilSum = 0;
  let utilCount = 0;
  for (const r of rows) {
    const licensed = parseFloat(r.users_licensed);
    const active = parseFloat(r.users_active);
    if (licensed > 0 && !isNaN(active)) {
      utilSum += Math.min(active / licensed, 1);
      utilCount++;
    }
  }
  const utilizationRatio = utilCount > 0 ? utilSum / utilCount : 0;

  // Vendor concentration (HHI)
  const vendorCounts: Record<string, number> = {};
  for (const r of rows) {
    const v = r.vendor.trim().toLowerCase() || "unknown";
    vendorCounts[v] = (vendorCounts[v] || 0) + 1;
  }
  const total = rows.length;
  let hhi = 0;
  for (const count of Object.values(vendorCounts)) {
    const share = count / total;
    hhi += share * share;
  }

  // SaaS percentage
  const saasKeywords = ["saas", "cloud"];
  const saasCount = rows.filter((r) =>
    saasKeywords.some((k) => r.deployment_model.toLowerCase().includes(k))
  ).length;

  return {
    totalApps: rows.length,
    utilizationRatio,
    vendorConcentrationHHI: hhi,
    saasPct: (saasCount / rows.length) * 100,
    distinctVendors: Object.keys(vendorCounts).length,
  };
}

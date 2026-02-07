"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UploadCard from "@/components/upload-card";
import { parseArchitectureData, type ArchitectureRow } from "@/lib/parsers/architecture";
import { parseCMDBData, type CMDBRow } from "@/lib/parsers/cmdb";
import { parseProcessLogData, type ProcessLogRow } from "@/lib/parsers/process-logs";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";

interface UploadState {
  architecture: { data: ArchitectureRow[]; file: File } | null;
  cmdb: { data: CMDBRow[]; file: File } | null;
  process_logs: { data: ProcessLogRow[]; file: File } | null;
}

export default function UploadsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" /></div>}>
      <UploadsPageInner />
    </Suspense>
  );
}

function UploadsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("id") ?? undefined;
  const { authenticated } = useAuth();

  const [uploads, setUploads] = useState<UploadState>({
    architecture: null,
    cmdb: null,
    process_logs: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleArchitectureParsed = useCallback(
    (data: ArchitectureRow[], file: File) => {
      setUploads((prev) => ({ ...prev, architecture: { data, file } }));
    },
    []
  );

  const handleCMDBParsed = useCallback(
    (data: CMDBRow[], file: File) => {
      setUploads((prev) => ({ ...prev, cmdb: { data, file } }));
    },
    []
  );

  const handleProcessLogsParsed = useCallback(
    (data: ProcessLogRow[], file: File) => {
      setUploads((prev) => ({ ...prev, process_logs: { data, file } }));
    },
    []
  );

  const handleSave = async () => {
    if (!authenticated || !assessmentId) {
      // Store in localStorage for anonymous users
      const stored: Record<string, unknown> = {};
      if (uploads.architecture) stored.architecture = uploads.architecture.data;
      if (uploads.cmdb) stored.cmdb = uploads.cmdb.data;
      if (uploads.process_logs) stored.process_logs = uploads.process_logs.data;
      localStorage.setItem("fracto-enterprise-data", JSON.stringify(stored));
      setSaved(true);
      return;
    }

    setSaving(true);
    const sb = getSupabase();
    if (!sb) return;

    for (const [type, upload] of Object.entries(uploads)) {
      if (!upload) continue;

      const { file, data } = upload as { file: File; data: unknown[] };

      // Upload file to storage
      const path = `enterprise-uploads/${assessmentId}/${type}/${file.name}`;
      await sb.storage.from("enterprise-uploads").upload(path, file, {
        upsert: true,
      });

      // Save parsed data
      await sb.from("enterprise_uploads").upsert(
        {
          assessment_id: assessmentId,
          upload_type: type,
          file_path: path,
          original_filename: file.name,
          file_size_bytes: file.size,
          parsed_data: data,
        },
        { onConflict: "assessment_id,upload_type" }
      );
    }

    setSaving(false);
    setSaved(true);
  };

  const uploadCount = Object.values(uploads).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-[var(--color-plum)]">
              FraCTO
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-[var(--color-periwinkle)] text-[var(--color-periwinkle)]"
          >
            Enterprise Data Uploads
          </Badge>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-plum)] mb-2">
            Enterprise Data Uploads
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Upload your organization&apos;s architecture, CMDB, and process data to enrich
            your maturity assessment with real signals from your environment.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          {/* Architecture Data */}
          <UploadCard
            title="Architecture Data"
            description="Component inventory with hosting, integrations, and technology details."
            acceptedFormats="CSV, JSON"
            expectedFields="component_name, component_type, hosted_on, integrates_with, technology, age_years, api_enabled"
            onParsed={handleArchitectureParsed}
            parser={parseArchitectureData}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--color-plum)]"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            }
          />

          {/* CMDB Data */}
          <UploadCard
            title="CMDB / Software Inventory"
            description="Application catalog with vendor, cost, deployment model, and usage data."
            acceptedFormats="CSV, JSON"
            expectedFields="app_name, vendor, category, deployment_model, users_licensed, users_active, annual_cost, business_function, renewal_date"
            onParsed={handleCMDBParsed}
            parser={parseCMDBData}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--color-plum)]"
              >
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            }
          />

          {/* Process Logs */}
          <UploadCard
            title="Process Logs"
            description="Process performance data with cycle times, automation rates, and exception metrics."
            acceptedFormats="CSV, JSON"
            expectedFields="process_name, avg_cycle_time_hours, volume_per_month, automation_rate_pct, exception_rate_pct, systems_involved, manual_steps_count"
            onParsed={handleProcessLogsParsed}
            parser={parseProcessLogData}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--color-plum)]"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const query = assessmentId ? `?id=${assessmentId}` : "";
              router.push(`/results${query}`);
            }}
            className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
          >
            Skip to Results
          </Button>
          <div className="flex items-center gap-3">
            {uploadCount > 0 && (
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {uploadCount} file{uploadCount > 1 ? "s" : ""} ready
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={uploadCount === 0 || saving || saved}
              className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white px-8"
            >
              {saved
                ? "Saved — View Results"
                : saving
                  ? "Saving..."
                  : "Save & Continue"}
            </Button>
          </div>
        </div>

        {saved && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                const query = assessmentId ? `?id=${assessmentId}` : "";
                router.push(`/results${query}`);
              }}
              className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white"
            >
              View Enriched Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

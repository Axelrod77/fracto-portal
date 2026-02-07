"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ScoreResult } from "@/lib/scoring";
import { generateRoadmap } from "@/lib/roadmap";
import { getSupabase } from "@/lib/supabase";

interface ReportActionsProps {
  results: ScoreResult;
  assessmentId?: string;
  authenticated: boolean;
}

export default function ReportActions({
  results,
  assessmentId,
  authenticated,
}: ReportActionsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      // Dynamic imports to avoid SSR issues with react-pdf
      const [{ pdf }, { default: PDFReport }, html2canvasModule] =
        await Promise.all([
          import("@react-pdf/renderer"),
          import("@/lib/pdf-report"),
          import("html2canvas"),
        ]);
      const html2canvas = html2canvasModule.default;

      const roadmap = generateRoadmap(results.dimensions);

      // Capture radar chart as image
      let radarImageUrl: string | undefined;
      const radarEl = document.getElementById("radar-chart");
      if (radarEl) {
        const canvas = await html2canvas(radarEl, {
          backgroundColor: "#FFFFFF",
          scale: 2,
        });
        radarImageUrl = canvas.toDataURL("image/png");
      }

      const blob = await pdf(
        <PDFReport
          results={results}
          roadmap={roadmap}
          radarImageUrl={radarImageUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FraCTO-Assessment-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleShare = async () => {
    if (!authenticated || !assessmentId) return;
    setShareLoading(true);

    try {
      const sb = getSupabase();
      if (!sb) return;

      const { data, error } = await sb
        .from("shared_reports")
        .insert({ assessment_id: assessmentId })
        .select("token")
        .single();

      if (error || !data) {
        console.error("Share failed:", error);
        return;
      }

      const origin = window.location.origin;
      const basePath = "/fracto-portal";
      const url = `${origin}${basePath}/share?token=${data.token}`;
      setShareUrl(url);

      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadPDF}
        disabled={pdfLoading}
        className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
      >
        {pdfLoading ? (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border border-[var(--color-plum)] border-t-transparent animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF
          </span>
        )}
      </Button>

      {authenticated && assessmentId && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          disabled={shareLoading}
          className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
        >
          {shareUrl ? (
            <span className="flex items-center gap-1.5 text-green-700">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied
            </span>
          ) : shareLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-[var(--color-plum)] border-t-transparent animate-spin" />
              Sharing...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </span>
          )}
        </Button>
      )}
    </div>
  );
}

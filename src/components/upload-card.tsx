"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UploadCardProps {
  title: string;
  description: string;
  acceptedFormats: string;
  expectedFields: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onParsed: (data: any[], file: File) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parser: (content: string, filename: string) => any[];
  icon: React.ReactNode;
}

export default function UploadCard({
  title,
  description,
  acceptedFormats,
  expectedFields,
  onParsed,
  parser,
  icon,
}: UploadCardProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (f: File) => {
      setError("");
      setFile(f);

      try {
        const text = await f.text();
        const parsed = parser(text, f.name);

        if (parsed.length === 0) {
          setError("No data found. Please check the file format.");
          setPreview(null);
          return;
        }

        setPreview(parsed);
        onParsed(parsed, f);
      } catch {
        setError("Failed to parse file. Please check the format.");
        setPreview(null);
      }
    },
    [parser, onParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const previewHeaders = preview && preview.length > 0 ? Object.keys(preview[0]) : [];
  const previewRows = preview?.slice(0, 5) ?? [];

  return (
    <Card className="border-border/50 bg-white">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-periwinkle-lighter)] flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-plum)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-[var(--color-periwinkle)] bg-[var(--color-periwinkle-lighter)]/30"
                : "border-[var(--color-periwinkle-lighter)] hover:border-[var(--color-periwinkle)]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.json,.xml"
              className="hidden"
              onChange={handleFileSelect}
            />
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[var(--color-plum)] mx-auto mb-3"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm font-medium text-[var(--color-plum)] mb-1">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Accepted: {acceptedFormats}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Expected: {expectedFields}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-periwinkle-lighter)]/30 mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-[var(--color-periwinkle)] text-white text-[10px]">
                  {file.name.split(".").pop()?.toUpperCase()}
                </Badge>
                <span className="text-sm text-[var(--color-plum)] font-medium">
                  {file.name}
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setError("");
                }}
                className="text-xs border-[var(--color-periwinkle)] text-[var(--color-plum)]"
              >
                Remove
              </Button>
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}

            {preview && preview.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-plum)] mb-2">
                  Preview ({preview.length} rows parsed)
                </p>
                <div className="overflow-x-auto rounded-lg border border-border/50">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[var(--color-periwinkle-lighter)]/50">
                        {previewHeaders.map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left font-semibold text-[var(--color-plum)] whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-t border-border/30 hover:bg-[var(--color-periwinkle-lighter)]/20"
                        >
                          {previewHeaders.map((h) => (
                            <td
                              key={h}
                              className="px-3 py-1.5 text-[var(--color-muted-foreground)] max-w-[200px] truncate"
                            >
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 5 && (
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                    Showing 5 of {preview.length} rows
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

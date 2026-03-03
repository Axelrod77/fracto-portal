"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "01",
    title: "Modular Assessment",
    description:
      "8 focused modules distributed across your functional leads. Each takes ~15 minutes — no marathon surveys.",
  },
  {
    icon: "02",
    title: "Transparent Scoring",
    description:
      "Published rubric across 8 maturity dimensions. See exactly how your scores are calculated.",
  },
  {
    icon: "03",
    title: "Software Stack Analysis",
    description:
      "Upload your software inventory and get an automated invest / maintain / modernize / divest classification.",
  },
  {
    icon: "04",
    title: "Actionable Roadmap",
    description:
      "Move from scores to strategy with a prioritized implementation plan covering 0-18 months and beyond.",
  },
];

const dimensions = [
  "Software Robustness",
  "Data Readiness",
  "Process Standardization",
  "Automation Scale",
  "Digital Culture",
  "Security & Compliance",
  "Vendor Ecosystem",
  "AI/ML Current State",
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[var(--color-plum)]">
              FraCTO
            </span>
          </div>
          <Button
            onClick={() => router.push("/quick-scan")}
            className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white"
          >
            Quick Scan
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-periwinkle-lighter)] text-[var(--color-plum)] text-sm font-medium mb-8">
            Free Digital Maturity Assessment
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-plum)] mb-6 leading-[1.1]">
            Know where you stand
            <br />
            <span className="text-[var(--color-periwinkle)]">
              before you transform.
            </span>
          </h1>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
            FraCTO assesses your organization across 8 dimensions of digital
            maturity — from infrastructure and data to culture and AI readiness
            — so you can invest with clarity, not guesswork.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/quick-scan")}
              className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white px-8 py-6 text-base"
            >
              Quick Scan (5 min)
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/assessment")}
              className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)] px-8 py-6 text-base"
            >
              Full Assessment
            </Button>
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-4">
            Quick Scan: 10 questions, instant score, no sign-up.
            Full Assessment: 70+ questions across your functional leads.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-plum)] text-center mb-4">
            How it works
          </h2>
          <p className="text-[var(--color-muted-foreground)] text-center mb-14 max-w-xl mx-auto">
            A structured, distributed assessment designed for enterprise
            reality — not another 500-question survey for one person.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.icon}
                className="border-border/50 hover:border-[var(--color-periwinkle)] transition-colors bg-[var(--color-background)]"
              >
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-periwinkle-lighter)] text-[var(--color-plum)] font-bold flex items-center justify-center mb-4 text-sm">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-[var(--color-plum)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dimensions */}
      <section id="dimensions" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-plum)] text-center mb-4">
            8 Dimensions of Digital Maturity
          </h2>
          <p className="text-[var(--color-muted-foreground)] text-center mb-14 max-w-xl mx-auto">
            Each dimension is scored 1-5 with a transparent rubric. Your results
            are visualized as a radar chart showing strengths and gaps at a
            glance.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dimensions.map((dim) => (
              <div
                key={dim}
                className="px-5 py-4 rounded-xl bg-white border border-border/50 hover:border-[var(--color-periwinkle)] transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--color-periwinkle)] mb-3" />
                <span className="text-sm font-medium text-[var(--color-plum)]">
                  {dim}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs Paid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[var(--color-plum)] text-center mb-14">
            What you get
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-[var(--color-periwinkle)]">
              <CardContent className="pt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-periwinkle)] mb-3">
                  Free
                </div>
                <h3 className="text-xl font-bold text-[var(--color-plum)] mb-4">
                  Maturity Assessment
                </h3>
                <ul className="space-y-3 text-sm text-[var(--color-plum)]">
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle)] font-bold">+</span>
                    Maturity score across 8 dimensions
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle)] font-bold">+</span>
                    Visual radar chart of strengths and gaps
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle)] font-bold">+</span>
                    Peer benchmarking (anonymized)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle)] font-bold">+</span>
                    Software stack classification
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle)] font-bold">+</span>
                    Summary of key findings
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-[var(--color-plum)] bg-[var(--color-plum)] text-white">
              <CardContent className="pt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-periwinkle-light)] mb-3">
                  Advisory
                </div>
                <h3 className="text-xl font-bold mb-4">
                  Transformation Roadmap
                </h3>
                <ul className="space-y-3 text-sm text-white/90">
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle-light)] font-bold">+</span>
                    Prioritized implementation plan (0-18 months + long term)
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle-light)] font-bold">+</span>
                    Stakeholder navigation strategy
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle-light)] font-bold">+</span>
                    Software stack rationalization
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle-light)] font-bold">+</span>
                    AI use case prioritization
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-periwinkle-light)] font-bold">+</span>
                    Fractional CTO advisory engagement
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--color-plum)] mb-4">
            Ready to assess your digital maturity?
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-8">
            Start with a 5-minute Quick Scan for an instant score, or take the
            full assessment for a deep dive. No sales pitch — just clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/quick-scan")}
              className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white px-8 py-6 text-base"
            >
              Quick Scan (5 min)
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/assessment")}
              className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)] px-8 py-6 text-base"
            >
              Full Assessment
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">F</span>
            </div>
            <span className="font-medium text-[var(--color-plum)]">
              FraCTO
            </span>
          </div>
          <span>Fractional CTO for Enterprise AI Transformation</span>
        </div>
      </footer>
    </div>
  );
}

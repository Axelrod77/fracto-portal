"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AuthGuard from "@/components/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";

interface Assessment {
  id: string;
  title: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      if (!sb) return;

      const { data } = await sb
        .from("assessments")
        .select("id, title, status, created_at, completed_at")
        .order("created_at", { ascending: false });

      setAssessments(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const createAssessment = async () => {
    const sb = getSupabase();
    if (!sb || !user) return;

    // Get user's org_id
    const { data: profile } = await sb
      .from("user_profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const { data, error } = await sb
      .from("assessments")
      .insert({
        org_id: profile.org_id,
        created_by: user.id,
        title: `Assessment — ${new Date().toLocaleDateString()}`,
      })
      .select("id")
      .single();

    if (error || !data) return;

    router.push(`/assessment?id=${data.id}`);
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-[var(--color-plum)]">
              FraCTO
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-[var(--color-periwinkle)] text-[var(--color-plum)] hover:bg-[var(--color-periwinkle-lighter)]"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-plum)]">
              Your Assessments
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
              Create, resume, or review past assessments.
            </p>
          </div>
          <Button
            onClick={createAssessment}
            className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white"
          >
            New Assessment
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-plum)] border-t-transparent animate-spin" />
          </div>
        ) : assessments.length === 0 ? (
          <Card className="border-border/50 bg-white">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-[var(--color-muted-foreground)] mb-4">
                No assessments yet. Create one to get started.
              </p>
              <Button
                onClick={createAssessment}
                className="bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white"
              >
                Create Your First Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assessments.map((a) => (
              <Card
                key={a.id}
                className="border-border/50 bg-white hover:border-[var(--color-periwinkle)] transition-colors cursor-pointer"
                onClick={() => {
                  if (a.status === "completed") {
                    router.push(`/results?id=${a.id}`);
                  } else {
                    router.push(`/assessment?id=${a.id}`);
                  }
                }}
              >
                <CardContent className="pt-4 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-plum)]">
                      {a.title}
                    </h3>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                      Created {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      a.status === "completed"
                        ? "border-green-300 text-green-700 bg-green-50"
                        : "border-[var(--color-periwinkle)] text-[var(--color-periwinkle)]"
                    }
                  >
                    {a.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

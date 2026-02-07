"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const sb = getSupabase();
    if (!sb) {
      setError("Supabase is not configured. Please set environment variables.");
      setLoading(false);
      return;
    }

    const { error: authError } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-[var(--color-plum)]">
            FraCTO
          </span>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <h1 className="text-xl font-bold text-[var(--color-plum)] mb-1">
              Sign in
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
              Enter your credentials to access your assessments.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--color-plum)]">
                  Email
                </Label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-[var(--color-periwinkle-lighter)] bg-transparent px-3 py-1 text-sm shadow-xs focus:border-[var(--color-periwinkle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-periwinkle)]/30"
                  placeholder="you@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[var(--color-plum)]">
                  Password
                </Label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-[var(--color-periwinkle-lighter)] bg-transparent px-3 py-1 text-sm shadow-xs focus:border-[var(--color-periwinkle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-periwinkle)]/30"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-plum)] hover:bg-[var(--color-plum-light)] text-white"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-sm text-center text-[var(--color-muted-foreground)] mt-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[var(--color-periwinkle)] hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-[var(--color-muted-foreground)] mt-4">
          Or{" "}
          <Link
            href="/assessment"
            className="text-[var(--color-periwinkle)] hover:underline"
          >
            take the assessment without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}

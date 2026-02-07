"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";

interface AppHeaderProps {
  /** Right-side content (e.g. ReportActions, badges) */
  actions?: React.ReactNode;
}

export default function AppHeader({ actions }: AppHeaderProps) {
  const router = useRouter();
  const { authenticated, user } = useAuth();

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    router.push("/");
  };

  return (
    <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push(authenticated ? "/dashboard" : "/")}
        >
          <div className="w-7 h-7 rounded-lg bg-[var(--color-plum)] flex items-center justify-center">
            <span className="text-white font-bold text-xs">F</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[var(--color-plum)]">
            FraCTO
          </span>
        </div>
        <div className="flex items-center gap-3">
          {actions}
          {authenticated && (
            <>
              <span className="text-xs text-[var(--color-muted-foreground)] hidden sm:inline">
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CleanerBottomNav } from "@/components/CleanerBottomNav";
import { createServerClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Settings } from "lucide-react";

interface CleanerLayoutProps {
  children: ReactNode;
}

export default async function CleanerLayout({ children }: CleanerLayoutProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "cleaner") {
    redirect("/login");
  }

  const fullName = profile?.full_name?.trim() || "Cleaner";
  const firstName = fullName.split(" ")[0] || "Cleaner";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-primary">
      <header className="sticky top-0 z-sticky h-14 border-b border-primary-border bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/90 shadow-sm">
        <div className="flex h-full items-center justify-between px-4 md:px-12">
          <div className="flex items-center gap-3">
            <Avatar src={profile?.avatar_url} initials={initials} size="sm" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-secondary-dim font-bold">Welcome</span>
              <span className="text-sm font-semibold text-white">
                Hi, {firstName}
              </span>
            </div>
          </div>
          <Link
            href="/cleaner/profile"
            className="text-secondary-dim hover:text-white transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 pb-24 md:px-12 md:py-8 lg:pb-8">
        {children}
      </main>

      <CleanerBottomNav />
    </div>
  );
}
